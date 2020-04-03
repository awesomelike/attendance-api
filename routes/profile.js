import { Router } from 'express';
import profile from '../controllers/profile';
import authMiddleware from '../middlewares/auth';
import {
  check, checkPassword, validate, validatePassword,
} from '../util/validation/profile';

const router = Router();

router.get('/', authMiddleware, profile.getProfile);
router.post('/', authMiddleware, check, validate, profile.updateProfile);
router.post('/changePassword', authMiddleware, checkPassword, validatePassword, profile.updatePassword);

export default router;
