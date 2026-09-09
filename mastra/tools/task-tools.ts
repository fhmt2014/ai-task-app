// mastra/tools/task-tools.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// 统一从 requestContext 取 userId，取不到按工具错误返回，不抛异常
async function getUserId(context: any): Promise<string | null> {
  const id =
    context?.requestContext?.get?.("userId") ??
    context?.runtimeContext?.get?.("userId"); // 老版本兜底
  return typeof id === "string" && id ? id : null;
}

export const createTaskTool = createTool({
  id: "create-task",
  description:
    "为当前登录用户创建任务，入参只要标题。当用户说'添加/记录/新建待办'时调用。",
  inputSchema: z.object({ title: z.string().describe("任务标题，简洁明了") }),
  outputSchema: z.object({
    success: z.boolean(),
    id: z.string().optional(),
    title: z.string().optional(),
    message: z.string(),
  }),
  requestContextSchema: z.object({ userId: z.string() }),
  execute: async ({ title }, context) => {
    const userId = await getUserId(context);
    if (!userId)
      return { success: false, message: "未获取到当前用户，无法创建任务" };
    const task = await prisma.task.create({ data: { title, userId } });
    return {
      success: true,
      id: task.id,
      title: task.title,
      message: `任务「${task.title}」已创建`,
    };
  },
});

export const listTasksTool = createTool({
  id: "list-tasks",
  description:
    "列出当前登录用户的所有任务。用户问'我有哪些任务/任务列表/待办/还有什么没做'必须直接调用，不要口头编造。",
  inputSchema: z.object({}),
  outputSchema: z.object({
    count: z.number(),
    tasks: z.array(
      z.object({ id: z.string(), title: z.string(), completed: z.boolean() }),
    ),
  }),
  requestContextSchema: z.object({ userId: z.string() }),
  execute: async (_input, context) => {
    const userId = await getUserId(context);
    if (!userId) return { count: 0, tasks: [] };
    const rows = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return {
      count: rows.length,
      tasks: rows.map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
      })),
    };
  },
});

export const completeTaskTool = createTool({
  id: "complete-task",
  description:
    "切换任务完成状态。done=true标记完成，false标记未完成。必须先list-tasks拿到真实id。",
  inputSchema: z.object({
    taskId: z.string().describe("任务ID，必须从list-tasks结果取"),
    completed: z.boolean().describe("true=完成, false=未完成").default(true),
  }),
  outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  requestContextSchema: z.object({ userId: z.string() }),
  execute: async ({ taskId, completed }, context) => {
    const userId = await getUserId(context);
    if (!userId)
      return { success: false, message: "未获取到当前用户，无法操作" };
    try {
      // where 同时锁 id+userId，别人任务查不到
      const task = await prisma.task.update({
        where: { id: taskId, userId },
        data: { completed },
      });
      return {
        success: true,
        message: `任务「${task.title}」已${completed ? "完成" : "标记为未完成"}`,
      };
    } catch {
      return { success: false, message: "任务不存在或无权限操作" };
    }
  },
});

export const deleteTaskTool = createTool({
  id: "delete-task",
  description: "删除当前用户的一个任务。必须先list-tasks拿到真实id。",
  inputSchema: z.object({
    taskId: z.string().describe("任务ID，必须从list-tasks结果取"),
  }),
  outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  requestContextSchema: z.object({ userId: z.string() }),
  execute: async ({ taskId }, context) => {
    const userId = await getUserId(context);
    if (!userId)
      return { success: false, message: "未获取到当前用户，无法操作" };
    try {
      const task = await prisma.task.delete({ where: { id: taskId, userId } });
      return { success: true, message: `任务「${task.title}」已删除` };
    } catch {
      return { success: false, message: "任务不存在或无权限操作" };
    }
  },
});

export const taskTools = {
  createTaskTool,
  listTasksTool,
  completeTaskTool,
  deleteTaskTool,
};
