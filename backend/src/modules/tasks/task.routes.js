import { Router } from "express";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "./task.controller.js";
import {
  createTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from "./task.validation.js";

export const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get(
  "/projects/:projectId/tasks",
  validate(listTasksSchema),
  asyncHandler(listTasks),
);

taskRouter.post(
  "/projects/:projectId/tasks",
  validate(createTaskSchema),
  asyncHandler(createTask),
);

taskRouter.patch(
  "/tasks/:taskId",
  validate(updateTaskSchema),
  asyncHandler(updateTask),
);

taskRouter.delete("/tasks/:taskId", asyncHandler(deleteTask));

