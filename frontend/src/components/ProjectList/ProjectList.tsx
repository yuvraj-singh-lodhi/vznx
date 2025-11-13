// File: src/components/ProjectList/ProjectList.tsx
import React from 'react';
import type { Project } from '../../types';
import ProjectCard from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  allTeamMembers: string[];
  toggleTaskCompletion: (projectId: number, taskId: number) => void;
  handleManualProgressUpdate: (projectId: number, value: string) => void;
  handleDeleteProject: (projectId: number) => void;
  handleAddProject: () => void;
  handleAddTask: (projectId: number, taskName: string, assignedTo: string) => void;
  newProjectName: string;
  setNewProjectName: (name: string) => void;
  progressUpdates: { [key: number]: number };
  newProjectInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenProjectDetails: (projectId: number) => void; // New prop
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  handleDeleteProject,
  handleAddProject,
  newProjectName,
  setNewProjectName,
  newProjectInputRef,
  onOpenProjectDetails,
}) => {
  return (
    <section className="mb-10">
      <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">🚀 Projects Overview</h2>
            <p className="text-slate-500 text-md mt-1">Click a card to view and manage tasks.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 md:mt-0">
            <input
              ref={newProjectInputRef}
              type="text"
              placeholder="Enter new project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddProject(); }}
              className="p-2.5 border border-slate-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-sky-300 shadow-sm transition-all"
            />
            <button
              onClick={handleAddProject}
              className="px-5 py-2.5 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 shadow-lg transition-transform transform-gpu hover:-translate-y-0.5"
            >
              Create Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              handleDeleteProject={handleDeleteProject}
              onOpenDetails={onOpenProjectDetails} 
            />
          ))}
          {projects.length === 0 && (
            <div className="col-span-full p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-xl font-medium text-slate-700">No Projects Found</p>
              <p className="text-slate-500 mt-2">Use the "Create Project" button above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectList;