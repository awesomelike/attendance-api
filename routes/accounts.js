import { Router } from 'express';
import account from '../controllers/account';
import auth from '../middlewares/auth';
import { check, validate } from '../util/validation/account';
import { CREATE } from '../constants/types';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), account.getAll);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), account.get);
router.post('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), check(CREATE), validate, account.create);
router.post('/:id', auth, check(), validate, account.update);

export default router;
