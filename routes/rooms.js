import { Router } from 'express';
import room from '../controllers/room';

const router = Router();

router.get('/', room.getAll);

export default router;
