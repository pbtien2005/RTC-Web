// src/pages/MySentRequestsPage.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import {
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  MessageSquare,
} from "lucide-react"; // Import thêm icons

// Helper lấy màu và icon cho status (đã cải tiến)
const getStatusClasses = (status) => {
  switch (status) {
    case "accepted":
    case "approved":
      return {
        bg: "bg-green-600/10 border-green-500",
        text: "text-green-600",
        icon: CheckCircle,
        label: "Đã chấp nhận",
      };
    case "declined":
    case "rejected":
      return {
        bg: "bg-red-600/10 border-red-500",
        text: "text-red-600",
        icon: XCircle,
        label: "Đã từ chối",
      };
    case "pending":
    default:
      return {
        bg: "bg-yellow-600/10 border-yellow-500",
        text: "text-yellow-600",
        icon: Clock,
        label: "Đang chờ",
      };
  }
};

export default function MySentRequestsPage() {
  const [requests, setRequests] = useState({ chats: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notification, showError, hideNotification } = useNotification();

  // 1. Fetch cả 2 loại request
  useEffect(() => {
    const fetchAllSentRequests = async () => {
      try {
        setLoading(true);
        // Dùng Promise.all để fetch song song
        const [chatRes, bookingRes] = await Promise.all([
          apiFetch("/chat/requests/sent").then((res) => res.json()),
          apiFetch("/booking/requests/sent").then((res) => res.json()),
        ]);

        setRequests({ chats: chatRes, bookings: bookingRes });
      } catch (err) {
        const errorMsg = err.detail || "Không thể tải các yêu cầu đã gửi";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSentRequests();
  }, []);

  // Helper hiển thị icon status
  const StatusBadge = ({ status }) => {
    const { text, icon: Icon, label } = getStatusClasses(status);
    return (
      // Đổi text-xs thành text-sm
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${text} bg-white dark:bg-gray-800 border-2 border-current`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </div>
    );
  };

  if (loading) {
    // ... (Loading code) ...
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (error) {
    // ... (Error code) ...
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-red-500">
        <AlertCircle className="w-16 h-16 mb-4" />{" "}
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-pink-50 dark:from-slate-900 dark:to-purple-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <NotificationToast
        notification={notification}
        onClose={hideNotification}
      />
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 max-w-6xl mx-auto">
        <Send className="w-8 h-8" /> Lịch sử Yêu cầu đã gửi
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* 1. YÊU CẦU ĐẶT LỊCH (BOOKING) */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-3 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" /> Booking
            Requests ({requests.bookings.length})
          </h2>
          <div className="space-y-4">
            {requests.bookings.length > 0 ? (
              requests.bookings.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border-2 ${
                    getStatusClasses(req.status).bg
                  } transition-shadow hover:shadow-md`}
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b dark:border-gray-700">
                    <p className="font-bold text-lg">
                      Coacher ID: {req.coacher_id}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm">
                    Gửi lúc: {new Date(req.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                    Số slot: {req.items.length}
                  </p>
                  <p className="text-xs italic mt-2">
                    Lời nhắn: {req.message || "Không có lời nhắn."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Không có Booking Request nào được gửi.
              </p>
            )}
          </div>
        </div>

        {/* 2. YÊU CẦU CHAT */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-3 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-purple-500" /> Chat Requests
            ({requests.chats.length})
          </h2>
          <div className="space-y-4">
            {requests.chats.length > 0 ? (
              requests.chats.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border-2 ${
                    getStatusClasses(req.status).bg
                  } transition-shadow hover:shadow-md`}
                >
                  <div className="flex justify-between items-center mb-3 pb-2 border-b dark:border-gray-700">
                    <p className="font-bold text-lg">
                      Target ID: {req.target_id}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-sm">
                    Gửi lúc: {new Date(req.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs italic mt-2">
                    Lời nhắn: {req.intro_text || "Không có lời nhắn."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Không có Chat Request nào được gửi.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
