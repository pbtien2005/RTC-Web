// src/utils/dateUtils.js

/**
 * Trả về một ngày mới sau khi cộng/trừ.
 * @param {Date} date - Ngày bắt đầu.
 * @param {number} days - Số ngày muốn cộng (hoặc trừ).
 * @returns {Date}
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Định dạng ngày thành 'YYYY-MM-DD' cho API.
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

/**
 * Lấy 7 ngày (header) cho lịch.
 * @param {Date} startDate
 * @returns {Date[]}
 */
export const getWeekDays = (startDate) => {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};