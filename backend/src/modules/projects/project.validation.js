import { z } from "zod";

const roleSchema = z.enum(["ADMIN", "MEMBER"]);

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Project name is required"),
    description: z.string().trim().max(500).optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().max(500).optional().nullable(),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
});

export const addMemberSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
  }),
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    role: roleSchema.default("MEMBER"),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
    userId: z.string().min(1),
  }),
  body: z.object({
    role: roleSchema,
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    projectId: z.string().min(1),
    userId: z.string().min(1),
  }),
});

