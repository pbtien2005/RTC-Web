import { useState, useEffect } from "react";

export default function CoachList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coachers, setCoachers] = useState([]);
  useEffect(() => {
    fetchCoaches();
  }, []);

  // 2. Hàm fetchCoaches đã được sửa lại
  const fetchCoaches = async () => {
    try {
      setLoading(true);
      setError(null); // Xóa lỗi cũ (nếu có) trước khi fetch

      const res = await fetch("http://localhost:8000/students/list_coachers");

      // Thêm kiểm tra nếu response không thành công (vd: 404, 500)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setCoachers(data);
    } catch (err) {
      // 3. Khối catch này BÂY GIỜ sẽ bắt lỗi nếu fetch thất bại
      console.error("lỗi khi fetch list coach:", err);
      setError("Failed to load coaches"); // Set state lỗi
    } finally {
      // 4. Khối finally LUÔN LUÔN chạy, dù fetch thành công hay thất bại
      setLoading(false);
    }
  };

  // Generate avatar color from email
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
      "bg-orange-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from email
  const getInitials = (email) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Handle register
  const handleRegister = async (coachId) => {
    try {
      // TODO: Call API đăng ký
      // const response = await fetch(`http://localhost:8000/students/register/${coachId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });

      alert(`Đã đăng ký với coach ID: ${coachId}`);
      console.log("Register with coach:", coachId);
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  // Handle message
  const handleMessage = (coachId) => {
    // TODO: Navigate to message page or open chat
    // navigate(`/messages/${coachId}`);

    alert(`Mở chat với coach ID: ${coachId}`);
    console.log("Message coach:", coachId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading coaches...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-500">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Available Coaches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and connect with our {coachers.length} professional coaches
          </p>
        </div>

        {/* Coach Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {coachers.map((coach) => (
            <div
              key={coach.user_id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                {coach.avatar_url ? (
                  // Nếu CÓ avatar_url, dùng thẻ <img>
                  <img
                    src={coach.avatar_url}
                    alt="Coach Avatar"
                    className="w-20 h-20 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  // Nếu KHÔNG CÓ avatar_url, dùng code cũ của bạn (hiển thị chữ cái)
                  <div
                    className={`w-20 h-20 rounded-full ${getAvatarColor(
                      coach.email
                    )} flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {getInitials(coach.email)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-center space-y-3">
                {/* ID Badge */}
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
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
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                  ID: {coach.user_id}
                </div>

                {/* Email */}
                <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium truncate">
                    {coach.email}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mt-4">
                  {/* Đăng ký Button */}
                  <button
                    onClick={() => handleRegister(coach.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Đăng ký</span>
                  </button>

                  {/* Nhắn tin Button */}
                  <button
                    onClick={() => handleMessage(coach.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-indigo-600 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-600 text-indigo-600 dark:text-indigo-400 font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2"
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>Nhắn tin</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {coachers.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No coaches available
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Check back later for new coaches
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
