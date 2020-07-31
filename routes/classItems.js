import { Router } from 'express';
import classItem from '../controllers/classItem';
import auth, { authAttendance } from '../middlewares/auth';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';
import { checkProfessorRfid, validateRfid } from '../util/validation/rfid';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), classItem.getAll);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), classItem.get);
router.get('/:id/excel', classItem.getExcel);
router.get('/:id/rfid', authAttendance, classItem.get);
router.post('/:id', checkProfessorRfid, validateRfid, classItem.finishClass);

export default router;
