import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../api/api";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { ChatArea } from "../components/chat/ChatArea";

import { getCurrentUserId } from "../hook/GetCurrentUserId";
import { registerUI } from "../ws/dispatcher.js";
import { useVideoCall } from "../videoCall/VideoCallContext.jsx";
export function Message() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { requestCall } = useVideoCall();
  // Sử dụng ref để lưu giá trị mới nhất
  const selectedChatRef = useRef(selectedChat);
  const conversationsRef = useRef(conversations);

  // Cập nhật ref mỗi khi state thay đổi
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Đăng ký WebSocket handler
  useEffect(() => {
    const handlers = {
      addMessage: (msg) => {
        try {
          console.log("Received message from WebSocket:", msg);
          console.log(typeof msg);
          const currentConvId =
            conversationsRef.current[selectedChatRef.current]?.id;
          const currentUserId = getCurrentUserId();

          // Kiểm tra cấu trúc message
          if (!msg || !msg.data || !msg.data.conversation_id) {
            console.warn("Invalid message structure:", msg);
            return;
          }

          const messageData = msg.data;
          const senderId = msg.sender_id || msg.id; // sender_id từ root level của msg

          console.log("Processing message:", {
            currentConvId,
            messageConvId: messageData.conversation_id,
            senderId,
            currentUserId,
            match: messageData.conversation_id === currentConvId,
          });

          // Nếu tin nhắn thuộc cuộc chat đang mở → thêm vào messages
          if (messageData.conversation_id === currentConvId) {
            const newMessage = {
              id: messageData.message_id || messageData.id,
              sender: senderId === currentUserId ? "me" : "other",
              text: messageData.content,
              time: formatMessageTime(
                messageData.created_at || new Date().toISOString()
              ),
            };

            console.log("Adding message to chat:", newMessage);

            setMessages((prev) => [...prev, newMessage]);
          } else {
            // Nếu tin nhắn thuộc cuộc chat khác → tăng unread count
            console.log(
              "Updating unread count for conversation:",
              messageData.conversation_id
            );

            setConversations((prev) => {
              return prev.map((conv) => {
                if (conv.id === messageData.conversation_id) {
                  return {
                    ...conv,
                    lastMessage: messageData.content,
                    unread: (conv.unread || 0) + 1,
                    time: "Just now",
                  };
                }
                return conv;
              });
            });
          }
        } catch (error) {
          console.error("Error in addMessage handler:", error);
        }
      },
    };

    // Đăng ký handlers
    registerUI(handlers);

    // Cleanup function
    return () => {
      // Nếu có unregister function thì gọi ở đây
      // unregisterUI();
    };
  }, []); // Empty dependency array - chỉ đăng ký 1 lần

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
            receiver_id: conv.participant.id,
            name: conv.participant.name,
            avatar:
              conv.participant.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.participant.name}`,
            lastMessage: conv.lastMessage?.content || "No messages yet",
            unread: conv.unreadCount || 0,
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

            setMessages(transformedMessages);
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };

      fetchMessages();
    }
  }, [selectedChat, conversations]);

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

        if (res.ok) {
          const data = await res.json();
          const newMessage = {
            id: data.id,
            sender: "me",
            text: data.content,
            time: formatMessageTime(data.created_at),
            edited_at: data.edited_at,
          };

          setMessages((prev) => [...prev, newMessage]);
          setMessage("");

          // Update last message in conversations list
          setConversations((prev) => {
            const updated = [...prev];
            updated[selectedChat] = {
              ...updated[selectedChat],
              lastMessage: message.trim(),
              time: "Just now",
            };
            return updated;
          });
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  const handleSelectChat = (index) => {
    setSelectedChat(index);
    // Clear unread count when selecting chat
    setConversations((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unread: 0,
      };
      return updated;
    });
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
  const onCall = () => {
    return;
  };

  const onVideoCall = async () => {
    if (selectedChat !== null) {
      const conversation = conversations[selectedChat];
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      console.log(user);
      const callerInfo = {
        id: user.user_id,
        username: user.username,
        avatar_url: user.avatar_url,
      };
      const calleeInfo = {
        id: conversation.receiver_id,
        username: conversation.name,
        avatar_url: conversation.avatar,
      };
      console.log(callerInfo);
      console.log(calleeInfo);

      const success = await requestCall(
        conversation.id,
        callerInfo,
        calleeInfo
      );
      if (!success) {
        alert("Failed to request call");
      }
    }
  };
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
        onCall={onCall}
        onVideoCall={onVideoCall}
      />
    </div>
  );
}
