import { Router } from 'express';
import authMiddleware from '../middlewares/auth';
import makeup from '../controllers/makeup';
import { check, validate } from '../util/validation/makeup';
import { RESOLVE } from '../constants/makeup';

const router = Router();

router.get('/', authMiddleware, makeup.getAll);
router.get('/:id', authMiddleware, makeup.get);
router.post('/', authMiddleware, check(), validate, makeup.create);
router.post('/:id', authMiddleware, check(), validate, makeup.update);
router.post('/:id/resolve', authMiddleware, check(RESOLVE));

export default router;
