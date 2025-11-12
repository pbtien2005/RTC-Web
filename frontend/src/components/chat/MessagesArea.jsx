import { MessageItem } from "./MessageItem";
import { useRef, useEffect } from "react";
export const MessagesArea = ({ messages }) => {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {/* Mốc để scroll xuống */}
      <div ref={bottomRef} />
    </div>
  );
};
