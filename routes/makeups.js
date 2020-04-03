import { Router } from 'express';
import authMiddleware from '../middlewares/auth';
import makeup from '../controllers/makeup';

const router = Router();

router.get('/', authMiddleware, makeup.getAll);
router.get('/:id', authMiddleware, makeup.get);

export default router;
