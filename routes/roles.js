import { Router } from 'express';
import role from '../controllers/role';
import { check, validate } from '../util/validation/role';
import auth from '../middlewares/auth';

const router = Router();

router.get('/', auth, role.getAll);
router.get('/:id', auth, role.get);
router.post('/', auth, role.create);
router.post('/:id', auth, check, validate, role.update);

export default router;
