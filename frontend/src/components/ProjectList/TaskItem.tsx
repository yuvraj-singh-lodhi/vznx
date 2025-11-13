// src/components/ProjectList/TaskItem.tsx
import React from 'react';
import type { Task } from '../../types';
import { motion } from 'framer-motion';
import Loader from '../UI/Loader';

interface TaskItemProps {
  task: Task;
  projectId: number;
  toggleTaskCompletion: (projectId: number, taskId: number) => void;
  isActionLoading: boolean; 
}

const getAssigneeName = (assignedTo: string | { name?: string } | null | undefined) => {
  if (!assignedTo) return 'Unassigned';
  if (typeof assignedTo === 'string') return assignedTo;
  if (typeof assignedTo === 'object') return assignedTo.name ?? 'Unassigned';
  return String(assignedTo);
};

const TaskItem: React.FC<TaskItemProps> = ({ task, projectId, toggleTaskCompletion, isActionLoading }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
    className={`flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 rounded-lg transition-colors duration-150 ${
        isActionLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-sky-50'
    }`}
  >
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <button
        onClick={() => toggleTaskCompletion(projectId, task.id)}
        disabled={isActionLoading}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
            task.isComplete 
                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600' 
                : 'border-slate-300 text-slate-600 hover:border-sky-400 hover:bg-white'
        } ${isActionLoading ? 'cursor-not-allowed' : ''}`}
        aria-pressed={task.isComplete}
        aria-label={task.isComplete ? 'Mark task incomplete' : 'Mark task complete'}
      >
        {isActionLoading ? (
            <Loader size={18} /> 
        ) : task.isComplete ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth={1.5} /></svg>
        )}
      </button>

      <div className="min-w-0">
        <div className={`text-sm font-medium truncate ${task.isComplete ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.name}</div>
        <div className="text-xs text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full inline-block mt-0.5 font-semibold">
          {getAssigneeName(task.assignedTo)}
        </div>
      </div>
    </div>

    <div className={`text-xs px-3 py-1 rounded-full font-bold uppercase ml-4 shrink-0 ${task.isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
      {task.isComplete ? 'Complete' : 'Active'}
    </div>
  </motion.div>
);

export default TaskItem;