import { Router } from 'express';
import timetable from '../controllers/timetable';

const router = Router();
router.get('/professor/:id', timetable.getProfessorTimetable);
router.get('/day/:weekDayId', timetable.getDayTimetable);
router.get('/date/:date', timetable.getDateTimetable);
router.post('/', timetable.handlePost);

export default router;
