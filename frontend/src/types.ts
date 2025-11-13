// src/types.ts
export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Team member returned by the API (Prisma model).
 */
export interface TeamMember {
  assignedTasks: number;
  id: number;
  name: string;
  capacity: number;
  // tasks may be included when fetching team members with include: { tasks: true }
  tasks?: Task[];
  createdAt?: string; // ISO datetime
  updatedAt?: string; // ISO datetime
}

/**
 * Task shape returned by the API.
 * assignedTo is the team member relation (object) or null if unassigned.
 */
export interface Task {
  id: number;
  name: string;
  isComplete: boolean;
  // when returned by Prisma, assignedTo is an object { id, name, ... } or null
  assignedTo?: TeamMember | null;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Project shape returned by the API.
 */
export interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  tasks: Task[];
  progress: number; // 0..100
  createdAt?: string;
  updatedAt?: string;
}
