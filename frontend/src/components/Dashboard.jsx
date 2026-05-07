import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { EmptyState } from "./EmptyState.jsx";
import { formatDate, formatStatus, isOverdue } from "../utils/format.js";

export function Dashboard({ dashboard }) {
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

  return (
    <section className="dashboard-grid">
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

