import { ConversationItem } from "./ConversationItem";

export const ConversationsList = ({
  conversations,
  selectedChat,
  onSelectChat,
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv, index) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={selectedChat === index}
          onClick={() => onSelectChat(index)}
        />
      ))}
    </div>
  );
};
