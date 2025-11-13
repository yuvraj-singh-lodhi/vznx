// src/routes/tasks.ts
import { Router } from 'express';
import * as taskController from '../controllers/taskController';

const router = Router();

// Update a task
router.put('/:id', taskController.update);

// Toggle complete/incomplete
router.post('/:id/toggle', taskController.toggleComplete);

// Delete a task
router.delete('/:id', taskController.remove);

export default router;
