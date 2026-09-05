// src/app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 内存数据存储（生产环境用数据库替代）
// let tasks = [
//   { id: '1', title: '学习 Next.js Route Handlers', completed: false },
//   { id: '2', title: '学习 Server Actions', completed: false },
// ]
// 注意：Next.js 15+ 中 params 是 Promise，必须 await
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // ← 先 await 再解构
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  // const index = tasks.findIndex(t => t.id === id)
  // if (index === -1) {
  //   return NextResponse.json(
  //     { error: 'Task not found' },
  //     { status: 404 }
  //   )
  // }

  // tasks[index] = { ...tasks[index], ...body }
  const task = await prisma.task.update({
    where: { id },
    data: { completed: body.completed },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // const index = tasks.findIndex(t => t.id === id)

  // if (index === -1) {
  //   return NextResponse.json(
  //     { error: 'Task not found' },
  //     { status: 404 }
  //   )
  // }

  // tasks.splice(index, 1)
  await prisma.task.delete({ where: { id } });
  return new NextResponse(null, { status: 204 }); // 204 No Content
}
