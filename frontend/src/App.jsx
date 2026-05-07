import { useEffect, useState } from "react";
import { apiRequest } from "./api/client.js";
import { AppShell } from "./components/AppShell.jsx";
import { AuthCard } from "./components/AuthCard.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { EmptyState } from "./components/EmptyState.jsx";
import { ProjectModal } from "./components/ProjectModal.jsx";
import { ProjectPanel } from "./components/ProjectPanel.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export function App() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("teamtask_theme") || "light");
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [showProjectModal, setShowProjectModal] = useState(false);

  async function loadWorkspace() {
    if (!user) return;

    try {
      const [projectData, dashboardData] = await Promise.all([
        apiRequest("/projects"),
        apiRequest("/dashboard"),
      ]);
      setProjects(projectData.projects);
      setDashboard(dashboardData);
      setSelectedProjectId((current) => current || projectData.projects[0]?.id || "");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("teamtask_theme", theme);
  }, [theme]);

  async function createProject(payload) {
    const data = await apiRequest("/projects", {
      method: "POST",
      body: payload,
    });
    setProjects((current) => [data.project, ...current]);
    setSelectedProjectId(data.project.id);
    await loadWorkspace();
  }

  async function deleteProject(projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (!project || project.role !== "ADMIN") return;

    const confirmed = window.confirm(
      `Delete project "${project.name}"? This also removes its tasks and member access.`,
    );
    if (!confirmed) return;

    try {
      await apiRequest(`/projects/${projectId}`, {
        method: "DELETE",
      });

      const remainingProjects = projects.filter((item) => item.id !== projectId);
      setProjects(remainingProjects);

      if (selectedProjectId === projectId) {
        setSelectedProjectId(remainingProjects[0]?.id || "");
        setActiveSection("dashboard");
      }

      await loadWorkspace();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function renderActiveSection() {
    if (!projects.length) {
      return (
        <EmptyState
          title="No projects yet"
          message="Create a project to add members and assign tasks."
        />
      );
    }

    if (activeSection === "dashboard") {
      return (
        <Dashboard
          dashboard={dashboard}
          projects={projects}
          selectedProject={projects.find((project) => project.id === selectedProjectId)}
          onNavigate={setActiveSection}
        />
      );
    }

    return (
      <ProjectPanel
        projectId={selectedProjectId}
        section={activeSection}
        onDataChange={loadWorkspace}
      />
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="brand-mark">TT</div>
        <p>Loading TeamTask...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthCard />;
  }

  return (
    <AppShell
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      theme={theme}
      onToggleTheme={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
      projects={projects}
      selectedProjectId={selectedProjectId}
      onSelectProject={(projectId) => {
        setSelectedProjectId(projectId);
        setActiveSection("projects");
      }}
      onCreateProject={() => setShowProjectModal(true)}
      onDeleteProject={deleteProject}
    >
      {error && <div className="banner-error">{error}</div>}
      {renderActiveSection()}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={createProject}
        />
      )}
    </AppShell>
  );
}
