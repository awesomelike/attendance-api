import { Router } from 'express';
import record from '../controllers/record';

const router = Router();

router.get('/', record.getAll);

export default router;
