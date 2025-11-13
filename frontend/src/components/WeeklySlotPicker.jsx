// src/components/WeeklySlotPicker.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { addDays, formatDate, getWeekDays } from "../utils/dateUtils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function WeeklySlotPicker({
  coachId,
  selectedSlots,
  onSlotSelect,
}) {
  const [weekStart, setWeekStart] = useState(new Date()); // Bắt đầu từ hôm nay
  const [slotsByDay, setSlotsByDay] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch slots bất cứ khi nào tuần (weekStart) hoặc coachId thay đổi
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const startDate = formatDate(weekStart);
        const endDate = formatDate(addDays(weekStart, 6)); // Lấy 7 ngày

        const res = await apiFetch(
          `/coachers/${coachId}/slots?start_date=${startDate}&end_date=${endDate}`
        );
        const data = await res.json();

        // 2. Xử lý
        const slotsMap = {};
        data.forEach((slot) => {
          const dayKey = slot.start_at.split("T")[0]; // 'YYYY-MM-DD'
          if (!slotsMap[dayKey]) {
            slotsMap[dayKey] = [];
          }
          slotsMap[dayKey].push(slot);
        });
        setSlotsByDay(slotsMap);
        
      } catch (err) {
        setError("Không thể tải lịch rảnh");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [coachId, weekStart]);

  // 3. Xử lý UI
  const daysHeader = getWeekDays(weekStart);
  const weekEnd = addDays(weekStart, 6);

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // Dùng 24h
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Đặt lịch học
        </h2>
      </div>
      {/* Header: Điều hướng và Múi giờ */}
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
            {weekStart.toLocaleDateString("vi-VN", { month: "short", day: "numeric" })}
            {" - "}
            {weekEnd.toLocaleDateString("vi-VN", { month: "short", day: "numeric", year: "numeric" })}
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
                {/* Header (Wed 12) */}
                <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className="font-bold text-lg mb-4">
                  {day.getDate()}
                </p>
                
                {/* Danh sách slot */}
                <div className="flex flex-col gap-2">
                  {slotsForDay.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => onSlotSelect(slot.id)}
                        className={`py-2 px-1 text-sm font-semibold rounded-lg border-2 transition-colors
                          ${
                            isSelected
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white dark:bg-gray-700 border-indigo-500 text-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-600"
                          }
                        `}
                      >
                        {formatTime(slot.start_at)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}