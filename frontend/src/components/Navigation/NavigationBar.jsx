import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Send,
  Search,
  Menu,
  Home,
  Compass,
  Play,
  Heart,
  PlusSquare,
  Instagram,
  Grid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NavigationBar = () => {
  const [activeNav, setActiveNav] = useState("message");
  const notificationCount = 3;
  const navigate = useNavigate();
  const navItems = [
    { id: "instagram", icon: Instagram, label: "Instagram", path: "/" },
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "search", icon: Search, label: "Search", path: "/" },
    { id: "explore", icon: Compass, label: "Explore", path: "/" },
    { id: "reels", icon: Play, label: "Reels", path: "/" },
    { id: "message", icon: Send, label: "Messages", path: "/message" },
    {
      id: "notifications",
      icon: Heart,
      label: "Notifications",
      badge: notificationCount,
      path: "/",
    },
    { id: "create", icon: PlusSquare, label: "Create", path: "/" },
  ];
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user.avatar_url);

  return (
    <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        const isLogo = item.id === "instagram";

        return (
          <div key={item.id}>
            <button
              onClick={() => {
                setActiveNav(item.id);
                navigate(item.path);
              }}
              className={`relative p-3 rounded-xl transition-all !bg-white ${
                isActive
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
              } ${isLogo ? "mb-4" : ""}`}
              title={item.label}
            >
              <Icon className={`w-6 h-6 ${isLogo ? "w-7 h-7" : ""}`} />
              {item.badge && item.badge > 0 && (
                <span className="absolute  -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </button>
            {index === 0 && (
              <div className=" border-t border-gray-200 w-12 mx-auto mt-6"></div>
            )}
          </div>
        );
      })}

      <div className="flex-1"></div>

      <div className="pt-6 border-t border-gray-200">
        <button className="p-1 rounded-full ring-2 ring-purple-500 bg-transparent">
          <img
            src={user.avatar_url}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        </button>
      </div>

      <button className="p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
        <Menu className="w-6 h-6" />
      </button>
      <button className="p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
        <Grid className="w-6 h-6" />
      </button>
    </div>
  );
};
