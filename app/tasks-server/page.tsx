// src/app/tasks-server/page.tsx
import {
  createTask,
  toggleTaskComplete,
  deleteTask,
  getTasks,
} from "@/app/actions";
import DeleteButton from "./delete-button";
import { CreateTaskForm } from "./create-task-form";
export const dynamic = "force-dynamic";
export default async function TasksServerPage() {
  // 在服务端直接取数据（Server Component 能力）
  const tasks = await getTasks();

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">任务管理（Server Actions）</h1>

      {/* 表单直接调用 Server Action，不需要手写 fetch */}
      <CreateTaskForm />

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded"
          >
            {/* 切换完成状态 */}
            <form action={toggleTaskComplete.bind(null, task.id)}>
              <button type="submit">{task.completed ? "✅" : "⬜️"}</button>
            </form>

            <span
              className={task.completed ? "line-through text-gray-400" : ""}
            >
              {task.title}
            </span>

            {/* 删除任务 */}
            {/* <form action={deleteTask.bind(null, task.id)} className="ml-auto">
              <button type="submit" className="text-red-500">
                删除
              </button>
            </form> */}
            <DeleteButton id={task.id} />
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
        <p className="text-gray-400 text-center mt-8">暂无任务，添加一个吧！</p>
      )}
    </div>
  );
}
