export function getCurrentUserId() {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;

    const user = JSON.parse(stored);
    return user.user_id || user.id || null;
  } catch (e) {
    console.error("Cannot parse user in getCurrentUserId:", e);
    return null;
  }
}
