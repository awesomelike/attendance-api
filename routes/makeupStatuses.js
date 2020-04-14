import { Router } from 'express';
import makeupStatus from '../controllers/makeupStatus';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, makeupStatus.getAll);

export default router;
