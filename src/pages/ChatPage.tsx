import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import AuroraShaders from "@/components/ui/aurora";
import { workspaceStorage, type Workspace } from "@/lib/cohere";

export default function ChatPage() {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null
  );
  const [, setUpdateTrigger] = useState(0);

  const handleNewChat = () => {
    const newWorkspace = workspaceStorage.create("New Chat");
    setCurrentWorkspace(newWorkspace);
    setUpdateTrigger((prev) => prev + 1);
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    // Reload workspace to get latest messages
    const allWorkspaces = workspaceStorage.getAll();
    const updated = allWorkspaces.find((w) => w.id === workspace.id);
    setCurrentWorkspace(updated || workspace);
  };

  const handleWorkspaceUpdate = () => {
    if (currentWorkspace) {
      const allWorkspaces = workspaceStorage.getAll();
      const updated = allWorkspaces.find((w) => w.id === currentWorkspace.id);
      if (updated) {
        setCurrentWorkspace(updated);

        // Auto-rename workspace based on first message
        if (updated.messages.length === 1 && updated.name === "New Chat") {
          const firstMessage = updated.messages[0].content;
          const newName =
            firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
          workspaceStorage.update(updated.id, { name: newName });
        }
      }
    }
    setUpdateTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden relative">
      <div className="fixed inset-0 -z-10">
        <AuroraShaders
          speed={0.5}
          intensity={0.2}
          vibrancy={0.7}
          frequency={1.0}
          stretch={1.5}
        />
      </div>
      <Sidebar
        currentWorkspace={currentWorkspace}
        onWorkspaceSelect={handleWorkspaceSelect}
        onNewChat={handleNewChat}
      />
      <main className="flex-1 flex flex-col">
        <ChatInterface
          workspace={currentWorkspace}
          onWorkspaceUpdate={handleWorkspaceUpdate}
        />
      </main>
    </div>
  );
}

