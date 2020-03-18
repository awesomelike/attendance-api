import { Router } from 'express';
import section from '../controllers/section';

const router = Router();

router.get('/', section.getAll);
router.get('/:id', section.get);

export default router;
