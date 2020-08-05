import { Router } from 'express';
import student, { areStudentsFree } from '../controllers/student';
import auth, { authAttendance } from '../middlewares/auth';
import { checkStudentRfid, validateRfid } from '../util/validation/rfid';
import checkStudents from '../middlewares/students';

const router = Router();

router.get('/', auth, student.getAll);
router.get('/checkFree', auth, checkStudents, areStudentsFree);
router.get('/:id', auth, student.get);
router.get('/:id/timetable', auth, student.getTimetable);
router.post('/rfid', authAttendance, checkStudentRfid, validateRfid, student.handleRfid);

export default router;
