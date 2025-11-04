export const ConversationItem = ({ conversation, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-purple-50 border-l-4 border-purple-600" : ""
      }`}
    >
      <div className="relative">
        <img
          src={conversation.avatar}
          alt={conversation.name}
          className="w-12 h-12 rounded-full"
        />
        {conversation.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">
            {conversation.name}
          </h3>
          <span className="text-xs text-gray-500">{conversation.time}</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-gray-600 truncate">
            {conversation.lastMessage}
          </p>
          {conversation.unread > 0 && (
            <span className="ml-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
