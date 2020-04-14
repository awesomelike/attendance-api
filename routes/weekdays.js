import { Router } from 'express';
import weekday from '../controllers/weekday';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, weekday.getAll);

export default router;
