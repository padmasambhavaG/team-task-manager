import { useEffect, useMemo, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { apiRequest } from "../api/client.js";
import { EmptyState } from "./EmptyState.jsx";
import { TaskModal } from "./TaskModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate, formatPriority, formatStatus, isOverdue } from "../utils/format.js";

export function ProjectPanel({ projectId, section = "projects", onDataChange }) {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });
  const [showTaskModal, setShowTaskModal] = useState(false);

  const isAdmin = project?.role === "ADMIN";
  const visibleMembers = useMemo(() => {
    return (
      project?.members.filter(
        (member) => member.role === "MEMBER" && member.user.id !== user?.id,
      ) || []
    );
  }, [project, user?.id]);

  const taskStats = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.status] += 1;
        return acc;
      },
      { TODO: 0, IN_PROGRESS: 0, DONE: 0 },
    );
  }, [tasks]);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    Promise.all([
      apiRequest(`/projects/${projectId}`),
      apiRequest(`/projects/${projectId}/tasks`),
    ])
      .then(([projectData, taskData]) => {
        setProject(projectData.project);
        setTasks(taskData.tasks);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function refreshProject() {
    const [projectData, taskData] = await Promise.all([
      apiRequest(`/projects/${projectId}`),
      apiRequest(`/projects/${projectId}/tasks`),
    ]);
    setProject(projectData.project);
    setTasks(taskData.tasks);
    onDataChange();
  }

  async function addMember(event) {
    event.preventDefault();
    setMemberError("");

    if (memberForm.email.trim().toLowerCase() === user?.email?.toLowerCase()) {
      setMemberError("You cannot invite yourself or change your own role.");
      return;
    }

    try {
      await apiRequest(`/projects/${projectId}/members`, {
        method: "POST",
        body: memberForm,
      });
      setMemberForm({ email: "", role: "MEMBER" });
      await refreshProject();
    } catch (err) {
      setMemberError(err.message);
    }
  }

  async function removeMember(userId) {
    await apiRequest(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });
    await refreshProject();
  }

  async function createTask(payload) {
    await apiRequest(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: payload,
    });
    await refreshProject();
  }

  async function updateTaskStatus(taskId, status) {
    const data = await apiRequest(`/tasks/${taskId}`, {
      method: "PATCH",
      body: { status },
    });

    setTasks((current) =>
      current.map((task) => (task.id === taskId ? data.task : task)),
    );
    onDataChange();
  }

  async function deleteTask(taskId) {
    await apiRequest(`/tasks/${taskId}`, { method: "DELETE" });
    await refreshProject();
  }

  if (!projectId) {
    return (
      <EmptyState
        title="Create your first project"
        message="Use the plus button in the sidebar to start managing tasks."
      />
    );
  }

  if (loading) {
    return <EmptyState title="Loading project" message="Fetching project details." />;
  }

  if (error) {
    return <EmptyState title="Could not load project" message={error} />;
  }

  function renderProjectOverview() {
    return (
      <section className="project-main single-column">
        <section className="panel project-overview-panel">
          <div className="panel-header">
            <div>
              <p className="muted-label">Project overview</p>
              <h3>{project.name}</h3>
              {project.description && <p className="soft-text">{project.description}</p>}
            </div>
            {isAdmin && (
              <button className="primary-button" type="button" onClick={() => setShowTaskModal(true)}>
                <Plus size={16} />
                Add Task
              </button>
            )}
          </div>
          <div className="mini-stats">
            <div>
              <span>To Do</span>
              <strong>{taskStats.TODO}</strong>
            </div>
            <div>
              <span>In Progress</span>
              <strong>{taskStats.IN_PROGRESS}</strong>
            </div>
            <div>
              <span>Done</span>
              <strong>{taskStats.DONE}</strong>
            </div>
          </div>
        </section>
      </section>
    );
  }

  function renderTasks() {
    return (
      <section className="project-main single-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="muted-label">Tasks</p>
              <h3>Status tracking</h3>
            </div>
            {isAdmin && (
              <button className="primary-button" type="button" onClick={() => setShowTaskModal(true)}>
                <Plus size={16} />
                Add Task
              </button>
            )}
          </div>
          <div className="task-table-wrap">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  {isAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <strong>{task.title}</strong>
                      <span>{task.description || "No description"}</span>
                    </td>
                    <td>{task.assignee?.name || "Unassigned"}</td>
                    <td>
                      <span className={`priority-pill ${task.priority.toLowerCase()}`}>
                        {formatPriority(task.priority)}
                      </span>
                    </td>
                    <td className={isOverdue(task) ? "danger-text" : ""}>
                      {formatDate(task.dueDate)}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={(event) => updateTaskStatus(task.id, event.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    {isAdmin && (
                      <td>
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => deleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!tasks.length && (
              <EmptyState
                title="No tasks yet"
                message={isAdmin ? "Create the first task for this project." : "No assigned tasks in this project."}
              />
            )}
          </div>
        </section>
      </section>
    );
  }

  function renderMembers() {
    return (
      <section className="project-main single-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="muted-label">Role-based access</p>
              <h3>Members</h3>
            </div>
          </div>

          <div className="member-list">
            {visibleMembers.map((member) => (
              <div className="member-row" key={member.user.id}>
                <div>
                  <strong>{member.user.name}</strong>
                  <span>{member.user.email}</span>
                </div>
                <small>{member.role}</small>
                {isAdmin && (
                  <button
                    className="icon-danger"
                    type="button"
                    title="Remove member"
                    onClick={() => removeMember(member.user.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!visibleMembers.length && (
              <EmptyState
                title="No members yet"
                message="Invite members to collaborate on this project."
              />
            )}
          </div>

          {isAdmin && (
            <form className="member-form" onSubmit={addMember}>
              <label>
                Add member by email
                <input
                  value={memberForm.email}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="member@example.com"
                  type="email"
                  required
                />
              </label>
              <label>
                Role
                <select
                  value={memberForm.role}
                  onChange={(event) =>
                    setMemberForm((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>
              {memberError && <p className="form-error">{memberError}</p>}
              <button className="secondary-button full-width" type="submit">
                <UserPlus size={16} />
                Invite Member
              </button>
            </form>
          )}
        </section>
      </section>
    );
  }

  return (
    <section className="project-section">
      {section === "tasks" && renderTasks()}
      {section === "members" && renderMembers()}
      {section !== "tasks" && section !== "members" && renderProjectOverview()}

      {showTaskModal && (
        <TaskModal
          members={project.members}
          onClose={() => setShowTaskModal(false)}
          onSubmit={createTask}
        />
      )}
    </section>
  );
}
