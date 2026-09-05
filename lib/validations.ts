// src/lib/validations.ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "标题不能为空")
    .max(200, "标题最多 200 个字符"),
});

// 推导 TypeScript 类型（Zod v4 推荐写法）
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
