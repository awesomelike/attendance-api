import { Router } from 'express';
import role from '../controllers/role';
import { check, validate } from '../util/validation/role';

const router = Router();

router.get('/', role.getAll);
router.get('/', role.get);
router.post('/', role.create);
router.post('/:id', check, validate, role.update);

export default router;
