import { Router } from 'express';
import record from '../controllers/record';
import auth, { authAttendance } from '../middlewares/auth';

const router = Router();

router.get('/', auth, record.getAll);
router.post('/:id/attend', authAttendance, record.attend);
router.post('/:id/unattend', authAttendance, record.unattend);

export default router;
