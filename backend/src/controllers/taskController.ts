// src/controllers/taskController.ts
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import * as teamService from '../services/teamService';

export async function create(req: Request, res: Response) {
  try {
    const projectId = Number(req.params.projectId);
    const { name, assignedToId, assignedToName } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    let assignedId = assignedToId;
    if (assignedToName && !assignedToId) {
      const member = await teamService.findOrCreateByName(assignedToName);
      assignedId = member.id;
    }

    const task = await taskService.createTask(projectId, name, assignedId);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function toggleComplete(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const updated = await taskService.toggleTaskCompletion(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { name, assignedToId, isComplete } = req.body;
    const updated = await taskService.updateTask(id, { name, assignedToId, isComplete });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await taskService.deleteTask(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
