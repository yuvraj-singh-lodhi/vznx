// src/controllers/teamController.ts
import { Request, Response } from 'express';
import * as teamService from '../services/teamService';

export async function list(req: Request, res: Response) {
  try {
    const list = await teamService.listTeamMembers();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { name, capacity } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const member = await teamService.createTeamMember(name, capacity ?? 5);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await teamService.deleteTeamMember(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
