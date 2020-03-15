import { Router } from 'express';
import student from '../controllers/student';
import { checkStudentRfid, validateRfid } from '../util/validation/rfid';

const router = Router();

router.get('/', student.getAll);
router.get('/search', student.getSome);
router.post('/rfid', checkStudentRfid, validateRfid, student.handleRfid);

export default router;
