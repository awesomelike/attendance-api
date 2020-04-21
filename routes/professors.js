import { Router } from 'express';
import professor from '../controllers/professor';
import { checkProfessorRfid, validateRfid } from '../util/validation/rfid';
import auth from '../middlewares/auth';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), professor.getAll);
router.get('/lecturesReport', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), professor.getLecturesReport);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), professor.get);
router.get('/:id/sections', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), professor.getSections);
router.get('/:id/makeups', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), professor.getMakeups);
router.get('/rfid/:rfid', professor.getByRfid);
router.post('/rfid', checkProfessorRfid, validateRfid, professor.handleRfid);

export default router;
