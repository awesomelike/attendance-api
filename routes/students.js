import { Router } from 'express';
import student from '../controllers/student';
import auth, { authAttendance } from '../middlewares/auth';
import { checkStudentRfid, validateRfid } from '../util/validation/rfid';

const router = Router();

router.get('/', auth, student.getAll);
router.get('/:id', auth, student.get);
router.get('/:id/timetable', auth, student.getTimetable);
router.post('/rfid', authAttendance, checkStudentRfid, validateRfid, student.handleRfid);

export default router;
