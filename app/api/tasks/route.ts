import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
// 内存数据存储（生产环境用数据库替代）
// let tasks = [
//   { id: '1', title: '学习 Next.js Route Handlers', completed: true },
//   { id: '2', title: '学习 Server Actions', completed: false },
// ]
export async function GET(req: NextRequest) {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  const { searchParams } = req.nextUrl;
  const completed = searchParams.get("completed");
  if (completed !== null) {
    const filtered = tasks.filter(
      (t) => t.completed === (completed === "true"),
    );
    return NextResponse.json(filtered);
  }
  return NextResponse.json(tasks);
}
// POST /api/tasks —— 创建新任务
export async function POST(request: NextRequest) {
  const body = await request.json();
  // 1. 鉴权
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "未登录" }, { status: 401 });
  }
  // 简单验证
  if (!body.title || body.title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // const newTask = {
  //   id: String(tasks.length + 1),
  //   title: body.title,
  //   completed: false,
  // }

  // tasks.push(newTask)
  const task = await prisma.task.create({
    data: {
      title: body.title.trim(),
      user: { connect: { id: session.user.id } },
    },
  });
  return NextResponse.json(task, { status: 201 });
}
