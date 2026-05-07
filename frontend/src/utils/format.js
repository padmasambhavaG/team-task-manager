export function formatStatus(status) {
  const labels = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  };

  return labels[status] || status;
}

export function formatPriority(priority) {
  const labels = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
  };

  return labels[priority] || priority;
}

export function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function isOverdue(task) {
  return task.status !== "DONE" && new Date(task.dueDate) < new Date();
}

