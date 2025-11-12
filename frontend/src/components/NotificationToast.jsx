export default function NotificationToast({ notification, onClose }) {
  if (!notification) return null;

  const { message, type } = notification;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md px-6 py-4 rounded-xl shadow-2xl border-2 animate-slide-in ${
        type === "success"
          ? "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300"
          : "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300"
      }`}
    >
      <div className="flex items-center space-x-3">
        {type === "success" ? (
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span className="font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-auto hover:opacity-70 transition-opacity"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
