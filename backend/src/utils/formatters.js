export function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function taskResponse(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
    projectId: task.projectId,
    project: task.project
      ? {
          id: task.project.id,
          name: task.project.name,
        }
      : undefined,
    assignee: publicUser(task.assignee),
    createdBy: publicUser(task.createdBy),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function projectResponse(project, currentUserRole = null) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    role: currentUserRole,
    createdBy: publicUser(project.createdBy),
    members:
      project.members?.map((member) => ({
        id: member.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: publicUser(member.user),
      })) || [],
    taskCount: project._count?.tasks ?? undefined,
    memberCount: project._count?.members ?? undefined,
  };
}

