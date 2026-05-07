import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/httpError.js";
import { taskResponse } from "../../utils/formatters.js";
import {
  assertAssigneeIsProjectMember,
  requireProjectAdmin,
  requireProjectMember,
} from "../projects/project.service.js";

const taskInclude = {
  assignee: true,
  createdBy: true,
  project: true,
};

export async function listTasks(req, res) {
  const { projectId } = req.validated.params;
  const membership = await requireProjectMember(req.user.userId, projectId);

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...(membership.role === "MEMBER" ? { assigneeId: req.user.userId } : {}),
    },
    include: taskInclude,
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  res.json({ tasks: tasks.map(taskResponse) });
}

export async function createTask(req, res) {
  const { projectId } = req.validated.params;
  const data = req.validated.body;

  await requireProjectAdmin(req.user.userId, projectId);
  await assertAssigneeIsProjectMember(projectId, data.assigneeId);

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      priority: data.priority,
      status: data.status,
      assigneeId: data.assigneeId,
      projectId,
      createdById: req.user.userId,
    },
    include: taskInclude,
  });

  res.status(201).json({ task: taskResponse(task) });
}

export async function updateTask(req, res) {
  const { taskId } = req.validated.params;
  const updates = req.validated.body;

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignee: true,
    },
  });

  if (!existingTask) {
    throw new HttpError(404, "Task not found");
  }

  const membership = await requireProjectMember(req.user.userId, existingTask.projectId);
  const isAdmin = membership.role === "ADMIN";
  const isAssignedMember = existingTask.assigneeId === req.user.userId;

  if (!isAdmin) {
    const updateKeys = Object.keys(updates);
    const onlyStatusUpdate = updateKeys.length === 1 && updateKeys[0] === "status";

    if (!isAssignedMember || !onlyStatusUpdate) {
      throw new HttpError(403, "Members can only update status for assigned tasks");
    }
  }

  if (isAdmin && "assigneeId" in updates) {
    await assertAssigneeIsProjectMember(existingTask.projectId, updates.assigneeId);
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updates,
    include: taskInclude,
  });

  res.json({ task: taskResponse(task) });
}

export async function deleteTask(req, res) {
  const { taskId } = req.params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  await requireProjectAdmin(req.user.userId, task.projectId);
  await prisma.task.delete({ where: { id: taskId } });

  res.status(204).send();
}

