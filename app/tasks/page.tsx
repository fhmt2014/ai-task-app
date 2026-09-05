"use client";
import React, { useState, useEffect } from "react";
interface Task {
  id: string;
  title: string;
  completed: boolean;
}
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // 初始化任务列表
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);
  // 创建任务
  const createTask = async () => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTitle("");
  };
  // 切换完成状态
  const toggleComplete = async (task: Task) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    const updated = await res.json();
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
  };
  // 删除任务
  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  };
  if (loading) return <p>加载中...</p>;
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">任务管理（Route Handlers）</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新任务标题"
          className="flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={createTask}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          添加
        </button>
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 p-3 border rounded"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task)}
            />
            <span
              className={task.completed ? "line-through text-gray-400" : ""}
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="ml-auto text-red-500"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
