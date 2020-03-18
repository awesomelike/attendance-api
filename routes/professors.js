import { Router } from 'express';
import professor from '../controllers/professor';
import { checkProfessorRfid, validateRfid } from '../util/validation/rfid';

const router = Router();

router.get('/', professor.getAll);
router.get('/:id', professor.get);
router.get('/:id/sections', professor.getSections);
router.get('/rfid/:rfid', professor.getByRfid);
router.post('/rfid', checkProfessorRfid, validateRfid, professor.handleRfid);

export default router;
