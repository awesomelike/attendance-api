import { Router } from 'express';
import timeslot from '../controllers/timeslot';

const router = Router();

router.get('/', timeslot.getAll);
router.get('/:id', timeslot.get);

export default router;
