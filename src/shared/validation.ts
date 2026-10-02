import { z } from 'zod';

export const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, '실제로 존재하는 날짜를 입력하세요.');
const seconds = z.number().int().min(0).max(31536000);
export const planSchema = z.object({
  title: z.string().trim().min(1).max(200),
  period_start: dateOnly,
  period_end: dateOnly,
  success_criteria: z.string().trim().min(1).max(4000),
  estimated_seconds: seconds,
}).strict().refine(p => p.period_end >= p.period_start, {
  message: '종료일은 시작일보다 빠를 수 없습니다.', path: ['period_end'],
});
export const planUpdateSchema = planSchema.safeExtend({ expected_version: z.number().int().min(1) });
export const taskSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  priority: z.enum(['high', 'medium', 'low']),
  due_date: dateOnly.nullable(),
  estimated_seconds: seconds,
  tags: z.array(z.string().trim().min(1).max(40)).max(20).transform(tags => [...new Set(tags)]),
}).strict();
export const taskQuerySchema = z.object({
  search: z.string().max(200).optional(),
  tag: z.string().max(40).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  due_from: dateOnly.optional(),
  due_to: dateOnly.optional(),
  sort: z.enum(['created_desc', 'created_asc', 'due_asc', 'priority', 'estimated_asc']).default('created_desc'),
}).strict().refine(q => !q.due_from || !q.due_to || q.due_to >= q.due_from, '마감일 범위를 확인하세요.');

export const requestIdSchema = z.object({ request_id: z.string().uuid() }).strict();
export const emptySchema = z.object({}).strict();
export const reviewQuerySchema = z.object({ plan_id: z.string().uuid().optional() }).strict();
export const copySchema = z.object({
  plan: planSchema,
  tasks: z.array(z.object({ task_id: z.string().uuid(), due_date: dateOnly.nullable() }).strict()).min(1).max(100),
}).strict().refine(value => new Set(value.tasks.map(t => t.task_id)).size === value.tasks.length, '복사할 할 일을 중복 선택할 수 없습니다.');
