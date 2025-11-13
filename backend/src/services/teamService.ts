// src/services/teamService.ts
import prisma from '../db/prisma';

export async function listTeamMembers() {
  return prisma.teamMember.findMany({ include: { tasks: true }, orderBy: { name: 'asc' } });
}

export async function createTeamMember(name: string, capacity = 5) {
  return prisma.teamMember.create({ data: { name, capacity } });
}

export async function deleteTeamMember(id: number) {
  await prisma.task.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } });
  return prisma.teamMember.delete({ where: { id } });
}

/**
 * Convenience: find or create team member by name.
 */
export async function findOrCreateByName(name: string, capacity = 5) {
  const existing = await prisma.teamMember.findUnique({ where: { name } });
  if (existing) return existing;
  return createTeamMember(name, capacity);
}
