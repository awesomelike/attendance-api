import { Router } from 'express';
import semester from '../controllers/semester';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, semester.getAll);
router.get('/:id', auth, semester.get);

export default router;
