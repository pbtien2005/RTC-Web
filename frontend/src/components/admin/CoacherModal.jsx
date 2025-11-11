/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { X, User, Plus, Trash2, GraduationCap, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { adminApi, API_BASE_URL } from "../../services/adminApi";

// Định nghĩa hiệu ứng
const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
const modalVariants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.95 },
};

// Component con FormInput (giống StudentModal)
const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 text-left">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
    />
  </div>
);

export default function CoacherModal({
  mode,
  coacher, // Đổi tên prop từ Student sang Coacher
  onClose,
  onSave,
  onDataChange,
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    dob: "",
    phone: "",
    job: "",
    university: "", // --- THÊM MỚI ---
    student_number: 0, // Đổi từ slot_quota
    is_active: true,
  });

  // State cho Avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);

  // State cho Certificate
  const [liveCertificates, setLiveCertificates] = useState([]);
  const [newCertTitle, setNewCertTitle] = useState("");
  const [newCertBase64, setNewCertBase64] = useState(null);
  const [newCertPreview, setNewCertPreview] = useState(null);
  const [certLoading, setCertLoading] = useState(false);

  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  // Hàm helper xử lý avatar (giống StudentModal)
  const getAvatarSrc = (url, email) => {
    if (!url) {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
    }
    if (url.startsWith("data:image")) {
      return url;
    }
    if (url.startsWith("/static/")) {
      return `${API_BASE_URL}${url}`;
    }
    if (url.startsWith("http")) {
      return url;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
  };

  // Load data khi modal mở
  useEffect(() => {
    // Reset state
    setFormData({
      email: "",
      password: "",
      full_name: "",
      dob: "",
      phone: "",
      job: "",
      university: "", // --- THÊM MỚI ---
      student_number: 0,
      is_active: true,
    });
    setAvatarPreview(null);
    setAvatarBase64(null);
    setLiveCertificates([]);
    setNewCertTitle("");
    setNewCertBase64(null);
    setNewCertPreview(null);

    // Nếu là chế độ Sửa, điền dữ liệu
    if (isEditMode) {
      setFormData({
        email: coacher.email || "",
        password: "",
        full_name: coacher.full_name || "",
        dob: coacher.dob || "",
        phone: coacher.phone || "",
        job: coacher.job || "",
        university: coacher.university || "", // --- THÊM MỚI ---
        student_number: coacher.student_number || 0,
        is_active: coacher.is_active,
      });
      setAvatarPreview(getAvatarSrc(coacher.avatar_url, coacher.email));
      setLiveCertificates(coacher.certificates || []);
    }
  }, [coacher, isEditMode]);

  // Handle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCertPreview(reader.result);
        setNewCertBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gửi form
  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };

    if (isEditMode) {
      delete dataToSend.email;
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      if (avatarBase64) {
        dataToSend.avatar_base64 = avatarBase64;
      }
    }

    onSave(dataToSend);
  };

  // --- Quản lý Chứng chỉ (giống StudentModal) ---
  const handleAddCertificate = async () => {
    if (!newCertTitle) {
      alert("Vui lòng nhập Tiêu đề chứng chỉ.");
      return;
    }
    setCertLoading(true);
    try {
      const newCert = await adminApi.addCertificate(coacher.user_id, {
        title: newCertTitle,
        image_base64: newCertBase64,
      });
      setLiveCertificates((prevCerts) => [...prevCerts, newCert]);
      if (onDataChange) onDataChange();
      setNewCertTitle("");
      setNewCertBase64(null);
      setNewCertPreview(null);
    } catch (err) {
      alert("Lỗi khi thêm chứng chỉ: " + err.message);
    } finally {
      setCertLoading(false);
    }
  };

  const handleDeleteCertificate = async (certId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chứng chỉ này?")) {
      setCertLoading(true);
      try {
        await adminApi.deleteCertificate(coacher.user_id, certId);
        setLiveCertificates((prevCerts) =>
          prevCerts.filter((c) => c.id !== certId)
        );
        if (onDataChange) onDataChange();
      } catch (err) {
        alert("Lỗi khi xóa chứng chỉ: " + err.message);
      } finally {
        setCertLoading(false);
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">
              {isEditMode ? "Sửa Coacher" : "Thêm Coacher mới"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body (Form) */}
          <div className="p-6 grid grid-cols-2 gap-x-6 gap-y-4 max-h-[70vh] overflow-y-auto">
            {/* Khối Upload Avatar (Chỉ khi Sửa) */}
            {isEditMode && (
              <div className="flex flex-col items-center gap-2 col-span-2">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed flex items-center justify-center">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("avatar-upload").click()
                  }
                  className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer px-5 py-2.5 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-all"
                >
                  Tải ảnh lên
                </button>
              </div>
            )}

            {/* Các trường */}
            <FormInput
              label="Email"
              name="email"
              type="email"
              required={true}
              disabled={isEditMode}
              className="col-span-2"
              value={formData.email}
              onChange={handleChange}
            />

            <FormInput
              label={
                isEditMode ? "Password (Bỏ trống nếu không đổi)" : "Password"
              }
              name="password"
              type="password"
              required={isAddMode}
              minLength={6} // Thêm validation
              className="col-span-2"
              value={formData.password}
              onChange={handleChange}
            />

            <FormInput
              label="Họ và Tên"
              name="full_name"
              className="col-span-2"
              value={formData.full_name}
              onChange={handleChange}
            />

            {/* Chỉ hiển thị các trường chi tiết khi Sửa */}
            {isEditMode && (
              <>
                <FormInput
                  label="Số điện thoại"
                  name="phone"
                  className="col-span-1"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <FormInput
                  label="Ngày sinh"
                  name="dob"
                  type="date"
                  className="col-span-1"
                  value={formData.dob}
                  onChange={handleChange}
                />

                <FormInput
                  label="Công việc"
                  name="job"
                  className="col-span-1"
                  value={formData.job}
                  onChange={handleChange}
                />

                {/* --- THÊM MỚI --- */}
                <FormInput
                  label="Trường đại học"
                  name="university"
                  className="col-span-1"
                  value={formData.university}
                  onChange={handleChange}
                />
                {/* ------------------ */}
              </>
            )}

            <FormInput
              label="Số học viên tối đa" // Đổi tên label
              name="student_number" // Đổi tên field
              type="number"
              required={true}
              className="col-span-2"
              value={formData.student_number} // Đổi tên field
              onChange={handleChange}
            />

            {/* Khối Checkbox (Luôn hiển thị) */}
            <div className="col-span-2 pt-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active_modal"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active_modal"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Tài khoản hoạt động (Cho phép đăng nhập)
                </label>
              </div>
            </div>

            {/* Phần Quản lý Chứng chỉ (Chỉ khi Sửa) */}
            {isEditMode && (
              <div className="col-span-2 space-y-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700">
                  Quản lý Chứng chỉ
                </h4>
                {/* Danh sách cert hiện có */}
                <div className="space-y-2">
                  {liveCertificates.length > 0 ? (
                    liveCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                      >
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        <span
                          className="flex-1 text-sm font-medium text-gray-800 truncate"
                          title={cert.title}
                        >
                          {cert.title}
                        </span>
                        {cert.image_url && (
                          <a
                            href={getAvatarSrc(cert.image_url, "")}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline"
                          >
                            Xem ảnh
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCertificate(cert.id)}
                          disabled={certLoading}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Chưa có chứng chỉ nào.
                    </p>
                  )}
                </div>
                {/* Form thêm cert mới */}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Tiêu đề*
                    </label>
                    <input
                      type="text"
                      value={newCertTitle}
                      onChange={(e) => setNewCertTitle(e.target.value)}
                      placeholder="Tên chứng chỉ"
                      className="mt-1 block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Ảnh (Tùy chọn)
                    </label>
                    <input
                      type="file"
                      id="cert-upload"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleCertFileChange}
                      className="hidden" // Giấu input gốc
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("cert-upload").click()
                      }
                      className="mt-1 w-full flex items-center justify-center gap-2 px-2 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {newCertPreview ? "Đã chọn ảnh" : "Chọn ảnh"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCertificate}
                    disabled={certLoading}
                    className="p-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400 cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {/* Preview ảnh chứng chỉ mới */}
                {newCertPreview && (
                  <div className="flex justify-center">
                    <img
                      src={newCertPreview}
                      alt="Xem trước"
                      className="h-20 rounded-md border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 cursor-pointer"
            >
              {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
