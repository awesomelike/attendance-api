import { Router } from 'express';
import section from '../controllers/section';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, section.getAll);
router.get('/:id', auth, section.get);
router.get('/:id/classes', auth, section.getClasses);
export default router;
