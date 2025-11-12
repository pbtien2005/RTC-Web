// ConversationsList.jsx
import { ConversationItem } from "./ConversationItem";

export const ConversationsList = ({
  conversations, // array: [{ id, receiver_id, name, ... }]
  selectedChat, // giữ receiver_id đang chọn
  onSelectChat, // (receiver_id) => void
}) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        // Hỗ trợ cả 2 kiểu tên trường phòng trường hợp bạn đã map khác
        const receiverId =
          conv.receiver_id ?? conv.receiverId ?? conv.receiverID;

        return (
          <ConversationItem
            key={String(receiverId)} // KHÔNG dùng index làm key
            conversation={conv}
            isSelected={selectedChat === receiverId} // so sánh theo receiver_id
            onClick={() => onSelectChat(receiverId)} // truyền receiver_id, không phải index
          />
        );
      })}
    </div>
  );
};
