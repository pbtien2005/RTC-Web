import "./App.css";
import { RegisterForm } from "./page/RegisterForm";
import { LoginForm } from "./page/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CoachList from "./page/CoachList";
import CoachDetailPage from "./page/CoachDetailPage"; 
import EditProfilePage from "./page/EditProfilePage";
import CoachAvailabilityPage from "./page/CoachAvailabilityPage";
import CoachDashboard from "./page/CoachDashboard"; 
import CoachHome from "./page/CoachHome"; 
import MySchedulePage from "./page/MySchedulePage";
import MySlotsPage from "./page/MySlotsPage";
import MySentRequestsPage from "./page/MySentRequestsPage";

import AppLayout from "./AppLayout";
import { Message } from "./page/message";
import ProtectedRoute from "./components/ProtectedRoute";

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
          {/* ✅ THÊM TRANG CHỦ MỚI VÀO ĐÂY */}
          <Route path="/coach/home" element={<CoachHome />} />

          {/* (Các route cũ của bạn) */}
          <Route path="/coach/dashboard" element={<CoachDashboard />} />
          <Route path="/coach/availability" element={<CoachAvailabilityPage />} />
          <Route path="/my-schedule" element={<MySchedulePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/coach/my-slots" element={<MySlotsPage />} />
          <Route path="/" element={<CoachList />} />
          <Route path="/message" element={<Message />} />
          <Route path="/coacher/:coachId" element={<CoachDetailPage />} />
          <Route path="/requests/sent" element={<MySentRequestsPage />} />
        </Route>

        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;