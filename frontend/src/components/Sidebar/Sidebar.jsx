import { ConversationsList } from "./ConversationsList";
import { SidebarHeader } from "./SidebarHeader";
import { ActiveFriends } from "./ActiveFriends";

export const Sidebar = ({
  isOpen,
  conversations,
  selectedChat,
  onSelectChat,
  onClose,
}) => {
  return (
    <div
      className={`${
        isOpen ? "w-80" : "w-0 "
      } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}
    >
      <SidebarHeader onClose={onClose} />
      <ActiveFriends conversations={conversations} />
      <ConversationsList
        conversations={conversations}
        selectedChat={selectedChat}
        onSelectChat={onSelectChat}
      />
    </div>
  );
};
