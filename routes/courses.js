import { Router } from 'express';
import course from '../controllers/course';

const router = Router();

router.get('/', course.getAll);
router.get('/:id', course.get);


export default router;
