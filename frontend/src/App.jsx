import "./App.css";
import { RegisterForm } from "./page/RegisterForm";
import { LoginForm } from "./page/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./page/Home";
import AppLayout from "./AppLayout";
import { Message } from "./page/message";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./components/admin/DashboardPage";
import StudentListPage from "./components/admin/StudentListPage";
import CoacherListPage from "./components/admin/CoacherListPage";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/message" element={<Message />} />
        </Route>

        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/students" element={<StudentListPage />} />
          <Route path="/admin/coachers" element={<CoacherListPage />} />
        </Route>

        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
