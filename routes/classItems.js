import { Router } from 'express';
import classItem from '../controllers/classItem';

const router = Router();

router.get('/', classItem.getAll);
router.get('/:id', classItem.get);
export default router;
