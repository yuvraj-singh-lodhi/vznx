// src/routes/projects.ts
import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import * as taskController from '../controllers/taskController';

const router = Router();

router.get('/', projectController.list);
router.post('/', projectController.create);
router.get('/:id', projectController.getOne);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);

// nested tasks
router.post('/:projectId/tasks', taskController.create);

export default router;
