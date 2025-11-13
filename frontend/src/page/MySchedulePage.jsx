// src/pages/MySchedulePage.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import { Loader2, AlertCircle, CalendarDays, Video, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const JOIN_THRESHOLD_MINUTES = 30;

export default function MySchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { notification, showError, hideNotification } = useNotification();
  const navigate = useNavigate();
  
  // Tạm thời hardcode, bạn nên thay bằng AuthContext
  const user = { role: 'student' }; // HOẶC 'coacher'

  /**
   * Kiểm tra xem người dùng có thể vào phòng học hay không.
   */
  const isJoinable = (startTime) => {
    if (!startTime) return false;
    const now = new Date();
    const sessionStartTime = new Date(startTime);
    const earliestJoinTime = new Date(sessionStartTime.getTime() - JOIN_THRESHOLD_MINUTES * 60000);
    return now >= earliestJoinTime;
  };

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
  }, []);

  const formatSessionTime = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const datePart = startDate.toLocaleDateString("vi-VN", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    
    const timePart = `${startDate.toLocaleTimeString("vi-VN", {
      hour: '2-digit', minute: '2-digit'
    })} - ${endDate.toLocaleTimeString("vi-VN", {
      hour: '2-digit', minute: '2-digit'
    })}`;
    
    return { datePart, timePart };
  };

  const handleJoinClick = (e, session) => {
    e.preventDefault(); 
    
    if (!isJoinable(session.start_at)) {
      const sessionStartTimeObj = new Date(session.start_at);
      const earliestJoinTime = new Date(sessionStartTimeObj.getTime() - JOIN_THRESHOLD_MINUTES * 60000);

      showError(
        `Chỉ có thể vào phòng từ ${earliestJoinTime.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} (${JOIN_THRESHOLD_MINUTES} phút trước giờ học).`
      );
      return;
    }
    
    navigate('/message');
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 blur-xl opacity-50 animate-pulse"></div>
            <Loader2 className="relative w-16 h-16 animate-spin text-purple-600" />
          </div>
          <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Đang tải lịch học...
          </p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="text-center">
          <div className="inline-block p-6 rounded-3xl bg-red-50 dark:bg-red-900/20 backdrop-blur-lg mb-4">
            <AlertCircle className="w-20 h-20 mx-auto text-red-500" />
          </div>
          <p className="text-xl font-semibold text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-12 px-6">
      <NotificationToast notification={notification} onClose={hideNotification} />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <CalendarDays className="w-10 h-10 text-purple-500" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Lịch Học Của Tôi
            </h1>
          </div>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
            {sessions.length > 0 
              ? `Bạn có ${sessions.length} buổi học sắp tới`
              : "Chưa có buổi học nào được đặt"
            }
          </p>
        </div>

        {/* Sessions Grid */}
        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sessions.map((session, index) => {
              const otherPerson = user.role === 'student' ? session.coacher : session.student;
              const { datePart, timePart } = formatSessionTime(session.start_at, session.end_at);
              const canJoin = isJoinable(session.start_at);

              return (
                <div
                  key={session.id}
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl border border-white/20 dark:border-gray-700/50 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-pink-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-6">
                    {/* Date & Time Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-3">
                          <CalendarDays className="w-4 h-4 text-white" />
                          <span className="text-sm font-bold text-white">
                            {datePart}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock className="w-5 h-5 text-purple-500" />
                          <span className="text-lg font-semibold">{timePart}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        canJoin 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {canJoin ? "Sẵn sàng" : "Chưa đến giờ"}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent mb-6"></div>

                    {/* User Info & Join Button */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
                          <img
                            src={otherPerson?.user?.avatar_url || "https://via.placeholder.com/48"}
                            alt="Avatar"
                            className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white/50 dark:ring-gray-700/50"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                            {user.role === 'student' ? "🎓 Coacher" : "📚 Học viên"}
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {otherPerson?.user?.full_name || "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Join Button */}
                      <button
                        onClick={(e) => handleJoinClick(e, session)}
                        className={`
                          relative inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-white shadow-lg
                          transition-all duration-300 hover:scale-105 active:scale-95
                          ${canJoin 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                            : "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600"
                          }
                        `}
                      >
                        <Video className="w-5 h-5" />
                        <span className="whitespace-nowrap">
                          {"Vào Phòng" }
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20">
            <div className="inline-block p-12 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg shadow-xl mb-6">
              <CalendarDays className="w-32 h-32 mx-auto text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Chưa có lịch học
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                {user.role === 'student'
                  ? "Hãy đặt lịch với Coacher để bắt đầu hành trình học tập!"
                  : "Bạn chưa có buổi học nào được đặt."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}