// src/app/api/chat/route.ts
import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  stepCountIs,
  type UIMessage,
  createUIMessageStream,
} from "ai";
import { mastra } from "@/mastra";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { auth } from "@/auth";
import { createTaskTools } from "@/lib/task-tools";
import { toAISdkStream } from "@mastra/ai-sdk";
import { RequestContext } from "@mastra/core/request-context";
export const runtime = "nodejs";
// 1. 创建 Agnes AI 兼容客户端
const agnes = createOpenAICompatible({
  name: "Agnes",
  apiKey: process.env.AGNES_API_KEY,
  baseURL: "https://apihub.agnes-ai.com/v1",
});

export async function POST(req: Request) {
  console.log("AGNES_API_KEY:", process.env.AGNES_API_KEY);
  // 2. 前端 useChat 传来的是 UIMessage[]

  // 1. 先鉴权——没有 session 直接 401
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;

  // 2. 解析请求体
  const { messages }: { messages: UIMessage[] } = await req.json();

  // // 3. 用当前用户的 ID 创建工具集（工具内所有查询都绑定该用户）
  // const taskTools = createTaskTools(userId);

  // // 4. 调用模型
  // const result = streamText({
  //   model: agnes(process.env.AGNES_MODEL || "agnes-3.0-flash"),
  //   // system: "你是一个任务管理助手。用户可以让你帮忙拆解任务、生成任务列表、优化任务描述。请用简洁的中文回复。",
  //   // messages: await convertToModelMessages(messages),  // UIMessage[] → ModelMessage[]
  //   // instructions: `你是一个智能任务管理助手。你可以帮助用户：
  //   //                 1. 创建新任务（当用户想添加待办时调用 createTask）
  //   //                 2. 查看所有任务（当用户询问任务列表时调用 listTasks）
  //   //                 3. 标记任务完成/未完成（当用户完成某项任务时调用 completeTask）
  //   //                 4. 删除任务（当用户要移除任务时调用 deleteTask）

  //   //                 规则：
  //   //                 - 用简洁友好的中文回复
  //   //                 - 调用工具后，基于工具返回的结果给用户一个自然的确认
  //   //                 - 如果用户的话语模糊（例如'完成那个任务'但不指定哪个），先调用 listTasks 展示任务列表，再询问用户具体是哪一个
  //   //                 - 不要臆造任务 ID，必须从 listTasks 的结果中获取真实的 ID`,
  //   instructions: `你是一个智能任务管理助手。服务于当前登录用户。你的核心能力：

  //                   1. createTask - 创建新任务
  //                   2. listTasks - 查看所有任务
  //                   3. completeTask - 切换任务完成状态
  //                   4. deleteTask - 删除任务

  //                   行为准则：
  //                   - 你只能通过工具操作**当前用户**的任务
  //                   - 当用户提出一个复杂目标（如"上线个人博客"），你应该主动将其拆解为多个子任务，逐个调用 createTask 创建
  //                   - 拆解时遵循 MECE 原则（相互独立、完全穷尽），每个子任务应该是可执行的
  //                   - 当用户的话语涉及"那个"、"它"等代词时，先调用 listTasks 获取上下文，再决定操作哪个任务
  //                   - 调用工具后，用简洁的中文向用户确认操作结果
  //                   - 如果用户想查看任务，主动调用 listTasks 并以清晰的列表形式呈现
  //                   - 每次回复都要基于工具的真实返回，不要臆造数据`,

  //   messages: await convertToModelMessages(messages),

  //   // 关键：挂载工具
  //   tools: taskTools,

  //   // 关键：允许最多 5 步工具调用（多步推理）
  //   stopWhen: stepCountIs(5),
  // });

  // // 4. AI SDK 7 推荐的无状态写法（替代已废弃的 toUIMessageStreamResponse）
  // const uiStream = toUIMessageStream({
  //   stream: result.stream,
  //   originalMessages: messages, // 防止前端出现重复的 assistant 消息
  // });

  // return createUIMessageStreamResponse({ stream: uiStream });

  const rc = new RequestContext<{ userId: string }>();
  rc.set("userId", session.user.id);

  const agent = mastra.getAgent("taskAgent");
  const stream = await agent.stream(messages, {
    requestContext: rc,
    // 多步工具调用由 agent 自身控制；Mastra 用 maxSteps/类似 stopWhen 取决于版本
  });

  const uiStream = createUIMessageStream({
    originalMessages: messages, // 防前端重复 assistant
    execute: async ({ writer }) => {
      for await (const part of toAISdkStream(stream, { from: "agent" })) {
        await writer.write(part as any);
      }
    },
  });

  return createUIMessageStreamResponse({ stream: uiStream });
}
