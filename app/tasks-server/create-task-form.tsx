"use client";
import { useActionState } from "react";
import { createTask, type CreateTaskState } from "@/app/actions";
export function CreateTaskForm() {
  const [state, formAction, isPending] = useActionState<
    CreateTaskState | null,
    FormData
  >(createTask, null);

  return (
    <form action={formAction} className="flex gap-2 mb-6">
      <input
        name="title"
        placeholder="新任务标题"
        className="flex-1 px-3 py-2 border rounded"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {isPending ? "添加中..." : "添加"}
      </button>

      {state && !state.ok && state.error && (
        <p className="text-red-500 text-sm mt-2">{state.error}</p>
      )}
      {state?.ok && <p className="text-green-500 text-sm mt-2">添加成功！</p>}
    </form>
  );
}
