import { Router } from 'express';
import course from '../controllers/course';
import auth from '../middlewares/auth';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), course.getAll);
router.get('/missedClasses/:week', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), course.getMissedClasses);
router.get('/semesterReport', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), course.getSemesterReport);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), course.get);
router.get('/:id/sections', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), course.getSections);


export default router;
