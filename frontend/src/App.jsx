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

  async function createProject(payload) {
    const data = await apiRequest("/projects", {
      method: "POST",
      body: payload,
    });
    setProjects((current) => [data.project, ...current]);
    setSelectedProjectId(data.project.id);
    await loadWorkspace();
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
      projects={projects}
      selectedProjectId={selectedProjectId}
      onSelectProject={setSelectedProjectId}
      onCreateProject={() => setShowProjectModal(true)}
    >
      {error && <div className="banner-error">{error}</div>}
      <Dashboard dashboard={dashboard} />
      {projects.length ? (
        <ProjectPanel
          projectId={selectedProjectId}
          onDataChange={loadWorkspace}
        />
      ) : (
        <EmptyState
          title="No projects yet"
          message="Create a project to add members and assign tasks."
        />
      )}
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={createProject}
        />
      )}
    </AppShell>
  );
}

