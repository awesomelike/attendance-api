import { Router } from 'express';
import semester from '../controllers/semester';

const router = Router();

router.get('/', semester.getAll);
router.get('/:id', semester.get);

export default router;
