import { Menu, Phone, Video, MoreVertical } from "lucide-react";
export const ChatHeader = ({
  conversation,
  onOpenSidebar,
  showMenuButton,
  onCall,
  onVideoCall,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        {showMenuButton && (
          <button
            onClick={onOpenSidebar}
            className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <img
          src={conversation.avatar}
          alt={conversation.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="ml-3">
          <h2 className="font-semibold text-gray-900">{conversation.name}</h2>
          <p className="text-xs text-green-500">
            {conversation.online ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={onCall}
        >
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={onVideoCall}
        >
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};
