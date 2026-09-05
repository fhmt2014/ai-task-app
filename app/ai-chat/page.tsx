// src/app/ai-chat/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatComponent from "./ChatComponent"; // 把原来的客户端组件抽到这里

export default async function AiChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/?error=请先登录");
  }
  return <ChatComponent userName={session.user.name || "用户"} />;
}
