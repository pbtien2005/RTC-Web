export const MessageItem = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.sender === "me" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-end space-x-2 max-w-md ${
          message.sender === "me" ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        {message.sender === "other" && (
          <img
            src={message.avatar}
            alt="Avatar"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        <div>
          <div
            className={`px-4 py-2 rounded-2xl ${
              message.sender === "me"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white text-gray-900 rounded-bl-sm"
            }`}
          >
            <p>{message.text}</p>
          </div>
          <span className="text-xs text-gray-500 mt-1 block px-2">
            {message.time}
          </span>
        </div>
      </div>
    </div>
  );
};
