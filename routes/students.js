import { Router } from 'express';
import student from '../controllers/student';
import { checkRfid, validateRfid } from '../util/validation/student';

const router = Router();

router.get('/', student.getAll);
router.get('/search', student.getSome);
router.post('/rfid', checkRfid, validateRfid, student.handleRfid);

export default router;
