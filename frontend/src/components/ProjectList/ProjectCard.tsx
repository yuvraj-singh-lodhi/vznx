// src/components/ProjectList/ProjectCard.tsx
import React from 'react';
import type { Project } from '../../types';
import { motion } from 'framer-motion';
import ProgressBar from '../UI/ProgressBar';
import StatusPill from '../UI/StatusPill';
import Loader from '../UI/Loader';

interface ProjectCardProps {
  project: Project;
  handleDeleteProject: (projectId: number) => void;
  onOpenDetails: (projectId: number) => void;
  isActionLoading: boolean; 
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  handleDeleteProject,
  onOpenDetails,
  isActionLoading,
}) => {

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActionLoading) {
      handleDeleteProject(project.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl bg-white shadow-xl border border-slate-100 transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-sky-300"
    >
      <button
        type="button"
        onClick={() => onOpenDetails(project.id)}
        className="w-full text-left p-5 focus:outline-none"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1 pr-4">
            <h3 className="text-xl font-bold text-slate-900 truncate">{project.name}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {project.tasks.length} Tasks ({project.tasks.filter(t => t.isComplete).length} Done)
            </p>
          </div>

          <div className="shrink-0">
            <StatusPill status={project.status} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-600 mb-1">Progress: {project.progress}%</p>
            <ProgressBar progress={project.progress} />
          </div>

          <button
            onClick={handleDeleteClick}
            disabled={isActionLoading}
            className={`p-2 rounded-full transition-colors shrink-0 ${
              isActionLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'hover:bg-red-50 text-slate-400 hover:text-red-600' 
            }`}
            aria-label={`Delete project ${project.name}`}
            title="Delete project"
          >
            {isActionLoading ? (
              <Loader size={20} />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            )}
          </button>
        </div>
      </button>
    </motion.div>
  );
};

export default ProjectCard;