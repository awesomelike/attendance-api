import { Router } from 'express';
import classController from '../controllers/class';
import auth from '../middlewares/auth';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), classController.getAll);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), classController.get);
router.get('/:id/classItems', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), classController.getClassItems);

export default router;
