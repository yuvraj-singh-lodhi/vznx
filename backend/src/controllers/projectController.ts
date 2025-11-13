// src/controllers/projectController.ts
import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

export async function list(req: Request, res: Response) {
  try {
    const projects = await projectService.listProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const project = await projectService.getProject(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const p = await projectService.createProject(name);
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { name, status, progress } = req.body;
    const updated = await projectService.updateProject(id, { name, status, progress });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await projectService.deleteProject(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
