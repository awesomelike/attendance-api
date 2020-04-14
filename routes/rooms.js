import { Router } from 'express';
import room from '../controllers/room';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, room.getAll);

export default router;
