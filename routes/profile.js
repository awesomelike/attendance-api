import { Router } from 'express';
import profile from '../controllers/profile';
import auth from '../middlewares/auth';
import {
  check, checkPassword, validate, validatePassword,
} from '../util/validation/profile';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), profile.getProfile);
router.get('/makeups', auth, allowRoles([PROFESSOR]), profile.getMakeups);
router.post('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), check, validate, profile.updateProfile);
router.post('/changePassword', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), checkPassword, validatePassword, profile.updatePassword);

export default router;
