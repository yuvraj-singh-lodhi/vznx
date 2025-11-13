// src/utils/api.ts
type ImportMetaEnvType = {
  VITE_API_URL?: string;
};

const ENV_BASE = (import.meta as { env: ImportMetaEnvType }).env?.VITE_API_URL;
const BASE = (ENV_BASE ?? 'http://localhost:3000') + '/api';

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers ?? {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...opts, headers });

  if (!res.ok) {
    const contentType = res.headers.get('content-type') ?? '';
    let body: Record<string, unknown> | string | undefined = undefined;

    if (contentType.includes('application/json')) {
      body = await res.json().catch(() => undefined);
    } else {
      body = await res.text().catch(() => undefined);
    }

    const message = (typeof body === 'object' && body ? body.error ?? body.message : body) ?? res.statusText ?? 'Request failed';
    throw new Error(`${res.status} ${message}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}

import type { Project, Task, TeamMember } from '../types';

export async function getProjects(): Promise<Project[]> {
  return request<Project[]>('/projects', { method: 'GET' });
}

export async function getProject(id: number): Promise<Project> {
  return request<Project>(`/projects/${id}`, { method: 'GET' });
}

export async function createProject(name: string): Promise<Project> {
  return request<Project>('/projects', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateProject(
  id: number,
  payload: { name?: string; status?: string; progress?: number }
): Promise<Project> {
  return request<Project>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProject(id: number): Promise<void> {
  return request<void>(`/projects/${id}`, { method: 'DELETE' });
}

export async function createTask(
  projectId: number,
  name: string,
  opts?: { assignedToId?: number; assignedToName?: string }
): Promise<Task> {
  const body: { name: string; assignedToId?: number; assignedToName?: string } = { name };
  if (opts?.assignedToId !== undefined) body.assignedToId = opts.assignedToId;
  if (opts?.assignedToName !== undefined) body.assignedToName = opts.assignedToName;
  return request<Task>(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function toggleTask(taskId: number): Promise<Task> {
  return request<Task>(`/tasks/${taskId}/toggle`, { method: 'POST' });
}

export async function updateTask(
  taskId: number,
  payload: { name?: string; assignedToId?: number | null; isComplete?: boolean }
): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/tasks/${taskId}`, { method: 'DELETE' });
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return request<TeamMember[]>('/team', { method: 'GET' });
}

export async function createTeamMember(name: string, capacity = 5): Promise<TeamMember> {
  return request<TeamMember>('/team', {
    method: 'POST',
    body: JSON.stringify({ name, capacity }),
  });
}

export async function deleteTeamMember(id: number): Promise<void> {
  return request<void>(`/team/${id}`, { method: 'DELETE' });
}

export type TeamOverviewItem = {
  id: number;
  name: string;
  assignedTasks: number;
  capacity: number;
  capacityPct: number; // 0..100
  loadColor: 'green' | 'orange' | 'red';
};

export async function getTeamOverview(): Promise<TeamOverviewItem[]> {
  const members = await getTeamMembers();
  const items: TeamOverviewItem[] = members.map((m) => {
    const assignedTasks = Array.isArray(m.tasks) ? m.tasks.length : 0;
    const capacity = m.capacity ?? 5;
    const capacityPct = Math.round((assignedTasks / capacity) * 100);
    const loadColor = capacityPct <= 70 ? 'green' : capacityPct <= 100 ? 'orange' : 'red';
    return {
      id: m.id,
      name: m.name,
      assignedTasks,
      capacity,
      capacityPct: Math.min(999, capacityPct),
      loadColor,
    };
  });
  return items;
}

export async function syncSeed(projects: Partial<Project>[], team: Partial<TeamMember>[]) {
  const createdMembers: Record<string, TeamMember> = {};
  for (const tm of team) {
    if (!tm.name) continue;
    const created = await createTeamMember(tm.name, tm.capacity ?? 5);
    createdMembers[created.name] = created;
  }

  for (const p of projects) {
    if (!p.name) continue;
    const createdP = await createProject(p.name);
    if (Array.isArray(p.tasks)) {
      for (const t of p.tasks as Task[]) {
        await createTask(createdP.id, t.name ?? 'Untitled task', {
          assignedToId: t.assignedTo ? createdMembers[String(t.assignedTo)]?.id : undefined,
        });
      }
    }
  }
}
