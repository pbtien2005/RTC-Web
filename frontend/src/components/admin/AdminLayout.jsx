import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="fixed inset-0 flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 h-full overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
