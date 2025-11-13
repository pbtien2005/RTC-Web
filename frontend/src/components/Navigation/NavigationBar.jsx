// src/components/Navigation/NavigationBar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  MessageCircle,
  CalendarRange,
  Settings,
  Instagram,
  BellRing,
} from "lucide-react";

export const NavigationBar = () => {
  const [activeNav, setActiveNav] = useState("message");
  // const notificationCount = 3;
  const navigate = useNavigate();

  // 1. LẤY USER VÀ TÍNH TOÁN ĐƯỜNG DẪN TRANG CHỦ
  // Đọc thông tin user từ localStorage (đã có role)
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user ? user.role : "student";

  // Xác định đường dẫn HOME dựa trên vai trò
  const HOME_PATH = userRole === "coacher" ? "/coach/home" : "/";
  const REQUEST_PATH =
    userRole === "coacher" ? "/coach/dashboard" : "/requests/sent";

  const navItems = [
    { id: "instagram", icon: Instagram, label: "Instagram", path: "/" },
    {
      id: "home",
      icon: Home,
      label: "Home",
      path: HOME_PATH, // ✅ ÁP DỤNG: Điều hướng theo vai trò
    },
    {
      id: "calendar",
      icon: CalendarRange,
      label: "Lịch học",
      path: "/my-schedule",
    },
    { id: "message", icon: MessageCircle, label: "Tin nhắn", path: "/message" },
    {
      id: "notifications",
      icon: BellRing,
      label: "Thông báo",
      path: REQUEST_PATH,
    },
  ];

  return (
    // Container chính: Dùng Flex Column để quản lý vị trí
    <div className="fixed inset-y-0 w-20 bg-gradient-to-b from-[#E90000] to-[#FAA6FF] border-r border-[#ff1a1a] flex flex-col items-center py-6 space-y-6 transition-all duration-300 hover:w-21">
      {/* KHỐI 1: MAIN ICONS (Sử dụng flex-1 để đẩy khối dưới cùng xuống đáy) */}
      <div className="flex flex-col space-y-6 flex-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const isLogo = item.id === "instagram";

          return (
            <div
              key={item.id}
              className="w-full flex flex-col items-center group-hover:items-stretch group-hover:px-4"
            >
              <button
                onClick={() => {
                  setActiveNav(item.id);
                  navigate(item.path);
                }}
                className={`relative p-3 rounded-xl transition-all
                flex items-center justify-center           
                group-hover:justify-start group-hover:w-full
                gap-0 group-hover:gap-3                    
                ${
                  isActive
                    ? "bg-white/25 text-white backdrop-blur-sm scale-105"
                    : "text-white/80 hover:text-white hover:bg-white/15 hover:scale-105"
                }
                ${isLogo ? "mb-4" : ""}`}
                title={item.label}
              >
                <Icon
                  className={`w-6 h-6 ${isLogo ? "w-7 h-7" : ""} shrink-0`}
                />
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium max-w-0 group-hover:max-w-xs overflow-hidden">
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold group-hover:static group-hover:ml-auto transition-all">
                    {item.badge}
                  </span>
                )}
              </button>
              {index === 0 && (
                <div className="border-t border-white/25 w-12 group-hover:w-full mt-6 transition-all duration-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* ✅ KHỐI 2: AVATAR (DƯỚI CÙNG - ĐÃ ĐƯA LÊN GẦN ICONS) */}
      <div className="w-full flex justify-center group-hover:px-4 py-4 border-t border-white/25 mt-auto">
        {" "}
        {/* mt-auto đẩy lên khỏi Settings */}
        <Link to="/profile/edit" className="block">
          <button className="p-1 rounded-full ring-2 ring-white/60 bg-transparent hover:ring-4 transition-all hover:scale-110">
            <img
              src={user.avatar_url}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          </button>
        </Link>
      </div>

      {/* KHỐI 3: CÀI ĐẶT (Vị trí cuối cùng) */}
      <div className="w-full flex justify-center group-hover:px-4">
        <button className="p-3 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all hover:scale-110">
          <Settings className="w-6 h-8" />
        </button>
      </div>
    </div>
  );
};
