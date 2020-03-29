import { Router } from 'express';
import course from '../controllers/course';

const router = Router();

router.get('/', course.getAll);
router.get('/missedClasses/:week', course.getMissedClasses);
router.get('/semesterReport', course.getSemesterReport);
router.get('/:id', course.get);
router.get('/:id/sections', course.getSections);


export default router;
