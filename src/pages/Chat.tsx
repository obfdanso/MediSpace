import ChatUI from "../components/ChatUI";

export default function Chat() {
  return (
    <div className="h-screen w-full bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col overflow-hidden font-sans">
      <ChatUI />
    </div>
  );
}
