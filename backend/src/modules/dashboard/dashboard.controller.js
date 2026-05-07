import { prisma } from "../../config/prisma.js";
import { taskResponse } from "../../utils/formatters.js";

const emptyStatusCounts = {
  TODO: 0,
  IN_PROGRESS: 0,
  DONE: 0,
};

export async function getDashboard(req, res) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId: req.user.userId },
    select: {
      projectId: true,
      role: true,
    },
  });

  const adminProjectIds = memberships
    .filter((membership) => membership.role === "ADMIN")
    .map((membership) => membership.projectId);

  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        adminProjectIds.length ? { projectId: { in: adminProjectIds } } : undefined,
        { assigneeId: req.user.userId },
      ].filter(Boolean),
    },
    include: {
      assignee: true,
      createdBy: true,
      project: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  const now = new Date();
  const statusCounts = { ...emptyStatusCounts };
  const tasksPerUser = new Map();

  for (const task of tasks) {
    statusCounts[task.status] += 1;
    const key = task.assignee?.name || "Unassigned";
    tasksPerUser.set(key, (tasksPerUser.get(key) || 0) + 1);
  }

  const overdueTasks = tasks.filter(
    (task) => task.status !== "DONE" && task.dueDate < now,
  );

  res.json({
    totalTasks: tasks.length,
    statusCounts,
    overdueTasks: overdueTasks.length,
    tasksPerUser: Array.from(tasksPerUser, ([name, count]) => ({ name, count })),
    upcomingTasks: tasks.slice(0, 6).map(taskResponse),
  });
}

