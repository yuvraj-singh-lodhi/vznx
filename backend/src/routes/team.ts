// src/routes/team.ts
import { Router } from 'express';
import * as teamController from '../controllers/teamController';

const router = Router();

router.get('/', teamController.list);
router.post('/', teamController.create);
router.delete('/:id', teamController.remove);

export default router;
