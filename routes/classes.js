import { Router } from 'express';
import classController from '../controllers/class';

const router = Router();

router.get('/', classController.getAll);
router.get('/:id', classController.get);
router.get('/:id/classItems', classController.getClassItems);

export default router;
