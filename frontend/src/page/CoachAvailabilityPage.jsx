// src/pages/CoachAvailabilityPage.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import {
  Trash2,
  PlusCircle,
  Loader2,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Helper để lấy ngày hôm nay (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Helper để hiển thị tên WEEPDAY
const WEEKDAYS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

export default function CoachAvailabilityPage() {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    weekday: 0, // 0 = Thứ 2
    start_time: "09:00",
    end_time: "17:00",
  });
  const [generateParams, setGenerateParams] = useState({
    start_date: getTodayDate(),
    days_to_generate: 30,
    slot_duration_minutes: 60,
  });

  const [loading, setLoading] = useState(true);
  const [savingRule, setSavingRule] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const navigate = useNavigate();

  // 1. Tải danh sách quy tắc (rules)
  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/coachers/me/availability");
        const data = await res.json();
        setRules(data);
      } catch (err) {
        showError(err.detail || "Không thể tải quy tắc rảnh");
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []); // Chạy 1 lần

  // 2. Xử lý form thêm quy tắc
  const handleRuleChange = (e) => {
    const { name, value } = e.target;
    setNewRule((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    setSavingRule(true);
    try {
      const payload = {
        ...newRule,
        weekday: parseInt(newRule.weekday), // Chuyển sang số
      };
      const res = await apiFetch("/coachers/me/availability", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const createdRule = await res.json();

      setRules((prev) => [...prev, createdRule]);
      showSuccess("Đã thêm quy tắc mới.");
    } catch (err) {
      showError(err.detail || "Thêm thất bại");
    } finally {
      setSavingRule(false);
    }
  };

  // 3. Xử lý xóa quy tắc
  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm("Bạn có chắc muốn xóa quy tắc này?")) return;
    try {
      await apiFetch(`/coachers/me/availability/${ruleId}`, {
        method: "DELETE",
      });
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      showSuccess("Đã xóa quy tắc.");
    } catch (err) {
      showError(err.detail || "Xóa thất bại");
    }
  };

  // 4. Xử lý form "Sinh Slot"
  const handleGenerateChange = (e) => {
    const { name, value } = e.target;
    setGenerateParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    setGeneratingSlots(true);
    try {
      const payload = {
        ...generateParams,
        days_to_generate: parseInt(generateParams.days_to_generate),
        slot_duration_minutes: parseInt(generateParams.slot_duration_minutes),
      };
      const res = await apiFetch("/coachers/me/generate-slots", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      showSuccess(`Đã tạo ${result.new_slots_created} lịch trống mới.`);
      navigate("/coach/my-slots");
    } catch (err) {
      showError(err.detail || "Tạo lịch thất bại");
    } finally {
      setGeneratingSlots(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <NotificationToast
        notification={notification}
        onClose={hideNotification}
      />
      <h1 className="text-3xl font-bold mb-8">
        Thiết lập lịch dạy
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT 1 & 2: DANH SÁCH QUY TẮC & THÊM MỚI */}
        <div className="lg:col-span-2 space-y-8">
          {/* Danh sách quy tắc hiện có */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Lịch trống trong tuần
            </h2>
            <div className="space-y-3">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                  >
                    <span className="font-mono text-lg font-medium">
                      {WEEKDAYS[rule.weekday]}: {rule.start_time} -{" "}
                      {rule.end_time}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Bạn chưa có quy tắc rảnh nào. Hãy thêm ở dưới.
                </p>
              )}
            </div>
          </div>

          {/* Form thêm quy tắc mới */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Thêm giờ rảnh trong tuần
            </h2>
            <form
              onSubmit={handleAddRule}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
            >
              <div>
                <label
                  htmlFor="weekday"
                  className="block text-sm font-medium mb-1"
                >
                  Ngày trong tuần
                </label>
                <select
                  name="weekday"
                  id="weekday"
                  value={newRule.weekday}
                  onChange={handleRuleChange}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  {WEEKDAYS.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="start_time"
                  className="block text-sm font-medium mb-1"
                >
                  Từ (Giờ)
                </label>
                <input
                  type="time"
                  name="start_time"
                  id="start_time"
                  value={newRule.start_time}
                  onChange={handleRuleChange}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label
                  htmlFor="end_time"
                  className="block text-sm font-medium mb-1"
                >
                  Đến (Giờ)
                </label>
                <input
                  type="time"
                  name="end_time"
                  id="end_time"
                  value={newRule.end_time}
                  onChange={handleRuleChange}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <button
                type="submit"
                disabled={savingRule}
                className="sm:col-span-3 mt-2 h-10 inline-flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {savingRule ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
                {savingRule ? "Đang thêm..." : "Thêm quy tắc"}
              </button>
            </form>
          </div>
        </div>

        {/* CỘT 3: SINH LỊCH TRỐNG */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 h-fit">
          <h2 className="text-2xl font-semibold mb-4">Tạo Lịch trống</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Dùng các quy tắc rảnh của bạn để tạo ra các lịch trống (OpenSlot)
            cho học sinh thấy.
          </p>
          <form onSubmit={handleGenerateSlots} className="space-y-4">
            <div>
              <label
                htmlFor="start_date"
                className="block text-sm font-medium mb-1"
              >
                Bắt đầu từ ngày
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={generateParams.start_date}
                onChange={handleGenerateChange}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label
                htmlFor="days_to_generate"
                className="block text-sm font-medium mb-1"
              >
                Trong vòng bao nhiêu ngày 
              </label>
              <input
                type="number"
                name="days_to_generate"
                id="days_to_generate"
                value={generateParams.days_to_generate}
                onChange={handleGenerateChange}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label
                htmlFor="slot_duration_minutes"
                className="block text-sm font-medium mb-1"
              >
                Độ 1 dài buổi học (phút)
              </label>
              <input
                type="number"
                name="slot_duration_minutes"
                id="slot_duration_minutes"
                value={generateParams.slot_duration_minutes}
                onChange={handleGenerateChange}
                step="15"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              disabled={generatingSlots}
              className="w-full h-11 inline-flex items-center justify-center gap-2 py-2 px-5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
            >
              {generatingSlots ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CalendarClock className="w-5 h-5" />
              )}
              {generatingSlots ? "Đang tạo..." : "Tạo Lịch Trống"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
