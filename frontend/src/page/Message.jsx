import React, { useState, useEffect } from "react";
import { apiFetch } from "../api/api";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ChatArea } from "../components/chat/ChatArea";
import { data } from "react-router-dom";
import { getCurrentUserId } from "../hook/GetCurrentUserId";

export function Message() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch danh sách conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/conversation", {
          method: "GET",
        });
        const data = await res.json();

        const list = Array.isArray(data.conversations)
          ? data.conversations
          : [];

        if (list) {
          // Transform API response to match component props
          const transformedConversations = list.map((conv) => ({
            id: conv.id,
            name: conv.participant.name,
            avatar:
              conv.participant.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant.name}`,
            lastMessage: conv.lastMessage?.content || "No messages yet",
            // time: formatTime(conv.updatedAt),
            unread: conv.unreadCount,
            online: conv.participant.isOnline,
          }));

          setConversations(transformedConversations);

          // Auto select first conversation
          if (transformedConversations.length > 0) {
            setSelectedChat(0);
          }
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages khi chọn conversation
  useEffect(() => {
    if (selectedChat !== null && conversations[selectedChat]) {
      const fetchMessages = async () => {
        try {
          const conversationId = conversations[selectedChat].id;
          const res = await apiFetch(
            `/conversation/${conversationId}/messages`,
            {
              method: "GET",
            }
          );
          const data = await res.json();
          const list = Array.isArray(data.messages) ? data.messages : [];

          if (list) {
            // Transform API messages to match component props
            const transformedMessages = list.map((msg) => ({
              id: msg.id,
              sender: msg.sender.id === getCurrentUserId() ? "me" : "other",
              text: msg.content,
              time: formatMessageTime(msg.created_at),
              avatar:
                msg.sender.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.username}`,
              edited_at: msg.edited_at,
            }));
            console.log(transformedMessages);
            setMessages(transformedMessages);
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };

      fetchMessages();
    }
  }, [selectedChat, conversations]);

  // Helper function to format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    // Less than 1 day
    else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // Less than 7 days
    else if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    // More than 7 days
    else {
      return date.toLocaleDateString();
    }
  };

  // Helper function to format message time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSendMessage = async () => {
    if (message.trim() && selectedChat !== null) {
      try {
        const conversationId = conversations[selectedChat].id;

        const res = await apiFetch(`/conversation/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            content: message.trim(),
          }),
        });

        if (res.success) {
          // Add new message to messages array
          const newMessage = {
            id: res.data.id,
            sender: "me",
            text: res.data.content,
            time: formatMessageTime(res.data.created_at),
            edited_at: res.data.edited_at,
          };

          setMessages((prev) => [...prev, newMessage]);
          setMessage("");

          // Update last message in conversations list
          const updatedConversations = [...conversations];
          updatedConversations[selectedChat] = {
            ...updatedConversations[selectedChat],
            lastMessage: message.trim(),
            time: "Just now",
          };
          setConversations(updatedConversations);
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  const handleSelectChat = (index) => {
    setSelectedChat(index);
    // Clear unread count when selecting chat
    const updatedConversations = [...conversations];
    updatedConversations[index] = {
      ...updatedConversations[index],
      unread: 0,
    };
    setConversations(updatedConversations);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No conversations yet</p>
          <p className="text-gray-500 text-sm">
            Start a new conversation to begin chatting
          </p>
        </div>
      </div>
    );
  }

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
        conversation={
          selectedChat !== null ? conversations[selectedChat] : null
        }
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
