// src/pages/CoachHome.jsx
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  User,
} from "lucide-react";

const navLinks = [
  {
    icon: LayoutDashboard,
    title: "Danh sách yêu cầu",
    description: "Xem các yêu cầu chat và đặt lịch đang chờ duyệt.",
    path: "/coach/dashboard",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
  },
  {
    icon: CalendarDays,
    title: "Lịch của tôi",
    description: "Xem các buổi học đã xác nhận và sắp diễn ra.",
    path: "/my-schedule",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/30",
  },
  {
    icon: Clock,
    title: "Quản lý Lịch rảnh",
    description: "Thiết lập lịch dạy trong tuần",
    path: "/coach/availability",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    icon: User,
    title: "Chỉnh sửa Hồ sơ",
    description: "Cập nhật thông tin cá nhân và bằng cấp của bạn.",
    path: "/profile/edit",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/30",
  },
];

// Component Card Điều hướng
function NavCard({ icon: Icon, title, description, path, color, bgColor }) {
  return (
    <Link
      to={path}
      className={`
        block p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl 
        transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group
        border-2 border-transparent hover:border-pink-500 // Viền hover mạnh
        text-center 
      `}
    >
      {/* Container Icon: Loại bỏ lớp p-0.5, dùng solid background mạnh */}
      <div className="flex justify-center mb-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white 
                        bg-gradient-to-br from-pink-600 to-red-600 shadow-lg shadow-red-500/30`} // Màu sắc rực rỡ từ thanh nav
          >
            <Icon className="w-6 h-6" />
          </div>
      </div>
      
      {/* Text nội dung */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Link>
  );
}

// Component Trang chủ (Sửa màu nền trang)
export default function CoachHome() {
  return (
    // ✅ Sửa: Dùng màu nền mạnh hơn (ví dụ: dark mode slate-900)
    <div 
      className="min-h-screen bg-gray-100 dark:bg-slate-900 p-4 sm:p-8"
    >
      <div className="max-w-5xl mx-auto pt-16">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-12">
          Trang chủ Coacher
        </h1>
        
        {/* Lưới các card điều hướng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ... (map các NavCard) ... */}
          {navLinks.map((link) => (
            <NavCard
              key={link.path}
              icon={link.icon}
              title={link.title}
              description={link.description}
              path={link.path}
              color={link.color}
              bgColor={link.bgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}