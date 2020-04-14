import { Router } from 'express';
import timeslot from '../controllers/timeslot';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, timeslot.getAll);
router.get('/:id', auth, timeslot.get);

export default router;
