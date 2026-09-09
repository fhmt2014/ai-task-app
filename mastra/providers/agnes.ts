import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { auth } from "@/auth";
import { createTaskTools } from "@/lib/task-tools";
// 1. 创建 Agnes AI 兼容客户端
const agnes = createOpenAICompatible({
  name: "Agnes",
  apiKey: process.env.AGNES_API_KEY,
  baseURL: "https://apihub.agnes-ai.com/v1",
});

export const agnesChatModel = (model?: string) =>
  agnes(model ?? process.env.AGNES_CHAT_MODEL ?? "agnes-3.0-flash");
