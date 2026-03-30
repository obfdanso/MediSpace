import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import ChatUI from "../components/ChatUI";
import ChatSidebar from "../../components/Sidebar";

const FREE_MESSAGE_LIMIT = 3;

export default function Chat() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const handleNewMessage = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    if (newCount >= FREE_MESSAGE_LIMIT && !isLoggedIn) {
      setTimeout(() => navigate("/auth"), 2000);
    }
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
    setSidebarRefreshKey(k => k + 1);
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white flex overflow-hidden font-sans">
      <ChatSidebar
        activeConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onNewChat={handleNewChat}
        refreshKey={sidebarRefreshKey}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <ChatUI
          onNewMessage={handleNewMessage}
          messageCount={messageCount}
          conversationId={selectedConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
