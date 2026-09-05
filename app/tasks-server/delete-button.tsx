"use client";
import React, { useTransition } from "react";
import { deleteTask } from "@/app/actions";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteTask(id))}
      disabled={isPending}
      className="text-red-500 disabled:opacity-50"
    >
      {isPending ? "删除中..." : "删除"}
    </button>
  );
}
