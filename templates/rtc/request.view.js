// request-ui.js
export function showIncomingRequest(from, to, onAccept, onReject) {
  const nameEl = document.getElementById("incoming-from");
  nameEl.textContent = from;

  const modalEl = document.getElementById("incomingModal");
  const modal = new bootstrap.Modal(modalEl);

  const btnAccept = document.getElementById("btn-accept");
  const btnReject = document.getElementById("btn-reject");

  // Đăng ký "once" để tránh nhân đôi handler khi nhận nhiều request
  const handleAccept = () => {
    cleanup();
    onAccept?.();
  };
  const handleReject = () => {
    cleanup();
    onReject?.();
  };

  function cleanup() {
    btnAccept.removeEventListener("click", handleAccept);
    btnReject.removeEventListener("click", handleReject);
    modal.hide();
  }

  btnAccept.addEventListener("click", handleAccept, { once: true });
  btnReject.addEventListener("click", handleReject, { once: true });

  modal.show();
}
