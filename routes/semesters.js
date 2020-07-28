import { Router } from 'express';
import semester from '../controllers/semester';
import { storeStudents, storeTimetable } from '../controllers/import';
import auth from '../middlewares/auth';
import { check, validate } from '../util/validation/semester';
import { ADMIN, ACADEMIC_AFFAIRS } from '../data/seed/roles';
import allowRoles from '../middlewares/role';
import { checkTimetable, validateTimetable } from '../util/validation/timetable';

const router = Router();

router.get('/', auth, semester.getAll);
router.get('/:id', auth, semester.get);
router.post('/:id/importTimetable', auth, checkTimetable, validateTimetable, storeStudents, storeTimetable);
router.post('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), check, validate, semester.create);

export default router;
