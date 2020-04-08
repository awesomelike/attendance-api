import { Router } from 'express';
import authMiddleware from '../middlewares/auth';
import makeup from '../controllers/makeup';
import { check, validate } from '../util/validation/makeup';
import { CREATE, RESOLVE } from '../constants/types';

const router = Router();

router.get('/', authMiddleware, makeup.getAll);
router.get('/:id', authMiddleware, makeup.get);
router.post('/', authMiddleware, check(CREATE), validate, makeup.create);
router.post('/:id', authMiddleware, check(), validate, makeup.update);
router.post('/:id/resolve', authMiddleware, check(RESOLVE), validate, makeup.resolve);

export default router;
