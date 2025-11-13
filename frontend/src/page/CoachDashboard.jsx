// src/pages/CoachDashboard.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import { Check, X, Loader2, AlertCircle } from "lucide-react";

export default function CoachDashboard() {
  const [chatRequests, setChatRequests] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // 1. Tải cả 2 danh sách yêu cầu
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dùng Promise.all để gọi song song
        const [chatRes, bookingRes] = await Promise.all([
          apiFetch("/chat/requests/received"),
          apiFetch("/booking/requests/received"),
        ]);

        // Giả sử apiFetch trả về Response, cần .json()
        const chatData = await chatRes.json();
        const bookingData = await bookingRes.json();

        setChatRequests(chatData);
        setBookingRequests(bookingData);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách yêu cầu");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []); // Chạy 1 lần

  // 2. Hàm xử lý yêu cầu Chat
  const handleChatResponse = async (requestId, action) => {
    try {
      // 1. Lấy response
      const response = await apiFetch(`/chat/request/${requestId}/respond`, {
        method: "PUT",
        body: JSON.stringify({ action: action }),
      });

      // 2. Đọc JSON
      const data = await response.json();

      // 3. ✅ KIỂM TRA LỖI
      if (!response.ok) {
        throw new Error(data.detail || "Xử lý thất bại");
      }

      // 4. Chỉ chạy khi thành công
      setChatRequests((prev) => prev.filter((req) => req.id !== requestId));
      showSuccess(`Đã ${action} yêu cầu chat.`);
    } catch (err) {
      // 5. Lỗi sẽ được bắt ở đây
      console.error("LỖI CHAT:", err); // <-- Thêm log này
      showError(err.message || "Xử lý thất bại");
    }
  };

  // 3. Hàm xử lý yêu cầu Booking
  const handleBookingResponse = async (requestId, action) => {
    try {
      // 1. Lấy response
      const response = await apiFetch(`/booking/request/${requestId}/respond`, {
        method: "PUT",
        body: JSON.stringify({ action: action }),
      });

      // 2. Đọc JSON (lỗi hoặc thành công)
      const data = await response.json();

      // 3. ✅ KIỂM TRA LỖI (QUAN TRỌNG)
      if (!response.ok) {
        // Ném lỗi nếu status là 4xx, 5xx
        throw new Error(data.detail || "Xử lý thất bại");
      }

      // 4. Chỉ chạy code này nếu response.ok (thành công)
      setBookingRequests(
        (prev) => prev.filter((req) => req.id !== requestId) // Xóa yêu cầu đã xử lý
      );
      showSuccess(`Đã ${action} yêu cầu đặt lịch.`);
    } catch (err) {
      // 5. Lỗi sẽ được bắt ở đây
      console.error("LỖI BOOKING:", err); // <-- Thêm log này
      showError(err.message || "Xử lý thất bại");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <NotificationToast
        notification={notification}
        onClose={hideNotification}
      />
      <h1 className="text-3xl font-bold mb-8">Danh sách các yêu cầu</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CỘT 1: YÊU CẦU ĐẶT LỊCH (BOOKING) */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Yêu cầu Đặt lịch</h2>
          <div className="space-y-4">
            {bookingRequests.length > 0 ? (
              bookingRequests.map((book) => (
                <div
                  key={book.id}
                  className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                >
                  <p className="font-semibold">Student ID: {book.student_id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Lời nhắn: {book.message || "(Không có)"}
                  </p>
                  <p className="text-sm font-medium">
                    Số slot: {book.items.length}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleBookingResponse(book.id, "approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Đồng ý
                    </button>
                    <button
                      onClick={() => handleBookingResponse(book.id, "reject")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Từ chối
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Không có yêu cầu đặt lịch nào.
              </p>
            )}
          </div>
        </div>

        {/* CỘT 2: YÊU CẦU CHAT */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Yêu cầu Chat</h2>
          <div className="space-y-4">
            {chatRequests.length > 0 ? (
              chatRequests.map((chat) => (
                <div
                  key={chat.id}
                  className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                >
                  <p className="font-semibold">
                    Requester ID: {chat.requester_id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Lời nhắn: {chat.intro_text || "(Không có)"}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleChatResponse(chat.id, "accept")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" /> Chấp nhận
                    </button>
                    <button
                      onClick={() => handleChatResponse(chat.id, "decline")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Từ chối
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Không có yêu cầu chat nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
