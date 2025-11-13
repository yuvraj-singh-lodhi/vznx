// src/services/projectService.ts
import prisma from '../db/prisma';
import { ProjectStatus } from '@prisma/client';

export async function listProjects() {
  return prisma.project.findMany({
    include: { tasks: { include: { assignedTo: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getProject(id: number) {
  return prisma.project.findUnique({
    where: { id },
    include: { tasks: { include: { assignedTo: true } } },
  });
}

export async function createProject(name: string) {
  return prisma.project.create({
    data: { name, status: ProjectStatus.PENDING, progress: 0 },
  });
}

export async function updateProject(id: number, data: { name?: string; status?: ProjectStatus | string; progress?: number }) {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.status !== undefined) payload.status = data.status as ProjectStatus;
  if (data.progress !== undefined) payload.progress = data.progress;

  return prisma.project.update({
    where: { id },
    data: payload,
  });
}

export async function deleteProject(id: number) {
  // remove tasks first to avoid FK issues
  await prisma.task.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
}

/**
 * Recalculate progress and status for a project based on its tasks.
 */
export async function recalcAndUpdateProjectProgress(projectId: number) {
  const tasks = await prisma.task.findMany({ where: { projectId } });
  const total = tasks.length;
  const completed = tasks.filter(t => t.isComplete).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const status =
    progress === 100 ? ProjectStatus.COMPLETED
    : progress > 0 ? ProjectStatus.IN_PROGRESS
    : ProjectStatus.PENDING;

  return prisma.project.update({
    where: { id: projectId },
    data: { progress, status },
  });
}
