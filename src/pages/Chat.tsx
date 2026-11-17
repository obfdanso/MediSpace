import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import ChatUI from "../components/ChatUI";
import ChatSidebar from "../../components/Sidebar";

export default function Chat() {
  const { isLoggedIn } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // Once the free messages run out ChatUI locks the input and offers sign in,
  // so the last reply stays readable instead of being cut off by a redirect.
  const handleNewMessage = () => setMessageCount(c => c + 1);

  useEffect(() => {
    if (!isLoggedIn) setSelectedConversationId(null);
  }, [isLoggedIn]);

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
    setSidebarRefreshKey(k => k + 1);
  };

  const handleNewChat = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="h-dvh w-full bg-white dark:bg-black text-gray-900 dark:text-white flex overflow-hidden font-sans">
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
