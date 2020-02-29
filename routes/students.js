import { Router } from 'express';
import student from '../controllers/student';

const router = Router();

router.get('/', student.getAll);
router.get('/search', student.getSome);

export default router;
