import "./App.css";
import { RegisterForm } from "./page/RegisterForm";
import { LoginForm } from "./page/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CoachList from "./page/CoachList";
import AppLayout from "./AppLayout";
import { Message } from "./page/Message";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationsPage from "./page/NotificationsPage";
import WebSocketProvider from "./ws/WebSocketProvider";
import { VideoCallProvider } from "./videoCall/VideoCallContext";
import { ws } from "./ws/socket";
import { IncomingCallPopup } from "./videoCall/IncomingCallPopup";
import { RingingScreen } from "./videoCall/RingingScreen";
import { VideoCallWindow } from "./videoCall/VideoCallWindow";
function App() {
  const wsUrl = `ws://localhost:8000/ws`;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <VideoCallProvider>
                <WebSocketProvider wsUrl={wsUrl}>
                  <AppLayout />
                  <IncomingCallPopup />
                  <RingingScreen />
                  <VideoCallWindow />
                </WebSocketProvider>
              </VideoCallProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<CoachList />} />
          <Route path="/message" element={<Message />} />
          <Route path="/notification" element={<NotificationsPage />} />
        </Route>

        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
