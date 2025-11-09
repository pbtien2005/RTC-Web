import React, { useState } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ChatArea } from "../components/chat/ChatArea";
export function Message() {
  const [selectedChat, setSelectedChat] = useState(0);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const conversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      lastMessage: "Hey! How are you doing?",
      time: "2m ago",
      unread: 3,
      online: true,
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      lastMessage: "Did you see the game last night?",
      time: "1h ago",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Emma Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      lastMessage: "Thanks for your help!",
      time: "3h ago",
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      lastMessage: "See you tomorrow 👋",
      time: "5h ago",
      unread: 1,
      online: false,
    },
    {
      id: 5,
      name: "Lisa Park",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
      lastMessage: "That sounds great!",
      time: "1d ago",
      unread: 0,
      online: true,
    },
  ];
  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Hey! How are you doing?",
      time: "10:30 AM",
      avatar: conversations[selectedChat].avatar,
    },
    {
      id: 2,
      sender: "me",
      text: "I'm doing great, thanks! How about you?",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "Pretty good! Just finished a big project at work.",
      time: "10:33 AM",
      avatar: conversations[selectedChat].avatar,
    },
    {
      id: 4,
      sender: "me",
      text: "Congratulations! That must feel amazing.",
      time: "10:35 AM",
    },
    {
      id: 5,
      sender: "other",
      text: "It really does! Want to grab coffee later to celebrate?",
      time: "10:36 AM",
      avatar: conversations[selectedChat].avatar,
    },
    {
      id: 6,
      sender: "me",
      text: "I'd love to! What time works for you?",
      time: "10:37 AM",
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log("Sending:", message);
      setMessage("");
    }
  };

  const handleSelectChat = (index) => {
    setSelectedChat(index);
    // setSidebarOpen(false);
  };
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        conversations={conversations}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        onClose={() => setSidebarOpen(false)}
      />
      <ChatArea
        conversation={conversations[selectedChat]}
        messages={messages}
        message={message}
        setMessage={setMessage}
        onSend={handleSendMessage}
        onOpenSidebar={() => setSidebarOpen(true)}
        showMenuButton={!sidebarOpen}
      />
    </div>
  );
}
