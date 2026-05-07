import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/httpError.js";

export async function getProjectMembership(userId, projectId) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
}

export async function requireProjectMember(userId, projectId) {
  const membership = await getProjectMembership(userId, projectId);

  if (!membership) {
    throw new HttpError(403, "You do not have access to this project");
  }

  return membership;
}

export async function requireProjectAdmin(userId, projectId) {
  const membership = await requireProjectMember(userId, projectId);

  if (membership.role !== "ADMIN") {
    throw new HttpError(403, "Admin access is required");
  }

  return membership;
}

export async function assertAssigneeIsProjectMember(projectId, assigneeId) {
  if (!assigneeId) return;

  const membership = await getProjectMembership(assigneeId, projectId);
  if (!membership) {
    throw new HttpError(400, "Assigned user must be a project member");
  }
}

