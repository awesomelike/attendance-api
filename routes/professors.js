import { Router } from 'express';
import professor from '../controllers/professor';
import { checkRfid, validateRfid } from '../util/validation/rfid';

const router = Router();

router.get('/', professor.getAll);
router.get('/:id', professor.get);
router.post('/rfid', checkRfid, validateRfid, professor.handleRfid);

export default router;
