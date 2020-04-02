import { Router } from 'express';
import permission from '../controllers/permission';

const router = Router();

router.get('/', permission.getAll);

export default router;
