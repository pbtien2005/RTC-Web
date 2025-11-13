// src/pages/CoachDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import WeeklySlotPicker from "../components/WeeklySlotPicker";
import { Loader2, AlertCircle, X } from "lucide-react";

export default function CoachDetailPage() {
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States cho Booking
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingMessage, setBookingMessage] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  // States cho Chat
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatIntro, setChatIntro] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const { coachId } = useParams();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Tải thông tin Coacher
  useEffect(() => {
    const fetchCoachDetails = async () => {
      if (!coachId) return;
      try {
        setLoading(true);
        setError(null);
        const profileRes = await apiFetch(`/coachers/${coachId}`);
        const profileData = await profileRes.json();
        setCoach(profileData);
      } catch (err) {
        console.error("Lỗi khi fetch chi tiết coach:", err);
        const errorMsg = err.detail || "Không thể tải thông tin Coacher";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchCoachDetails();
  }, [coachId]);

  // --- HÀM XỬ LÝ CHAT ---
  const handleMessage = async (e) => {
    e.preventDefault();
    if (!chatIntro) {
      showError("Vui lòng nhập lời nhắn.");
      return;
    }
    setIsSendingChat(true);
    try {
      const response = await apiFetch("/chat/request", {
        method: "POST",
        body: JSON.stringify({ target_id: coachId, intro_text: chatIntro }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Request thất bại");
      }

      showSuccess("Đã gửi yêu cầu chat thành công!");
      setIsChatModalOpen(false);
      setChatIntro("");
    } catch (err) {
      showError(err.message || "Gửi yêu cầu thất bại");
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Hàm chọn/bỏ chọn slot
  const handleSlotSelect = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
  };

  // --- HÀM XỬ LÝ BOOKING ---
  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      showError("Vui lòng chọn ít nhất một lịch rảnh.");
      return;
    }
    setIsBooking(true);
    try {
      const payload = {
        coacher_id: parseInt(coachId),
        slot_ids: selectedSlots,
        message: bookingMessage || null,
      };

      const response = await apiFetch("/booking/request", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const newBooking = await response.json();

      if (!response.ok) {
        throw new Error(newBooking.detail || "Đặt lịch thất bại");
      }

      showSuccess("Đã gửi yêu cầu đặt lịch thành công!");
      setSelectedSlots([]);
      setBookingMessage("");
    } catch (err) {
      showError(err.message || "Đặt lịch thất bại");
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  // --- Giao diện Loading / Error ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin text-pink-600" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:bg-gray-900 text-red-500">
        <AlertCircle className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }
  if (!coach) return null;

  // --- Giao diện chính ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <NotificationToast
        notification={notification}
        onClose={hideNotification}
      />

      <Link
        to="/"
        className="text-pink-600 dark:text-pink-400 hover:text-red-600 dark:hover:text-red-400 font-semibold mb-6 inline-flex items-center gap-2 transition-colors"
      >
        <span>←</span> Quay lại danh sách
      </Link>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* === PHẦN PROFILE === */}
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 h-24"></div>
          <div className="px-20 pb-20 -mt-13">
            <div className="flex flex-col md:flex-row md:items-end md:gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl mx-auto md:mx-0"
                  src={coach.avatar_url}
                  alt="Coach Avatar"
                />
              </div>
              {/* Tên & Job */}
              <div className="flex-1 text-center md:text-left mt-4 md:mt-0 md:mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {coach.full_name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mt-1">
                  {coach.job}
                </p>
              </div>
              {/* Nút Chat */}
              <div className="mt-6 md:mt-0 flex-shrink-0 md:mb-2">
                <button
                  onClick={() => setIsChatModalOpen(true)}
                  className="w-full md:w-auto py-3 px-8 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Gửi yêu cầu Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === PHẦN GIỚI THIỆU & BẰNG CẤP (2 CỘT) === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cột trái: Giới thiệu */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Giới thiệu về Coach
              </h2>
            </div>

            {coach.introduction_text ? (
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-left">
                {" "}
                {/* ✅ THÊM: text-left */}
                {coach.introduction_text}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-left">
                {" "}
                {/* ✅ THÊM: text-left */}
                Coach chưa cập nhật nội dung giới thiệu.
              </p>
            )}
          </div>

          {/* Cột phải: Bằng cấp */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Bằng cấp & Chứng chỉ
              </h2>
            </div>
            {coach.certificates && coach.certificates.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {coach.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border-2 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 rounded-xl p-3 text-center transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  >
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-full h-24 object-contain mb-2"
                    />
                    <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                      {cert.title}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Coacher chưa cập nhật bằng cấp.
              </p>
            )}
          </div>
        </div>
        {/* === PHẦN LỊCH RẢNH === */}
        <WeeklySlotPicker
          coachId={coachId}
          selectedSlots={selectedSlots}
          onSlotSelect={handleSlotSelect}
        />

        {/* === PHẦN LỜI NHẮN BOOKING === */}
        {selectedSlots.length > 0 && (
          <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-800 dark:to-gray-700 shadow-lg rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-900">
            <label
              htmlFor="bookingMessage"
              className="block text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2"
            >
              <span className="text-pink-600">✉</span> Gửi lời nhắn (Tùy chọn)
            </label>
            <textarea
              id="bookingMessage"
              rows="4"
              value={bookingMessage}
              onChange={(e) => setBookingMessage(e.target.value)}
              placeholder="Chia sẻ mục tiêu hoặc câu hỏi của bạn với Coach..."
              className="w-full p-4 border-2 border-pink-200 dark:border-pink-800 rounded-xl dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
            ></textarea>
          </div>
        )}

        {/* === NÚT ĐẶT LỊCH === */}
        {selectedSlots.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="py-4 px-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-2xl disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 transform hover:scale-105 hover:shadow-green-500/50 flex items-center gap-3"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Gửi yêu cầu đặt {selectedSlots.length} lịch</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* === MODAL GỬI YÊU CẦU CHAT === */}
      {isChatModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg">
            {/* Gradient header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 rounded-t-3xl"></div>

            {/* Nút đóng modal */}
            <button
              onClick={() => setIsChatModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors hover:rotate-90 transform duration-300"
            >
              <X size={28} />
            </button>

            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100 mt-2">
              Gửi lời nhắn
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Cho{" "}
              <span className="text-pink-600 dark:text-pink-400 font-semibold">
                {coach.full_name}
              </span>
            </p>

            <form onSubmit={handleMessage}>
              <textarea
                rows="5"
                value={chatIntro}
                onChange={(e) => setChatIntro(e.target.value)}
                placeholder="Xin chào! Tôi muốn trao đổi về..."
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl dark:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsChatModalOpen(false)}
                  className="py-3 px-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSendingChat}
                  className="py-3 px-8 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold disabled:from-gray-400 disabled:to-gray-500 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  {isSendingChat && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  {isSendingChat ? "Đang gửi..." : "Gửi ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
