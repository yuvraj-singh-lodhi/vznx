// src/components/Dashboard.tsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import type { Project, Task, ProjectStatus, TeamMember } from "../types";
import ProjectList from "./ProjectList/ProjectList";
import TeamOverview from "./TeamOverview/TeamOverview";
import ProjectDetailsModal from "./ProjectList/ProjectDetailsModal";
import Modal from "./UI/Modal";
import Navbar from "./Navbar";
import * as api from "../utils/api";
import Skeleton from "./UI/Skeleton";
import Loader from "./UI/Loader";

const TEAM_CAPACITY = 5;

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [teamMembersFull, setTeamMembersFull] = useState<TeamMember[]>([]);
  const [newProjectName, setNewProjectName] = useState("");

  const [progressUpdate, setProgressUpdate] = useState<Record<number, number>>(
    {}
  );
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  ); // New State for Loading

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const newProjectInputRef = React.useRef<HTMLInputElement>(null); // FIX 1: Remove isInitialLoading from dependency array of refreshProjects. // Also, remove the action loading logic, as the calling action handlers

  // should manage the isActionLoading state before calling this.
  const refreshProjects = useCallback(async () => {
    try {
      const list = await api.getProjects();
      setProjects(list);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  }, []); // Dependency array is now empty, refreshProjects will only be created once

  const refreshTeamMembers = useCallback(async () => {
    try {
      const members = await api.getTeamMembers();
      setTeamMembersFull(members);
      setTeamMembers(members.map((m) => m.name));
    } catch (err) {
      console.error("Failed to load team members", err);
    }
  }, []); // Dependency array is empty

  useEffect(() => {
    const fetchData = async () => {
      // Correctly manages the initial loading state only on mount
      setIsInitialLoading(true);
      await Promise.all([refreshProjects(), refreshTeamMembers()]);
      setIsInitialLoading(false);
    };
    fetchData(); // The dependencies are now stable functions, running only on mount
  }, [refreshProjects, refreshTeamMembers]); // ... (calculateProjectProgress, projectsWithProgress, teamOverviewMembers, etc. remain the same)

  const calculateProjectProgress = useCallback((tasks: Task[] | undefined) => {
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
          : project.progress ?? calculatedProgress;

      let statusNormalized: ProjectStatus;
      if (finalProgress === 100) statusNormalized = "COMPLETED";
      else if (finalProgress > 0) statusNormalized = "IN_PROGRESS";
      else statusNormalized = "PENDING";

      return {
        ...project,
        progress: finalProgress,
        status: statusNormalized,
      };
    });
  }, [projects, progressUpdate, calculateProjectProgress]);

  const teamOverviewMembers: TeamMember[] = useMemo(() => {
    return teamMembersFull.map((member) => {
      const tasksForMember: Task[] = [];
      projects.forEach((p) =>
        (p.tasks ?? []).forEach((t) => {
          if (
            t.assignedTo &&
            typeof t.assignedTo === "object" &&
            t.assignedTo.id === member.id
          ) {
            tasksForMember.push(t);
          }
        })
      );

      return {
        ...member,
        tasks: tasksForMember,
        capacity: member.capacity ?? TEAM_CAPACITY,
      };
    });
  }, [teamMembersFull, projects]);
  const handleOpenProjectDetails = useCallback((id: number) => {
    setSelectedProjectId(id);
  }, []);

  const handleCloseProjectDetails = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const selectedProject = useMemo(() => {
    return projectsWithProgress.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projectsWithProgress]); // The rest of the handlers are correct, as they manage setIsActionLoading directly

  const handleAddTask = useCallback(
    async (projectId: number, taskName: string, assignedTo: string) => {
      setIsActionLoading(true);
      try {
        await api.createTask(projectId, taskName, {
          assignedToName: assignedTo,
        });
        await refreshProjects();
        await refreshTeamMembers();
      } catch (err) {
        console.error("Failed to add task", err);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshProjects, refreshTeamMembers]
  );

  const handleAddNewTeamMember = useCallback(
    async (name: string) => {
      setIsActionLoading(true);
      try {
        if (!name || teamMembers.includes(name)) return;
        await api.createTeamMember(name);
        await refreshTeamMembers();
      } catch (err) {
        console.error("Failed to add team member", err);
      } finally {
        setIsActionLoading(false);
      }
    },
    [teamMembers, refreshTeamMembers]
  );

  const handleAddProject = useCallback(async () => {
    setIsActionLoading(true);
    try {
      if (!newProjectName.trim()) return;
      await api.createProject(newProjectName.trim());
      setNewProjectName("");
      await refreshProjects();
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setIsActionLoading(false);
    }
  }, [newProjectName, refreshProjects]);

  const toggleTaskCompletion = useCallback(
    async (_projectId: number, taskId: number) => {
      setIsActionLoading(true);
      try {
        await api.toggleTask(taskId);
        await refreshProjects();
      } catch (err) {
        console.error("Failed to toggle task completion", err);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshProjects]
  );

  const handleDeleteProject = useCallback(
    async (id: number) => {
      setIsActionLoading(true);
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
      } finally {
        setIsActionLoading(false);
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

      setIsActionLoading(true);
      try {
        await api.updateProject(projectId, { progress: progress! });
        setProgressUpdate((prev) => ({ ...prev, [projectId]: progress! }));
        await refreshProjects();
      } catch (err) {
        console.error("Failed to update project progress", err);
      } finally {
        setIsActionLoading(false);
      }
    },
    [refreshProjects]
  );

return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Action Loader Overlay */}
      {isActionLoading && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center 
                     bg-white/30 backdrop-blur-sm" // <-- UPDATED CLASSES HERE
        >
          <div className="p-4 bg-white rounded-lg shadow-xl flex items-center">
            <Loader size={24} />
            <span className="ml-3 text-slate-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      <main className="p-6 md:p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {" "}
        <section className="lg:col-span-2">
          {" "}
          <header className="mb-8">
            {" "}
            <h1 className="text-4xl font-extrabold text-slate-900">
              Project & Team Management Console{" "}
            </h1>{" "}
            <p className="text-slate-500 mt-2 text-lg">
              Central hub for tracking progress, managing resources, and
              initiating new workstreams.{" "}
            </p>{" "}
          </header>{" "}
          {isInitialLoading ? (
            // Skeleton for ProjectList
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />{" "}
            </div>
          ) : (
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
              onOpenProjectDetails={handleOpenProjectDetails} isActionLoading={false}            />
          )}{" "}
        </section>{" "}
        <aside>
          {" "}
          {isInitialLoading ? (
            // Skeleton for TeamOverview
            <div className="p-6 bg-white rounded-lg shadow space-y-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full" />{" "}
              <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />{" "}
              </div>{" "}
            </div>
          ) : (
            <TeamOverview
              team={teamOverviewMembers}
              handleAddNewTeamMember={handleAddNewTeamMember} isActionLoading={false}            />
          )}{" "}
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
          manualProgressValue={progressUpdate[selectedProject.id]} isActionLoading={false}          />{" "}
        </Modal>
      )}{" "}
    </div>
  );
};

export default Dashboard;
