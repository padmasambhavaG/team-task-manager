import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Moon,
  Plus,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function AppShell({
  children,
  activeSection,
  onSectionChange,
  theme,
  onToggleTheme,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) {
  const { user, logout } = useAuth();
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">TT</div>
          <span>TeamTask</span>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <button
            className={activeSection === "dashboard" ? "active" : ""}
            type="button"
            onClick={() => onSectionChange("dashboard")}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button
            className={activeSection === "projects" ? "active" : ""}
            type="button"
            onClick={() => onSectionChange("projects")}
          >
            <FolderKanban size={18} />
            Projects
          </button>
          <button
            className={activeSection === "tasks" ? "active" : ""}
            type="button"
            onClick={() => onSectionChange("tasks")}
          >
            <ListTodo size={18} />
            Tasks
          </button>
          <button
            className={activeSection === "members" ? "active" : ""}
            type="button"
            onClick={() => onSectionChange("members")}
          >
            <Users size={18} />
            Members
          </button>
        </nav>

        <div className="project-switcher">
          <div className="sidebar-heading">
            <span>Projects</span>
            <button type="button" onClick={onCreateProject} title="Create project">
              <Plus size={16} />
            </button>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <div
                className={project.id === selectedProjectId ? "selected" : ""}
                key={project.id}
              >
                <button
                  className="project-select-button"
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                >
                  <span>{project.name}</span>
                  <small>{project.role}</small>
                </button>
                {project.role === "ADMIN" && (
                  <button
                    className="project-delete-button"
                    type="button"
                    title={`Delete ${project.name}`}
                    onClick={() => onDeleteProject(project.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <p className="muted-label">Current project</p>
            <h2>{selectedProject?.name || "Dashboard"}</h2>
          </div>
          <div className="topbar-actions">
            <button className="theme-toggle" type="button" onClick={onToggleTheme}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
            <div className="user-menu">
              <div>
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <button type="button" onClick={logout} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
