// src/pages/MySchedulePage.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import { Loader2, AlertCircle, CalendarDays, Video } from "lucide-react";
// Giả sử bạn có AuthContext để lấy thông tin user hiện tại
// import { useAuth } from "../hook/useAuth";

export default function MySchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notification, showError, hideNotification } = useNotification();

  // const { user } = useAuth(); // Dùng để biết user là Student hay Coacher
  // Tạm thời hardcode, bạn nên thay bằng AuthContext
  const user = { role: "student" }; // HOẶC 'coacher'

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch("/sessions/me");
        const data = await response.json();

        setSessions(data);
      } catch (err) {
        console.error(err);
        const errorMsg = err.detail || "Không thể tải lịch học";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []); // Thêm mảng rỗng để chạy 1 lần

  const formatSessionTime = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Định dạng Ngày (VD: Thứ Tư, 13 tháng 11)
    const datePart = startDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // Định dạng Giờ (VD: 14:00 - 14:30)
    const timePart = `${startDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${endDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    return { datePart, timePart };
  };

  // --- Giao diện Loading / Error ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin" />
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
      <h1 className="text-3xl font-bold mb-8">Lịch học sắp tới</h1>

      <div className="max-w-3xl mx-auto space-y-6">
        {sessions.length > 0 ? (
          sessions.map((session) => {
            // Lấy thông tin của "người kia"
            const otherPerson =
              user.role === "student" ? session.coacher : session.student;
            const { datePart, timePart } = formatSessionTime(
              session.start_at,
              session.end_at
            );

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6"
              >
                {/* Ngày tháng */}
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {datePart}
                </p>
                {/* Giờ */}
                <p className="text-lg font-medium mb-4">{timePart}</p>

                <div className="border-t dark:border-gray-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Thông tin người kia */}
                  <div className="flex items-center gap-3">
                    <img
                      src={otherPerson?.user?.avatar_url}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.role === "student" ? "Coacher:" : "Học viên:"}
                      </p>
                      <p className="font-semibold">
                        {otherPerson?.user?.full_name}
                      </p>
                    </div>
                  </div>

                  {/* Nút vào học (link Google Meet/Zoom) */}
                  <a
                    href={session.meeting_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Vô hiệu hóa nút nếu Coacher chưa thêm link
                    className={`
                      inline-flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-white font-semibold
                      ${
                        !session.meeting_url
                          ? "bg-gray-400 cursor-not-allowed" // Xám
                          : "bg-green-600 hover:bg-green-700" // Xanh
                      }
                    `}
                    // Ngăn click nếu bị vô hiệu hóa
                    onClick={(e) => !session.meeting_url && e.preventDefault()}
                  >
                    <Video className="w-5 h-5" />
                    Vào phòng học
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          // Khi không có lịch nào
          <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-xl">
            <CalendarDays className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Không có lịch học nào sắp tới.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {user.role === "student"
                ? "Hãy đặt lịch với Coacher để bắt đầu!"
                : "Bạn chưa có buổi học nào được đặt."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
