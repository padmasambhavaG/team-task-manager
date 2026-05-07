import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@teamtask.dev" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@teamtask.dev",
      password,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@teamtask.dev" },
    update: {},
    create: {
      name: "Member User",
      email: "member@teamtask.dev",
      password,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {},
    create: {
      id: "demo-project",
      name: "Website Launch",
      description: "Demo project for the Team Task Manager assignment.",
      createdById: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: member.id, role: "MEMBER" },
        ],
      },
    },
  });

  const existingTasks = await prisma.task.count({
    where: { projectId: project.id },
  });

  if (existingTasks === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: "Prepare launch checklist",
          description: "Confirm content, analytics, and QA items before release.",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
          priority: "HIGH",
          status: "IN_PROGRESS",
          projectId: project.id,
          assigneeId: admin.id,
          createdById: admin.id,
        },
        {
          title: "Fix mobile navigation",
          description: "Make menu behavior smooth on small screens.",
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
          priority: "MEDIUM",
          status: "TODO",
          projectId: project.id,
          assigneeId: member.id,
          createdById: admin.id,
        },
        {
          title: "Finalize deployment notes",
          description: "Document GitHub and Railway deployment steps.",
          dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
          priority: "LOW",
          status: "TODO",
          projectId: project.id,
          assigneeId: member.id,
          createdById: admin.id,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

