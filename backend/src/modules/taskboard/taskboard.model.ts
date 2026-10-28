import { z } from 'zod';
export const id = z.string().uuid();
export const boardInput = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(''),
});
export const columnInput = z.object({ name: z.string().trim().min(1).max(60) });
const fields = {
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000),
  assignee: z.string().trim().max(80),
  label: z.string().trim().min(1).max(30),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']),
  dueDate: z.string().date().nullable(),
};
export const cardInput = z.object({
  ...fields,
  description: fields.description.default(''),
  assignee: fields.assignee.default(''),
  label: fields.label.default('Genel'),
  priority: fields.priority.default('NORMAL'),
  dueDate: fields.dueDate.default(null),
  columnId: id,
});
export const cardUpdate = z.object(fields).partial();
export type CardInput = z.infer<typeof cardInput>;
export type CardUpdate = z.infer<typeof cardUpdate>;
