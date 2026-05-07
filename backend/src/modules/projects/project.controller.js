import { prisma } from "../../config/prisma.js";
import { HttpError } from "../../utils/httpError.js";
import { projectResponse } from "../../utils/formatters.js";
import { requireProjectAdmin, requireProjectMember } from "./project.service.js";

const projectInclude = {
  createdBy: true,
  members: {
    include: {
      user: true,
    },
    orderBy: {
      joinedAt: "asc",
    },
  },
  _count: {
    select: {
      members: true,
      tasks: true,
    },
  },
};

export async function listProjects(req, res) {
  const memberships = await prisma.projectMember.findMany({
    where: { userId: req.user.userId },
    include: {
      project: {
        include: projectInclude,
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
  });

  res.json({
    projects: memberships.map((membership) =>
      projectResponse(membership.project, membership.role),
    ),
  });
}

export async function createProject(req, res) {
  const { name, description } = req.validated.body;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      createdById: req.user.userId,
      members: {
        create: {
          userId: req.user.userId,
          role: "ADMIN",
        },
      },
    },
    include: projectInclude,
  });

  res.status(201).json({ project: projectResponse(project, "ADMIN") });
}

export async function getProject(req, res) {
  const { projectId } = req.validated.params;
  const membership = await requireProjectMember(req.user.userId, projectId);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: projectInclude,
  });

  if (!project) {
    throw new HttpError(404, "Project not found");
  }

  res.json({ project: projectResponse(project, membership.role) });
}

export async function updateProject(req, res) {
  const { projectId } = req.validated.params;
  await requireProjectAdmin(req.user.userId, projectId);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: req.validated.body,
    include: projectInclude,
  });

  res.json({ project: projectResponse(project, "ADMIN") });
}

export async function deleteProject(req, res) {
  const { projectId } = req.validated.params;
  await requireProjectAdmin(req.user.userId, projectId);

  await prisma.project.delete({
    where: { id: projectId },
  });

  res.status(204).send();
}

export async function addMember(req, res) {
  const { projectId } = req.validated.params;
  const { email, role } = req.validated.body;
  await requireProjectAdmin(req.user.userId, projectId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(404, "No registered user found with this email");
  }

  if (user.id === req.user.userId) {
    throw new HttpError(400, "Admins cannot invite themselves or change their own role");
  }

  const member = await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
    update: { role },
    create: {
      userId: user.id,
      projectId,
      role,
    },
    include: { user: true },
  });

  res.status(201).json({
    member: {
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
      },
    },
  });
}

export async function updateMember(req, res) {
  const { projectId, userId } = req.validated.params;
  const { role } = req.validated.body;
  await requireProjectAdmin(req.user.userId, projectId);

  if (userId === req.user.userId) {
    throw new HttpError(400, "Admins cannot change their own role");
  }

  const adminCount = await prisma.projectMember.count({
    where: { projectId, role: "ADMIN" },
  });

  const target = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!target) {
    throw new HttpError(404, "Member not found");
  }

  if (target.role === "ADMIN" && role === "MEMBER" && adminCount === 1) {
    throw new HttpError(400, "A project must have at least one admin");
  }

  const member = await prisma.projectMember.update({
    where: { userId_projectId: { userId, projectId } },
    data: { role },
    include: { user: true },
  });

  res.json({
    member: {
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
      },
    },
  });
}

export async function removeMember(req, res) {
  const { projectId, userId } = req.validated.params;
  await requireProjectAdmin(req.user.userId, projectId);

  if (userId === req.user.userId) {
    throw new HttpError(400, "Admins cannot remove themselves from a project");
  }

  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  if (!member) {
    throw new HttpError(404, "Member not found");
  }

  const adminCount = await prisma.projectMember.count({
    where: { projectId, role: "ADMIN" },
  });

  if (member.role === "ADMIN" && adminCount === 1) {
    throw new HttpError(400, "A project must have at least one admin");
  }

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId, projectId } },
  });

  await prisma.task.updateMany({
    where: { projectId, assigneeId: userId },
    data: { assigneeId: req.user.userId },
  });

  res.status(204).send();
}
