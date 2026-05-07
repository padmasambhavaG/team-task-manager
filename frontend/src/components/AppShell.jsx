import {
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function AppShell({
  children,
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
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
          <a className="active">
            <LayoutDashboard size={18} />
            Dashboard
          </a>
          <a>
            <FolderKanban size={18} />
            Projects
          </a>
          <a>
            <ListTodo size={18} />
            Tasks
          </a>
          <a>
            <Users size={18} />
            Members
          </a>
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
              <button
                className={project.id === selectedProjectId ? "selected" : ""}
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
              >
                <span>{project.name}</span>
                <small>{project.role}</small>
              </button>
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
          <div className="user-menu">
            <div>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
            <button type="button" onClick={logout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}

