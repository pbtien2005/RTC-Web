import { Outlet } from "react-router-dom";
import { NavigationBar } from "./components/Navigation/NavigationBar";
import "./App.css";
export default function AppLayout() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <div className="absolute left-0 top-0 bottom-0 h-full b-full">
        <div className="navigation-bar">
          <NavigationBar />
        </div>
      </div>

      <div className="ml-20 h-full bg-neutral-900">
        <Outlet /> {/* Hiển thị nội dung các trang con */}
      </div>
    </div>
  );
}
