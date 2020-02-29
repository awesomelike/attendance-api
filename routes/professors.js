import { Router } from 'express';
import professor from '../controllers/professor';

const router = Router();

router.get('/', professor.getAll);
router.get('/:id', professor.get);

export default router;
