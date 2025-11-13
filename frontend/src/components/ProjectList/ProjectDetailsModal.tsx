// src/components/ProjectList/ProjectDetailsModal.tsx
import React, { useState } from 'react';
import type { Project } from '../../types';
import ProgressBar from '../UI/ProgressBar';
import StatusPill from '../UI/StatusPill';
import TaskItem from './TaskItem';

interface ProjectDetailsModalProps {
  project: Project;
  allTeamMembers: string[];
  toggleTaskCompletion: (projectId: number, taskId: number) => void;
  handleAddTask: (projectId: number, taskName: string, assignedTo: string) => void;
  handleManualProgressUpdate: (projectId: number, value: string) => void;
  manualProgressValue: number | undefined;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  allTeamMembers,
  toggleTaskCompletion,
  handleAddTask,
  handleManualProgressUpdate,
  manualProgressValue,
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(allTeamMembers[0] || 'Unassigned');

  const onAddTask = () => {
    if (!newTaskName.trim()) return;
    handleAddTask(project.id, newTaskName.trim(), newTaskAssignee);
    setNewTaskName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-600">Status: <StatusPill status={project.status} /></p>
          <p className="text-sm font-medium text-slate-600">ID: #{project.id}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 mb-1">Overall Progress: {project.progress}%</p>
            <ProgressBar progress={project.progress} />
          </div>
          
          <div className="flex flex-col items-center shrink-0">
            <label htmlFor="manual-progress" className="text-xs text-slate-500 mb-0.5">Manual %</label>
            <input
              id="manual-progress"
              type="number"
              min={0}
              max={100}
              placeholder="%"
              value={manualProgressValue !== undefined ? manualProgressValue : ''}
              onChange={(e) => handleManualProgressUpdate(project.id, e.target.value)}
              className="w-16 text-center text-sm border border-slate-300 rounded-lg p-1.5 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-sm"
              aria-label={`Manual progress for ${project.name}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xl font-semibold text-slate-800 mb-3">
          Tasks ({project.tasks.filter(t => !t.isComplete).length} Pending / {project.tasks.length} Total)
        </h4>

        {project.tasks.length === 0 && (
          <p className="text-md italic text-slate-500 py-4 text-center border border-dashed rounded-lg">
            No tasks found. Add your first task below.
          </p>
        )}

        <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2 max-h-48 overflow-y-auto">
          {project.tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={project.id}
              toggleTaskCompletion={toggleTaskCompletion}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 border border-slate-300 rounded-lg bg-white shadow-sm">
        <h5 className="text-lg font-medium text-slate-700 mb-3">Add New Task</h5>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <input
            type="text"
            placeholder="Task description..."
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onAddTask(); }}
            className="md:col-span-2 p-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-300 w-full"
          />

          <select
            value={newTaskAssignee}
            onChange={(e) => setNewTaskAssignee(e.target.value)}
            className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-300 w-full"
          >
            {allTeamMembers.map(member => (
              <option key={member} value={member}>{member}</option>
            ))}
            {allTeamMembers.length === 0 && <option value="Unassigned">Add Members First</option>}
          </select>

          <button
            onClick={onAddTask}
            disabled={!newTaskName.trim()}
            className="px-4 py-2.5 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 shadow-md transition-all disabled:bg-slate-400 disabled:shadow-none w-full"
          >
            + Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;