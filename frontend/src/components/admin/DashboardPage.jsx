import { useEffect, useState } from "react";
import { adminApi, API_BASE_URL } from "../../services/adminApi";
import {
  Users,
  UserCheck,
  Award, // Icon cho ranking
} from "lucide-react";

// --- Helper Functions (Đặt bên ngoài) ---

// Hàm xử lý avatar (copy từ ProfileModal)
const getAvatarSrc = (user) => {
  if (!user) return `https://api.dicebear.com/7.x/avataaars/svg`;
  const url = user.avatar_url;
  if (!url) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  }
  if (url.startsWith("/static/")) {
    return `${API_BASE_URL}${url}`;
  }
  if (url.startsWith("http")) {
    return url;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
};

// Hàm format ngày
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// --- Helper Components (Đặt bên ngoài) ---

// 1. Thẻ thống kê (Đã bỏ "Active Sessions")
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// 2. Bảng xếp hạng Coacher (Mới)
const CoacherRankingCard = ({ ranking }) => {
  // Gán màu cho Top 3
  const getRankClass = (index) => {
    if (index === 0) return "bg-yellow-400 text-white border-yellow-500"; // Gold
    if (index === 1) return "bg-gray-300 text-gray-800 border-gray-400"; // Silver
    if (index === 2) return "bg-yellow-600 text-white border-yellow-700"; // Bronze
    return "bg-gray-100 text-gray-500 border-gray-200"; // Others
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-2 p-6 border-b">
        🏆 Coacher nổi bật nhất
      </h2>
      <ul className="divide-y divide-gray-100">
        {ranking.map((coacher, index) => (
          <li
            key={coacher.user_id}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Rank Number */}
            <span
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 ${getRankClass(
                index
              )}`}
            >
              {index + 1}
            </span>
            {/* Avatar */}
            <img
              src={getAvatarSrc(coacher)}
              alt={coacher.full_name}
              className="w-12 h-12 rounded-full object-cover border"
            />
            {/* Info */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {coacher.full_name || "(Chưa có tên)"}
              </p>
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                {coacher.student_count} học viên (approved)
              </p>
            </div>
            {/* Icon (Top 1) */}
            {index === 0 ? (
              <Award className="w-5 h-5 text-yellow-500" />
            ) : (
              <Award className="w-5 h-5 text-yellow-500 invisible" />
            )}
          </li>
        ))}
        {ranking.length === 0 && (
          <p className="p-4 text-sm text-gray-500 italic">
            Chưa có dữ liệu xếp hạng.
          </p>
        )}
      </ul>
    </div>
  );
};

// 3. Học viên mới nhất (Mới)
const LatestStudentsCard = ({ students }) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-900 mb-2 p-6 border-b">
        ✨ Học viên mới nhất
      </h2>
      <ul className="divide-y divide-gray-100">
        {students.map((student) => (
          <li
            key={student.user_id}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <img
              src={getAvatarSrc(student)}
              alt={student.full_name}
              className="w-12 h-12 rounded-full object-cover border"
            />
            {/* Info */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {student.full_name || "(Chưa có tên)"}
              </p>
              <p className="text-xs text-gray-500">{student.email}</p>
            </div>
            {/* Join Date */}
            <span className="text-xs text-gray-400">
              {formatDate(student.created_at)}
            </span>
          </li>
        ))}
        {students.length === 0 && (
          <p className="p-4 text-sm text-gray-500 italic">
            Chưa có học viên nào.
          </p>
        )}
      </ul>
    </div>
  );
};

// --- Component chính của trang Dashboard ---

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [coacherRanking, setCoacherRanking] = useState([]);
  const [latestStudents, setLatestStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Gọi 3 API song song
        const [statsData, rankingData, studentsResponse] = await Promise.all([
          adminApi.getStats(),
          adminApi.getCoacherRanking(5), // Lấy top 5
          adminApi.getStudents({ limit: 5, skip: 0 }), // Lấy 5 học viên mới nhất
        ]);

        setStats(statsData);
        setCoacherRanking(rankingData);
        setLatestStudents(studentsResponse.data); // API getStudents trả về { data: [...] }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );

  if (error) return <div className="text-red-500">Lỗi: {error}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Hàng 1: Thống kê chung (Đã bỏ 1 thẻ) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <StatCard
            title="Tổng số Học viên"
            value={stats.total_students}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Tổng số Coacher"
            value={stats.total_coachers}
            icon={<UserCheck className="w-6 h-6 text-white" />}
            color="bg-green-500"
          />
        </div>
      )}

      {/* Hàng 2: Bảng xếp hạng và Danh sách mới (Layout mới) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoacherRankingCard ranking={coacherRanking} />
        <LatestStudentsCard students={latestStudents} />
      </div>
    </div>
  );
}
