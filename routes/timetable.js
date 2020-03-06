import { Router } from 'express';
import timetable from '../controllers/timetable';

const router = Router();

router.post('/', timetable.handlePost);

export default router;
