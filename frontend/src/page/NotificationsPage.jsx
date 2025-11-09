import { useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "chat_request",
      from_user: {
        user_id: 101,
        email: "student1@example.com",
        avatar_url: null,
      },
      message: "Yêu cầu chat mới từ student1@example.com",
      created_at: "2024-01-15T10:30:00",
      status: "pending",
    },
    {
      id: 2,
      type: "registration_request",
      from_user: {
        user_id: 102,
        email: "student2@example.com",
        avatar_url: "https://i.pravatar.cc/150?img=2",
      },
      message: "Yêu cầu đăng ký học từ student2@example.com",
      created_at: "2024-01-15T09:15:00",
      status: "pending",
    },
    {
      id: 3,
      type: "chat_request",
      from_user: {
        user_id: 103,
        email: "student3@example.com",
        avatar_url: "https://i.pravatar.cc/150?img=3",
      },
      message: "Yêu cầu chat mới từ student3@example.com",
      created_at: "2024-01-14T15:20:00",
      status: "accepted",
    },
    {
      id: 4,
      type: "registration_request",
      from_user: {
        user_id: 104,
        email: "student4@example.com",
        avatar_url: null,
      },
      message: "Yêu cầu đăng ký học từ student4@example.com",
      created_at: "2024-01-14T11:45:00",
      status: "rejected",
    },
    {
      id: 5,
      type: "chat_request",
      from_user: {
        user_id: 105,
        email: "teacher@example.com",
        avatar_url: "https://i.pravatar.cc/150?img=5",
      },
      message: "Yêu cầu chat mới từ teacher@example.com",
      created_at: "2024-01-13T08:00:00",
      status: "pending",
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAccept = (notificationId, type) => {
    showToast(
      `Đã chấp nhận ${
        type === "chat_request" ? "yêu cầu chat" : "yêu cầu đăng ký"
      }`,
      "success"
    );
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: "accepted" } : n
      )
    );
  };

  const handleReject = (notificationId, type) => {
    showToast(
      `Đã từ chối ${
        type === "chat_request" ? "yêu cầu chat" : "yêu cầu đăng ký"
      }`,
      "success"
    );
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: "rejected" } : n
      )
    );
  };

  const getAvatarColor = (email) => {
    const colors = [
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "chat") return n.type === "chat_request";
    if (filter === "registration") return n.type === "registration_request";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 max-w-md px-6 py-4 rounded-xl shadow-2xl border-2 ${
              toastType === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold">{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="ml-auto hover:opacity-70 transition-opacity"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">Quản lý các yêu cầu chat và đăng ký</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-1 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("chat")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              filter === "chat"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Chat (
            {notifications.filter((n) => n.type === "chat_request").length})
          </button>
          <button
            onClick={() => setFilter("registration")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              filter === "registration"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Đăng ký (
            {
              notifications.filter((n) => n.type === "registration_request")
                .length
            }
            )
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg
                className="w-20 h-20 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Không có thông báo
              </h3>
              <p className="text-gray-500">
                Bạn chưa có thông báo nào trong mục này
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${
                  notif.type === "chat_request"
                    ? "border-blue-500"
                    : "border-green-500"
                } ${
                  notif.status === "pending"
                    ? "bg-opacity-100"
                    : "bg-opacity-60"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {notif.from_user.avatar_url ? (
                        <img
                          src={notif.from_user.avatar_url}
                          alt="User Avatar"
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full ${getAvatarColor(
                            notif.from_user.email
                          )} flex items-center justify-center text-white text-lg font-bold`}
                        >
                          {getInitials(notif.from_user.email)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            notif.type === "chat_request"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {notif.type === "chat_request" ? (
                            <>
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              Chat Request
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Registration
                            </>
                          )}
                        </span>

                        {/* Status Badge */}
                        {notif.status !== "pending" && (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              notif.status === "accepted"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {notif.status === "accepted"
                              ? "Đã chấp nhận"
                              : "Đã từ chối"}
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-gray-900 font-medium mb-1">
                        {notif.from_user.email}
                      </p>
                      <p className="text-gray-600 text-sm mb-2">
                        {notif.message}
                      </p>

                      {/* Time */}
                      <p className="text-gray-500 text-xs">
                        {formatTime(notif.created_at)}
                      </p>

                      {/* Action Buttons */}
                      {notif.status === "pending" && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleAccept(notif.id, notif.type)}
                            className="flex-1 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Chấp nhận
                          </button>
                          <button
                            onClick={() => handleReject(notif.id, notif.type)}
                            className="flex-1 py-2 px-4 rounded-lg bg-white border-2 border-red-500 hover:bg-red-50 text-red-600 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
