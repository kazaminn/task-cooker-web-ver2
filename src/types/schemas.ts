import { z } from 'zod';

export const projectFormSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
  slug: z.string().min(1, 'Slug は必須です'),
  overview: z.string().default(''),
  status: z.enum(['planning', 'cooking', 'on_hold', 'completed']),
});

export const taskFormSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  status: z.enum(['order', 'prep', 'cook', 'serve']),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
});

export const teamFormSchema = z.object({
  name: z.string().min(1, 'チーム名は必須です'),
});

export const commentFormSchema = z.object({
  body: z.string().min(1, 'コメントを入力してください'),
});
