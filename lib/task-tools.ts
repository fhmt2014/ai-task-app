// lib/task-tools.ts
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 工厂函数：接收 userId，返回绑定到该用户的工具集
export function createTaskTools(userId: string) {
  return {
    // 工具 1：创建任务（绑定 userId）
    createTask: tool({
      description:
        "创建一个新的任务。当用户表达想要做某事、添加待办、记录任务时使用。",
      inputSchema: z.object({
        title: z.string().describe("任务标题，简洁明了"),
      }),
      execute: async ({ title }) => {
        const task = await prisma.task.create({
          data: {
            title,
            userId, // ← 关键：任务归属当前用户
          },
        });
        revalidatePath("/tasks-server");
        revalidatePath("/");
        return {
          success: true,
          task: { id: task.id, title: task.title },
          message: `任务「${task.title}」已创建`,
        };
      },
    }),

    // 工具 2：查询任务列表（只返回当前用户的任务）
    listTasks: tool({
      description:
        "查看当前用户的所有任务。当用户问'我有哪些任务'、'待办清单'时使用。",
      inputSchema: z.object({}),
      execute: async () => {
        const tasks = await prisma.task.findMany({
          where: { userId }, // ← 关键：过滤条件
          orderBy: { createdAt: "desc" },
        });
        return {
          count: tasks.length,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
          })),
        };
      },
    }),

    // 工具 3：标记任务完成/未完成（验证归属）
    completeTask: tool({
      description: "切换任务的完成状态。当用户说'完成XX任务'时使用。",
      inputSchema: z.object({
        taskId: z.string().describe("要操作的任务 ID"),
        completed: z.boolean().describe("true=标记完成, false=标记未完成"),
      }),
      execute: async ({ taskId, completed }) => {
        try {
          // 关键：where 同时指定 taskId AND userId，防止越权操作
          const task = await prisma.task.update({
            where: {
              id: taskId,
              userId, // ← 越权操作会报错，因为找不到"别人的任务"
            },
            data: { completed },
          });
          revalidatePath("/tasks-server");
          revalidatePath("/");
          return {
            success: true,
            message: `任务「${task.title}」已${completed ? "完成" : "标记为未完成"}`,
          };
        } catch (error) {
          return {
            success: false,
            error: "任务不存在或无权限操作",
          };
        }
      },
    }),

    // 工具 4：删除任务（同样验证归属）
    deleteTask: tool({
      description: "删除一个任务。当用户说'删除XX'、'去掉XX任务'时使用。",
      inputSchema: z.object({
        taskId: z.string().describe("要删除的任务 ID"),
      }),
      execute: async ({ taskId }) => {
        try {
          const task = await prisma.task.delete({
            where: {
              id: taskId,
              userId, // ← 越权保护
            },
          });
          revalidatePath("/tasks-server");
          revalidatePath("/");
          return {
            success: true,
            message: `任务「${task.title}」已删除`,
          };
        } catch (error) {
          return {
            success: false,
            error: "任务不存在或无权限操作",
          };
        }
      },
    }),
  };
}
