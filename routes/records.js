import { Router } from 'express';
import record from '../controllers/record';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, record.getAll);

export default router;
