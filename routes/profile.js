import { Router } from 'express';
import profile from '../controllers/profile';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, profile.getProfile);

export default router;
