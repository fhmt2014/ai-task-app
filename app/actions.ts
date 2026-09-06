// src/app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations";
export interface ActionResult {
  success: boolean;
  error?: string;
}
// 结构化返回类型
export type CreateTaskState = { ok: true } | { ok: false; error?: string };
// 内存数据存储（与 Day 8 共用）
// let tasks = [
//   { id: '1', title: '学习 Server Actions', completed: false },
// ]

export async function createTask(
  prevState: CreateTaskState | null,
  formData: FormData,
): Promise<CreateTaskState> {
  const title = formData.get("title") as string;

  // 1. 获取当前用户 session
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未登录");
  }
  // if (!title || title.trim().length === 0) {
  //   return { success: false, error: '标题不能为空' }
  // }

  // const newTask = {
  //   id: String(tasks.length + 1),
  //   title,
  //   completed: false,
  // }

  // tasks.push(newTask)
  // 1. 提取并校验
  const parsed = createTaskSchema.safeParse({
    title: formData.get("title"),
  });

  // 2. 校验失败 → 返回错误（不抛异常，让 UI 能优雅展示）
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message;
    return { ok: false, error: firstError || "输入无效" };
  }

  // 3. 校验通过 → 写数据库

  await prisma.task.create({
    data: {
      title: parsed.data.title,
      user: { connect: { id: session.user.id } },
    },
  });
  // 关键：重新验证 /tasks 页面的缓存
  revalidatePath("/tasks-server");

  // return { success: true, task: newTask }
  return { ok: true };
}

export async function toggleTaskComplete(id: string) {
  // const task = tasks.find(t => t.id === id)
  const task = await prisma.task.findUnique({ where: { id } });
  if (task) {
    // task.completed = !task.completed
    await prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
    revalidatePath("/tasks-server");
  }
}

export async function deleteTask(id: string) {
  // tasks = tasks.filter(t => t.id !== id)
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks-server");
}

export async function getTasks() {
  return await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
}
