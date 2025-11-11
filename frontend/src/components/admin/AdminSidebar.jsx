import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, UserCheck } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/students", icon: Users, label: "Quản lý Học viên" },
  { href: "/admin/coachers", icon: UserCheck, label: "Quản lý Coacher" },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 h-full bg-gray-800 text-white flex flex-col">
      <div className="p-5 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-700">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <span>← Quay lại trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
