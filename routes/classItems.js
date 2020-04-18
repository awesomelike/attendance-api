import { Router } from 'express';
import classItem from '../controllers/classItem';
import auth from '../middlewares/auth';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';
import { checkProfessorRfid, validateRfid } from '../util/validation/rfid';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), classItem.getAll);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), classItem.get);
router.post('/:id', checkProfessorRfid, validateRfid, classItem.finishClass);

export default router;
