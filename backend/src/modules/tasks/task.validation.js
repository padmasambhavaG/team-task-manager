import { z } from "zod";

const statusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const listTasksSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
});

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: z.object({
    title: z.string().trim().min(2, "Task title is required"),
    description: z.string().trim().max(1000).optional().nullable(),
    dueDate: z.coerce.date(),
    priority: prioritySchema.default("MEDIUM"),
    status: statusSchema.default("TODO"),
    assigneeId: z.string().min(1).optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().min(1),
  }),
  body: z
    .object({
      title: z.string().trim().min(2).optional(),
      description: z.string().trim().max(1000).optional().nullable(),
      dueDate: z.coerce.date().optional(),
      priority: prioritySchema.optional(),
      status: statusSchema.optional(),
      assigneeId: z.string().min(1).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});

