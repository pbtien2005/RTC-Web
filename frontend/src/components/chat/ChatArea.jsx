import { ChatHeader } from "./ChatHeader";
import { MessagesArea } from "./MessagesArea";
import { MessageInput } from "./MessageInput";
export const ChatArea = ({
  conversation,
  messages,
  message,
  setMessage,
  onSend,
  onOpenSidebar,
  showMenuButton,
  onCall,
  onVideoCall,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader
        conversation={conversation}
        onOpenSidebar={onOpenSidebar}
        showMenuButton={showMenuButton}
        onCall={onCall}
        onVideoCall={onVideoCall}
      />
      <MessagesArea messages={messages} />
      <MessageInput message={message} setMessage={setMessage} onSend={onSend} />
    </div>
  );
};
