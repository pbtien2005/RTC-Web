// src/pages/EditProfilePage.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { useNotification } from "../hook/useNotification";
import NotificationToast from "../components/NotificationToast";
import { Save, Trash2, PlusCircle, Loader2, AlertCircle } from "lucide-react"; // Icon

export default function EditProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isCoacher = currentUser?.role === "coacher";
  // State cho form Profile
  const [formData, setFormData] = useState({
    full_name: "",
    job: "",
    phone: "",
    avatar_url: "",
    dob: "",
    introduction_text: "",
  });

  // State cho danh sách bằng cấp
  const [certificates, setCertificates] = useState([]); // <-- Khởi tạo mảng rỗng

  // State cho form "Thêm bằng cấp mới"
  const [newCert, setNewCert] = useState({ title: "", image_url: "" });

  // State tải trang và lưu
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCert, setSavingCert] = useState(false);
  const [error, setError] = useState(null);

  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // 1. Tải thông tin (profile + certificates)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Đổi tên biến thành 'response' cho rõ nghĩa
        const response = await apiFetch("/users/me/profile");

        // 2. ✅ THÊM DÒNG NÀY: Chuyển Response thành JSON
        const data = await response.json();

        // 3. Bây giờ 'data' mới là JSON bạn thấy (có certificates)
        const profileData = {
          full_name: data.full_name || "",
          job: data.job || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
          dob: data.dob ? data.dob.split("T")[0] : "",
          introduction_text: data.introduction_text || "",
        };

        setFormData(profileData);
        setCertificates(data.certificates || []); // <-- Giờ sẽ hoạt động
      } catch (err) {
        const errorMsg = err.detail || "Không thể tải thông tin profile";
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // Thêm mảng rỗng để đảm bảo nó chỉ chạy 1 lần

  // 2. Hàm xử lý cho Form Profile
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const payload = { ...formData };
    if (!payload.dob) payload.dob = null;

    try {
      await apiFetch("/users/me/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      showSuccess("Cập nhật thông tin thành công!");
    } catch (err) {
      showError(err.detail || "Cập nhật thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  // 3. Hàm xử lý cho Form Bằng cấp
  const handleCertChange = (e) => {
    const { name, value } = e.target;
    setNewCert((prev) => ({ ...prev, [name]: value }));
  };

  // --- HÀM THÊM BẰNG CẤP ---
  const handleAddCert = async (e) => {
    // ✅ FIX 1: Thêm dòng này làm dòng ĐẦU TIÊN
    // Ngăn trình duyệt reload lại trang khi submit form
    e.preventDefault();

    // ✅ FIX 2: Thêm kiểm tra đầu vào (nên có)
    if (!newCert.title || !newCert.image_url) {
      showError("Vui lòng điền đủ Tiêu đề và URL ảnh");
      return;
    }

    setSavingCert(true);

    try {
      // 1. Lấy response
      const response = await apiFetch("/users/me/certificates", {
        method: "POST",
        body: JSON.stringify(newCert),
      });

      // 2. Đọc JSON (ngay cả khi lỗi)
      const data = await response.json();

      // 3. ✅ FIX 3: KIỂM TRA LỖI (Quan trọng nhất)
      if (!response.ok) {
        // Ném lỗi vào 'catch' nếu status là 4xx, 5xx
        throw new Error(
          data.detail || "Server báo lỗi nhưng không có 'detail'"
        );
      }

      // 4. Chỉ chạy khi thành công (response.ok)
      setCertificates((prevCerts) => [...prevCerts, data]); // 'data' là createdCert
      setNewCert({ title: "", image_url: "" });
      showSuccess("Thêm bằng cấp thành công!");
    } catch (err) {
      // 5. 'catch' bây giờ sẽ hoạt động
      console.error("LỖI THÊM BẰNG CẤP:", err);
      showError(err.message || "Thêm bằng cấp thất bại");
    } finally {
      setSavingCert(false);
    }
  };

  // --- HÀM XÓA BẰNG CẤP ---
  const handleDeleteCert = async (certId) => {
    // Hỏi xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc muốn xóa bằng cấp này?")) return;

    try {
      // 1. Gọi API DELETE
      await apiFetch(`/users/me/certificates/${certId}`, {
        method: "DELETE",
      });

      // 2. Cập nhật UI (lọc bỏ bằng cấp đã xóa)
      setCertificates((prevCerts) =>
        prevCerts.filter((cert) => cert.id !== certId)
      );
      showSuccess("Xóa bằng cấp thành công!");
    } catch (err) {
      showError(err.detail || "Xóa thất bại");
    }
  };

  // --- Giao diện Loading / Error (Làm đẹp hơn) ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-red-500">
        <AlertCircle className="w-16 h-16 mb-4" />
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  // --- Giao diện Form chính ---
  return (
    // Sử dụng nền tối từ trang của bạn
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <NotificationToast
          notification={notification}
          onClose={hideNotification}
        />

        {/* === PHẦN 1: FORM PROFILE === */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <h1 className="text-2xl sm:text-3xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">
            Thông tin Cá nhân
          </h1>
          <form onSubmit={handleProfileSubmit}>
            <div className="p-6 space-y-6">
              {/* ✅ KHỐI MỚI: GIỚI THIỆU (CHỈ HIỂN THỊ CHO COACHER) */}
              {isCoacher && (
                <div className="md:col-span-2">
                  <label
                    htmlFor="introduction_text"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Giới thiệu bản thân (Hiển thị công khai)
                  </label>
                  <textarea
                    name="introduction_text"
                    id="introduction_text"
                    rows="5"
                    value={formData.introduction_text || ""}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                    placeholder="Ví dụ: Tôi có 10 năm kinh nghiệm phỏng vấn... chuyên về..."
                  />
                </div>
              )}
              {/* ... (input URL Ảnh đại diện) ... */}

              {/* Layout 2 cột cho form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Họ và Tên */}
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                  />
                </div>
                {/* Nghề nghiệp */}
                <div>
                  <label
                    htmlFor="job"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    name="job"
                    id="job"
                    value={formData.job}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                  />
                </div>
                {/* Số điện thoại */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                  />
                </div>
                {/* Ngày sinh */}
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dob"
                    id="dob"
                    value={formData.dob}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Link ảnh đại diện (1 cột) */}
              <div>
                <label
                  htmlFor="avatar_url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  URL Ảnh đại diện
                </label>
                <input
                  type="text"
                  name="avatar_url"
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                />
              </div>
            </div>
            {/* Nút Lưu (Footer của card) */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 text-right">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 py-2 px-6 border rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
              >
                {savingProfile ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {savingProfile ? "Đang lưu..." : "Lưu Thông tin"}
              </button>
            </div>
          </form>
        </div>

        {/* === PHẦN 2: QUẢN LÝ BẰNG CẤP === */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">
            Bằng cấp & Chứng chỉ
          </h2>

          {/* Danh sách bằng cấp hiện có */}
          <div className="p-6 space-y-3">
            {certificates.length > 0 ? (
              certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={cert.image_url}
                      alt={cert.title}
                      className="w-16 h-12 object-contain rounded bg-white p-1"
                    />
                    <span className="font-medium">{cert.title}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCert(cert.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                    title="Xóa bằng cấp"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                Bạn chưa thêm bằng cấp nào.
              </p>
            )}
          </div>

          {/* Form thêm bằng cấp mới */}
          <form onSubmit={handleAddCert}>
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="font-semibold text-lg">Thêm bằng cấp mới</h3>
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tiêu đề
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newCert.title}
                  onChange={handleCertChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                  placeholder="Ví dụ: IELTS 8.0"
                />
              </div>
              <div>
                <label
                  htmlFor="image_url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Link ảnh (URL)
                </label>
                <input
                  type="text"
                  name="image_url"
                  id="image_url"
                  value={newCert.image_url}
                  onChange={handleCertChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-indigo-400"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
            {/* Footer của form thêm */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 text-right">
              <button
                type="submit"
                disabled={savingCert}
                className="inline-flex items-center gap-2 py-2 px-5 border rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                {savingCert ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
