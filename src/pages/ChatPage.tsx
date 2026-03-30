// Legacy page - redirects to the active /chat route
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/chat", { replace: true }); }, [navigate]);
  return null;
}

