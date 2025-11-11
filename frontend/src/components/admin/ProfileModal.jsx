/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { X, GraduationCap, User } from "lucide-react"; // --- THÊM MỚI 'User' ---
import { motion, AnimatePresence } from "framer-motion";
import { adminApi, API_BASE_URL } from "../../services/adminApi";

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};
const modalVariants = {
  visible: { opacity: 1, scale: 1 },
  hidden: { opacity: 0, scale: 0.95 },
};

// Component con để hiển thị từng dòng thông tin (dùng input disabled)
const ProfileInputRow = ({ label, value, type = "text", className = "" }) => (
  <div className={className}>
    {" "}
    {/* Nhận className (vd: col-span-3) */}
    <label className="block text-sm font-medium text-gray-500 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value ?? ""} // Chuyển null/undefined thành ""
      disabled
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed"
    />
  </div>
);

export default function ProfileModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coachers, setCoachers] = useState([]);
  const [students, setStudents] = useState([]); // --- THÊM MỚI ---

  // Tải dữ liệu chi tiết khi modal mở
  useEffect(() => {
    if (userId) {
      const fetchProfile = async () => {
        try {
          setLoading(true);
          setError(null);
          setCoachers([]); // Reset
          setStudents([]); // Reset

          // Gọi API 1: Lấy thông tin cơ bản
          const profileData = await adminApi.getUserProfile(userId);
          setUser(profileData);

          // --- SỬA ĐỔI LOGIC ---
          // Gọi API 2: Tùy theo role
          if (profileData.role === "student") {
            const coacherData = await adminApi.getStudentCoachers(userId);
            setCoachers(coacherData);
          } else if (profileData.role === "coacher") {
            const studentData = await adminApi.getCoacherStudents(userId);
            setStudents(studentData);
          }
          // -----------------------
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [userId]);

  // Hàm helper để format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getAvatarSrc = (user) => {
    if (!user) return `https://api.dicebear.com/7.x/avataaars/svg`; // Mặc định

    const url = user.avatar_url;

    if (!url) {
      // Nếu url là null/undefined
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
    }

    // Kiểm tra xem có phải link /static  không
    if (url.startsWith("/static/")) {
      return `${API_BASE_URL}${url}`; // Nối với link backend
    }

    // Nếu là link đầy đủ (kenh14, http://...), giữ nguyên
    if (url.startsWith("http")) {
      return url;
    }

    // Trường hợp dự phòng
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết Hồ sơ</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                className="flex justify-center items-center h-48"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
              </motion.div>
            ) : error ? (
              <motion.div key="error" className="text-red-500 text-center">
                <p>Lỗi: {error}</p>
              </motion.div>
            ) : user ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Phần Header Profile */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <img
                    src={getAvatarSrc(user)}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user.full_name || "(Chưa có tên)"}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span
                      className={`mt-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.is_active ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <ProfileInputRow
                    label="Họ và Tên"
                    value={user.full_name}
                    className="col-span-3"
                  />

                  <ProfileInputRow
                    label="Số điện thoại"
                    value={user.phone}
                    className="col-span-1"
                  />
                  <ProfileInputRow
                    label="Ngày sinh"
                    value={formatDate(user.dob)}
                    className="col-span-1"
                  />
                  <ProfileInputRow
                    label="Công việc"
                    value={user.job}
                    className="col-span-1"
                  />

                  {/* --- THÊM MỚI --- */}
                  <ProfileInputRow
                    label="Trường đại học"
                    value={user.university}
                    className="col-span-3"
                  />
                  {/* ------------------ */}

                  {/* --- Thông tin riêng của Student --- */}
                  {user.role === "student" && (
                    <>
                      <ProfileInputRow
                        label="Mục tiêu (Goal)"
                        value={user.goal}
                        className="col-span-3"
                      />
                      <ProfileInputRow
                        label="Slot Quota"
                        value={user.slot_quota}
                        type="number"
                        className="col-span-1"
                      />
                      <ProfileInputRow
                        label="Slot đã dùng"
                        value={user.slot_used}
                        type="number"
                        className="col-span-1"
                      />
                    </>
                  )}

                  {/* --- Thông tin riêng của Coacher --- */}
                  {user.role === "coacher" && (
                    <ProfileInputRow
                      label="Số học viên tối đa"
                      value={user.student_number || 0}
                      type="number"
                      className="col-span-1"
                    />
                  )}

                  {/* Thông tin hệ thống */}
                  <ProfileInputRow
                    label="Ngày tham gia"
                    value={formatDate(user.created_at)}
                    className="col-span-1"
                  />
                  <ProfileInputRow
                    label="Đăng nhập lần cuối"
                    value={formatDate(user.last_login_at)}
                    className="col-span-3"
                  />
                </div>

                {/* --- Coacher đã đăng ký (Chỉ cho Student) --- */}
                {user.role === "student" && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Coacher đã đăng ký ({coachers.length})
                    </h4>
                    {coachers.length > 0 ? (
                      <ul className="space-y-2">
                        {coachers.map((coach) => (
                          <li
                            key={coach.user_id}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                          >
                            <img
                              src={getAvatarSrc(coach)}
                              alt={coach.full_name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {coach.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {coach.email}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                coach.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {coach.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Chưa đăng ký coacher nào.
                      </p>
                    )}
                  </div>
                )}

                {/* --- THÊM MỚI: Học viên đã đăng ký (Chỉ cho Coacher) --- */}
                {user.role === "coacher" && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Học viên đã đăng ký ({students.length})
                    </h4>
                    {students.length > 0 ? (
                      <ul className="space-y-2">
                        {students.map((student) => (
                          <li
                            key={student.user_id}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-md"
                          >
                            <img
                              src={getAvatarSrc(student)}
                              alt={student.full_name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {student.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {student.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Chưa có học viên nào đăng ký.
                      </p>
                    )}
                  </div>
                )}
                {/* ------------------ */}

                {/* --- Phần Chứng chỉ --- */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Chứng chỉ
                  </h4>
                  {user.certificates && user.certificates.length > 0 ? (
                    <ul className="space-y-2">
                      {user.certificates.map((cert) => (
                        <li
                          key={cert.id}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                        >
                          <GraduationCap className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-medium text-gray-800">
                            {cert.title}
                          </span>
                          {cert.image_url && (
                            <a
                              href={`${API_BASE_URL}${cert.image_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-xs text-blue-500 hover:underline"
                            >
                              Xem ảnh
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Không có chứng chỉ nào.
                    </p>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
