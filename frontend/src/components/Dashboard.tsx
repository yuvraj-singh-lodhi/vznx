// src/components/Dashboard.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { Project, Task, ProjectStatus } from "../types";
import ProjectList from "./ProjectList/ProjectList";
import TeamOverview from "./TeamOverview/TeamOverview";
import ProjectDetailsModal from "./ProjectList/ProjectDetailsModal";
import Modal from "./UI/Modal";
import Navbar from "./Navbar";
import * as api from "../utils/api";

const TEAM_CAPACITY = 5;

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [newProjectName, setNewProjectName] = useState("");

  const [progressUpdate, setProgressUpdate] = useState<{
    [key: number]: number;
  }>({});

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  const newProjectInputRef = React.useRef<HTMLInputElement>(null);

  const refreshProjects = useCallback(async () => {
    try {
      const list = await api.getProjects();
      setProjects(list);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  }, []);

  const refreshTeamMembers = useCallback(async () => {
    try {
      const members = await api.getTeamMembers();
      setTeamMembers(members.map((m) => m.name));
    } catch (err) {
      console.error("Failed to load team members", err);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
    refreshTeamMembers();
  }, [refreshProjects, refreshTeamMembers]);

  const calculateProjectProgress = useCallback((tasks: Task[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.isComplete).length;
    return Math.round((completed / tasks.length) * 100);
  }, []);

  const projectsWithProgress = useMemo(() => {
    return projects.map((project) => {
      const calculatedProgress = calculateProjectProgress(project.tasks ?? []);
      const manualProgress = progressUpdate[project.id];

      const finalProgress =
        manualProgress !== undefined
          ? manualProgress
          : project.progress || calculatedProgress;
      let status: ProjectStatus = project.status;
      let statusNormalized: ProjectStatus;

      if (finalProgress === 100) {
        statusNormalized = "COMPLETED";
      } else if (finalProgress > 0) {
        statusNormalized = "IN_PROGRESS";
      } else {
        statusNormalized = "PENDING";
      }

      status = statusNormalized;

      return {
        ...project,
        progress: finalProgress,
        status,
      };
    });
  }, [projects, progressUpdate, calculateProjectProgress]);

  const teamOverview = useMemo(() => {
    const taskCounts: { [key: string]: number } = {};
    teamMembers.forEach((name) => (taskCounts[name] = 0));

    projects.forEach((p) => {
      (p.tasks ?? []).forEach((t) => {
        const assignedName: string | undefined = t.assignedTo?.name;
        if (!assignedName) return;
        taskCounts[assignedName] = (taskCounts[assignedName] || 0) + 1;
      });
    });

    return Object.entries(taskCounts).map(([name, count]) => ({
      name,
      assignedTasks: count,
      capacity: TEAM_CAPACITY,
    }));
  }, [projects, teamMembers]);

  const handleOpenProjectDetails = useCallback((projectId: number) => {
    setSelectedProjectId(projectId);
  }, []);

  const handleCloseProjectDetails = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const selectedProject = useMemo(() => {
    return projectsWithProgress.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projectsWithProgress]);
  const handleAddTask = useCallback(
    async (projectId: number, taskName: string, assignedTo: string) => {
      try {
        await api.createTask(projectId, taskName, {
          assignedToName: assignedTo,
        });
        await refreshProjects();
        await refreshTeamMembers();
      } catch (err) {
        console.error("Failed to add task", err);
      }
    },
    [refreshProjects, refreshTeamMembers]
  );

  const handleAddNewTeamMember = useCallback(
    async (name: string) => {
      try {
        if (!name || teamMembers.includes(name)) return;
        await api.createTeamMember(name);
        await refreshTeamMembers();
      } catch (err) {
        console.error("Failed to add team member", err);
      }
    },
    [teamMembers, refreshTeamMembers]
  );

  const handleAddProject = useCallback(async () => {
    try {
      if (!newProjectName.trim()) return;
      await api.createProject(newProjectName.trim());
      setNewProjectName("");
      await refreshProjects();
    } catch (err) {
      console.error("Failed to create project", err);
    }
  }, [newProjectName, refreshProjects]);

  const focusNewProjectInput = () => newProjectInputRef.current?.focus();

  const toggleTaskCompletion = useCallback(
    async (_projectId: number, taskId: number) => {
      try {
        await api.toggleTask(taskId);
        await refreshProjects();
      } catch (err) {
        console.error("Failed to toggle task completion", err);
      }
    },
    [refreshProjects]
  );

  const handleDeleteProject = useCallback(
    async (id: number) => {
      try {
        await api.deleteProject(id);
        setProgressUpdate((prev) => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
        await refreshProjects();
        if (selectedProjectId === id) setSelectedProjectId(null);
      } catch (err) {
        console.error("Failed to delete project", err);
      }
    },
    [refreshProjects, selectedProjectId]
  );

  const handleManualProgressUpdate = useCallback(
    async (projectId: number, value: string) => {
      const progress = value === "" ? undefined : parseInt(value, 10);
      if (value === "") {
        setProgressUpdate((prev) => {
          const { [projectId]: _, ...rest } = prev;
          return rest;
        });
        return;
      }

      if (isNaN(progress!) || progress! < 0 || progress! > 100) return;

      try {
        await api.updateProject(projectId, { progress: progress! });
        setProgressUpdate((prev) => ({ ...prev, [projectId]: progress! }));
        await refreshProjects();
      } catch (err) {
        console.error("Failed to update project progress", err);
      }
    },
    [refreshProjects]
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar onAddProjectClick={focusNewProjectInput} />{" "}
      <main className="p-6 md:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <section className="lg:col-span-2">
          {" "}
          <header className="mb-8">
            {" "}
            <h1 className="text-4xl font-extrabold text-slate-900">
              Project & Team Management Console
            </h1>{" "}
            <p className="text-slate-500 mt-2 text-lg">
              Central hub for tracking progress, managing resources, and
              initiating new workstreams. Select a project card to access
              detailed task management.{" "}
            </p>{" "}
          </header>{" "}
          <ProjectList
            projects={projectsWithProgress}
            allTeamMembers={teamMembers}
            toggleTaskCompletion={toggleTaskCompletion}
            handleManualProgressUpdate={handleManualProgressUpdate}
            handleDeleteProject={handleDeleteProject}
            handleAddProject={handleAddProject}
            handleAddTask={handleAddTask}
            newProjectName={newProjectName}
            setNewProjectName={setNewProjectName}
            progressUpdates={progressUpdate}
            newProjectInputRef={newProjectInputRef}
            onOpenProjectDetails={handleOpenProjectDetails}
          />{" "}
        </section>{" "}
        <aside>
          {" "}
          <TeamOverview
            team={teamOverview}
            handleAddNewTeamMember={handleAddNewTeamMember}
          />{" "}
        </aside>{" "}
      </main>{" "}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={handleCloseProjectDetails}
          title={`Project: ${selectedProject.name}`}
        >
          {" "}
          <ProjectDetailsModal
            project={selectedProject}
            allTeamMembers={teamMembers}
            toggleTaskCompletion={toggleTaskCompletion}
            handleAddTask={handleAddTask}
            handleManualProgressUpdate={handleManualProgressUpdate}
            manualProgressValue={progressUpdate[selectedProject.id]}
          />{" "}
        </Modal>
      )}{" "}
    </div>
  );
};

export default Dashboard;
