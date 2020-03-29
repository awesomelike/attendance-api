import { Router } from 'express';
import weekday from '../controllers/weekday';

const router = Router();

router.get('/', weekday.getAll);

export default router;
