// src/pages/MySlotsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import { addDays, formatDate, getWeekDays } from "../utils/dateUtils";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  XCircle, // Icon mới
} from "lucide-react";

// (Bạn có thể dùng AuthContext để lấy coach thay vì gọi API)
// import { useAuth } from "../hook/useAuth";

export default function MySlotsPage() {
  const [coach, setCoach] = useState(null); // Thông tin profile
  const [weekStart, setWeekStart] = useState(new Date()); // Tuần
  const [slotsByDay, setSlotsByDay] = useState({}); // Slots
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ STATE MỚI: Quản lý các slot được chọn để HỦY
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isCancelling, setIsCancelling] = useState(false);

  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // const { user } = useAuth(); // Lấy user từ context

  // 1. Tải thông tin Profile (chỉ 1 lần)
  useEffect(() => {
    const fetchMyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileRes = await apiFetch("/users/me/profile");
        const profileData = await profileRes.json();
        setCoach(profileData);
      } catch (err) {
        const errorMsg = err.detail || "Không thể tải thông tin";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []); // ✅ Mảng rỗng '[]' là chính xác

  // 2. ✅ SỬA LẠI: Định nghĩa hàm Fetch Slots ở bên ngoài
  const fetchSlotsForWeek = useCallback(async () => {
    // Nếu chưa có thông tin coach (đang tải), thì không gọi API
    if (!coach) return;

    setLoading(true); // Có thể dùng state loading riêng cho lịch
    try {
      const startDate = formatDate(weekStart);
      const endDate = formatDate(addDays(weekStart, 6));

      const res = await apiFetch(
        `/coachers/me/slots/calendar?start_date=${startDate}&end_date=${endDate}`
      );
      const data = await res.json();

      const slotsMap = {};
      data.forEach((slot) => {
        const dayKey = slot.start_at.split("T")[0];
        if (!slotsMap[dayKey]) slotsMap[dayKey] = [];
        slotsMap[dayKey].push(slot);
      });
      setSlotsByDay(slotsMap);
    } catch (err) {
      showError(err.detail || "Không thể tải lịch rảnh");
    } finally {
      setLoading(false);
    }
    // ✅ SỬA LẠI: Chỉ phụ thuộc vào 'coach' và 'weekStart'.
    // Xóa 'showError' để TRÁNH VÒNG LẶP.
  }, [coach, weekStart]);

  // 3. ✅ SỬA LẠI: Dùng useEffect để gọi hàm trên
  useEffect(() => {
    fetchSlotsForWeek();
  }, [fetchSlotsForWeek]);

  // 4. ✅ HÀM MỚI: Chọn/Bỏ chọn Slot để Hủy
  const handleSlotSelect = (slot) => {
    // Chỉ cho phép chọn slot 'open' hoặc 'on_hold'
    if (slot.status !== "open" && slot.status !== "on_hold") {
      showError(
        "Bạn chỉ có thể hủy slot 'open' hoặc 'on_hold'. Slot đã 'booked' phải được hủy qua trang Lịch học."
      );
      return;
    }

    const slotId = slot.id;
    setSelectedSlots(
      (prev) =>
        prev.includes(slotId)
          ? prev.filter((id) => id !== slotId) // Bỏ chọn
          : [...prev, slotId] // Chọn
    );
  };

  // 5. ✅ HÀM MỚI: Xử lý Hủy hàng loạt
  const handleCancelSelectedSlots = async () => {
    if (
      !window.confirm(
        `Bạn có chắc muốn HỦY ${selectedSlots.length} slot đã chọn?`
      )
    )
      return;

    setIsCancelling(true);

    // Gọi API hủy cho từng slot
    const cancelPromises = selectedSlots.map((slotId) =>
      apiFetch(`/coachers/me/slots/${slotId}/cancel`, { method: "PUT" })
        .then((res) => res.json().then((data) => ({ res, data })))
        .then(({ res, data }) => {
          if (!res.ok) throw new Error(data.detail || `Lỗi hủy slot ${slotId}`);
        })
    );

    try {
      // Chờ tất cả API chạy xong
      await Promise.allSettled(cancelPromises);

      showSuccess(`Đã xử lý hủy ${selectedSlots.length} slot.`);

      // Tải lại lịch rảnh cho tuần này
      fetchSlotsForWeek();
    } catch (err) {
      showError(err.message || "Có lỗi xảy ra khi hủy");
    } finally {
      setIsCancelling(false);
      setSelectedSlots([]); // Xóa lựa chọn
    }
  };

  // 6. Hàm helper
  const daysHeader = getWeekDays(weekStart);
  const weekEnd = addDays(weekStart, 6);
  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // 7. ✅ CẬP NHẬT: Màu sắc cho từng status + trạng thái "đang chọn"
  const getSlotStyle = (slot) => {
    const isSelected = selectedSlots.includes(slot.id);

    // Ưu tiên 1: Hiển thị trạng thái "đang chọn để hủy"
    if (isSelected) {
      return "bg-red-200 dark:bg-red-700 border-red-500 text-red-700 dark:text-red-100 ring-2 ring-red-500";
    }

    // Ưu tiên 2: Hiển thị status của slot
    switch (slot.status) {
      case "open":
        return "bg-green-100 dark:bg-green-800 border-green-500 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-700";
      case "on_hold":
        return "bg-yellow-100 dark:bg-yellow-800 border-yellow-500 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700";
      case "booked":
        return "bg-blue-100 dark:bg-blue-800 border-blue-500 text-blue-700 dark:text-blue-200 cursor-not-allowed opacity-70";
      case "cancelled":
        return "bg-gray-200 dark:bg-gray-700 border-gray-400 text-gray-500 line-through cursor-not-allowed opacity-70";
      default:
        return "bg-gray-100";
    }
  };

  // --- Giao diện Loading / Error ---
  if (loading && !coach) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-red-500">
        <AlertCircle className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  // --- Giao diện chính ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <NotificationToast
        notification={notification}
        onClose={hideNotification}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* === PHẦN PROFILE (Tái sử dụng layout) === */}
        {coach && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 flex flex-col md:flex-row md:items-center md:gap-8">
            <div className="flex-shrink-0 text-center">
              <img
                className="h-32 w-32 rounded-full object-cover mx-auto"
                src={coach.avatar_url}
                alt="Coach Avatar"
              />
            </div>
            <div className="flex-1 text-center md:text-left mt-6 md:mt-0">
              <h1 className="text-3xl font-bold">{coach.full_name}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {coach.job}
              </p>
            </div>
          </div>
        )}

        {/* === PHẦN LỊCH CỦA COACH === */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Xem và Hủy lịch trống
            </h2>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={prevWeek}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextWeek}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight size={20} />
              </button>
              <h3 className="text-lg font-semibold">
                {weekStart.toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                })}
                {" - "}
                {weekEnd.toLocaleDateString("vi-VN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Asia/Ho_Chi_Minh (GMT+7:00)
            </div>
          </div>

          {/* Lưới Lịch 7 Ngày */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {daysHeader.map((day) => {
                const dayKey = formatDate(day);
                const slotsForDay = slotsByDay[dayKey] || [];

                return (
                  <div key={dayKey} className="text-center">
                    <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </p>
                    <p className="font-bold text-lg mb-4">{day.getDate()}</p>

                    {/* ✅ CẬP NHẬT: Đổi <div> thành <button> */}
                    <div className="flex flex-col gap-2">
                      {slotsForDay.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot)}
                          // Vô hiệu hóa nút nếu đã booked hoặc cancelled
                          disabled={
                            slot.status === "booked" ||
                            slot.status === "cancelled"
                          }
                          className={`py-2 px-1 w-full text-sm font-semibold rounded-lg border-2 transition-all 
                                      ${getSlotStyle(slot)}`}
                          title={`Status: ${slot.status}`}
                        >
                          {formatTime(slot.start_at)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ✅ THÊM: Nút Hủy Lịch */}
        {selectedSlots.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCancelSelectedSlots}
              disabled={isCancelling}
              className="py-3 px-8 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-lg shadow-lg disabled:bg-gray-400"
            >
              {isCancelling ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  Hủy {selectedSlots.length} slot đã chọn
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
