// src/services/taskService.ts
import prisma from '../db/prisma';
import * as projectService from './projectService';

/**
 * Create a task attached to a project.
 * Uses relation connect objects (project & assignedTo) so it matches Prisma's typed create input.
 */
export async function createTask(projectId: number, name: string, assignedToId?: number | null) {
  const data: any = {
    name,
    project: { connect: { id: projectId } },
  };

  if (assignedToId !== undefined && assignedToId !== null) {
    data.assignedTo = { connect: { id: assignedToId } };
  }

  const task = await prisma.task.create({ data });

  await projectService.recalcAndUpdateProjectProgress(projectId);
  return task;
}

/**
 * Toggle a task's isComplete boolean and recalc parent project progress.
 */
export async function toggleTaskCompletion(taskId: number) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { isComplete: !task.isComplete },
  });

  await projectService.recalcAndUpdateProjectProgress(updated.projectId);
  return updated;
}

/**
 * Update a task. For assignedToId:
 *  - undefined  => leave relation untouched
 *  - null       => disconnect relation (unassign)
 *  - number     => connect to that TeamMember id
 */
export async function updateTask(
  taskId: number,
  data: { name?: string; assignedToId?: number | null; isComplete?: boolean }
) {
  // Build the update payload with relation operations to satisfy Prisma's types
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.isComplete !== undefined) payload.isComplete = data.isComplete;

  if (data.assignedToId === undefined) {
    // do nothing (leave relation as-is)
  } else if (data.assignedToId === null) {
    payload.assignedTo = { disconnect: true };
  } else {
    payload.assignedTo = { connect: { id: data.assignedToId } };
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: payload,
  });

  await projectService.recalcAndUpdateProjectProgress(updated.projectId);
  return updated;
}

/**
 * Delete a task and recalc the parent project's progress.
 */
export async function deleteTask(taskId: number) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const deleted = await prisma.task.delete({ where: { id: taskId } });
  await projectService.recalcAndUpdateProjectProgress(task.projectId);
  return deleted;
}
