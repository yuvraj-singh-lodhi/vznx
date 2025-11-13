// src/services/projectService.ts
import prisma from "../db/prisma";

// Prisma enum is NOT exported, so we define the TS type ourselves.
export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export async function listProjects() {
  return prisma.project.findMany({
    include: { tasks: { include: { assignedTo: true } } },
    orderBy: { updatedAt: "desc" },
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
    data: { name, status: "PENDING", progress: 0 },
  });
}

export async function updateProject(
  id: number,
  data: { name?: string; status?: ProjectStatus | string; progress?: number }
) {
  const payload: {
    name?: string;
    status?: ProjectStatus;
    progress?: number;
  } = {};

  if (data.name !== undefined) payload.name = data.name;

  if (data.status !== undefined) {
    // normalize status to our union type
    const statusUpper = data.status.toString().toUpperCase() as ProjectStatus;
    payload.status = statusUpper;
  }

  if (data.progress !== undefined) payload.progress = data.progress;

  return prisma.project.update({
    where: { id },
    data: payload,
  });
}

export async function deleteProject(id: number) {
  await prisma.task.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
}

/**
 * Recalculate progress and status based on project tasks.
 */
export async function recalcAndUpdateProjectProgress(projectId: number) {
  const tasks = await prisma.task.findMany({ where: { projectId } });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isComplete).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const status: ProjectStatus =
    progress === 100
      ? "COMPLETED"
      : progress > 0
      ? "IN_PROGRESS"
      : "PENDING";

  return prisma.project.update({
    where: { id: projectId },
    data: { progress, status },
  });
}
