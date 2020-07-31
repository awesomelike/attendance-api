import { Router } from 'express';
import timetable from '../controllers/timetable';
import auth from '../middlewares/auth';

const router = Router();
router.get('/professor/:id', auth, timetable.getProfessorTimetable);
router.get('/professor/:id/date/:date', auth, timetable.getProfTimetableByDate);
router.get('/day/:weekDayId', auth, timetable.getDayTimetable);
router.get('/date/:date', auth, timetable.getDateTimetable);
router.post('/', auth, timetable.handlePostTimetable);
router.post('/records', auth, timetable.handlePostRecords);
router.post('/telegram', auth, timetable.handlePostTelegram);

export default router;
