import { Smile, Paperclip, Send } from "lucide-react";
export const MessageInput = ({ message, setMessage, onSend }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <button
          onClick={onSend}
          className="p-3 bg-gradient-to-b from-[#E90000] to-[#FAA6FF] hover:bg-purple-700 rounded-full transition-colors"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
