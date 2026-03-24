import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatUI from "../components/ChatUI";

const FREE_MESSAGE_LIMIT = 3;

export default function Chat() {
  const navigate = useNavigate();
  const [messageCount, setMessageCount] = useState(0);

  const handleNewMessage = () => {
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    if (newCount >= FREE_MESSAGE_LIMIT) {
      const isLoggedIn = localStorage.getItem("token");
      if (!isLoggedIn) {
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col overflow-hidden font-sans">
      <ChatUI onNewMessage={handleNewMessage} messageCount={messageCount} />
    </div>
  );
}