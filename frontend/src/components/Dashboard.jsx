import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  Users,
} from "lucide-react";
import { EmptyState } from "./EmptyState.jsx";
import { formatDate, formatStatus, isOverdue } from "../utils/format.js";

export function Dashboard({ dashboard, projects = [], selectedProject, onNavigate }) {
  if (!dashboard) {
    return <EmptyState title="Loading dashboard" message="Fetching task summary." />;
  }

  const cards = [
    {
      label: "Total Tasks",
      value: dashboard.totalTasks,
      icon: ListTodo,
      tone: "blue",
    },
    {
      label: "To Do",
      value: dashboard.statusCounts?.TODO || 0,
      icon: Clock3,
      tone: "gray",
    },
    {
      label: "In Progress",
      value: dashboard.statusCounts?.IN_PROGRESS || 0,
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Done",
      value: dashboard.statusCounts?.DONE || 0,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      label: "Overdue",
      value: dashboard.overdueTasks,
      icon: AlertTriangle,
      tone: "red",
    },
  ];
  const memberCount = selectedProject?.members?.length || 0;
  const sectionCards = [
    {
      key: "projects",
      label: "Projects",
      value: projects.length,
      text: "Create and review project workspaces",
      icon: FolderKanban,
    },
    {
      key: "tasks",
      label: "Tasks",
      value: dashboard.totalTasks,
      text: "Track assigned work and progress",
      icon: ListTodo,
    },
    {
      key: "members",
      label: "Members",
      value: memberCount,
      text: "Manage team access and roles",
      icon: Users,
    },
  ];

  return (
    <section className="dashboard-grid">
      <section className="dashboard-hero">
        <div>
          <p className="muted-label">Dashboard</p>
          <h1>Workspace overview</h1>
          <span>
            {selectedProject?.name || "No project selected"} gives you a quick view of
            projects, tasks, team members, and overdue work.
          </span>
        </div>
        <button className="primary-button" type="button" onClick={() => onNavigate("tasks")}>
          <ListTodo size={16} />
          Review Tasks
        </button>
      </section>

      <div className="section-card-grid">
        {sectionCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              className="section-card"
              key={card.key}
              type="button"
              onClick={() => onNavigate(card.key)}
            >
              <span className="section-card-icon">
                <Icon size={19} />
              </span>
              <span>
                <strong>{card.label}</strong>
                <small>{card.text}</small>
              </span>
              <em>{card.value}</em>
              <ArrowRight size={17} />
            </button>
          );
        })}
      </div>

      <div className="metric-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`metric-card ${card.tone}`} key={card.label}>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
              <Icon size={22} />
            </article>
          );
        })}
      </div>

      <section className="panel wide">
        <div className="panel-header">
          <div>
            <p className="muted-label">Workload</p>
            <h3>Tasks per user</h3>
          </div>
        </div>
        <div className="workload-list">
          {dashboard.tasksPerUser?.length ? (
            dashboard.tasksPerUser.map((item) => (
              <div className="workload-row" key={item.name}>
                <span>{item.name}</span>
                <div className="workload-track">
                  <div
                    style={{
                      width: `${Math.max(12, (item.count / dashboard.totalTasks) * 100)}%`,
                    }}
                  />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))
          ) : (
            <p className="soft-text">No assigned tasks yet.</p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="muted-label">Due dates</p>
            <h3>Upcoming tasks</h3>
          </div>
        </div>
        <div className="upcoming-list">
          {dashboard.upcomingTasks?.length ? (
            dashboard.upcomingTasks.map((task) => (
              <div className="upcoming-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.project?.name}</span>
                </div>
                <div className="task-meta">
                  <span className={`status-pill ${task.status.toLowerCase()}`}>
                    {formatStatus(task.status)}
                  </span>
                  <small className={isOverdue(task) ? "danger-text" : ""}>
                    {formatDate(task.dueDate)}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <p className="soft-text">No tasks available.</p>
          )}
        </div>
      </section>
    </section>
  );
}
