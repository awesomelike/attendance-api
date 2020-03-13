import { Router } from 'express';
import professor from '../controllers/professor';

const router = Router();

router.get('/', professor.getAll);
router.get('/:id', professor.get);
router.post('/rfid', professor.handleRfid);

export default router;
