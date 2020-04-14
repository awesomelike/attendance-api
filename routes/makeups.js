import { Router } from 'express';
import auth from '../middlewares/auth';
import makeup from '../controllers/makeup';
import { check, validate } from '../util/validation/makeup';
import { CREATE, RESOLVE } from '../constants/types';
import allowRoles from '../middlewares/role';
import { ADMIN, ACADEMIC_AFFAIRS, PROFESSOR } from '../data/seed/roles';

const router = Router();

router.get('/', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), makeup.getAll);
router.get('/:id', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS, PROFESSOR]), makeup.get);
router.post('/', auth, allowRoles([PROFESSOR]), check(CREATE), validate, makeup.create);
router.post('/:id', auth, allowRoles([PROFESSOR]), check(), validate, makeup.update);
router.post('/:id/resolve', auth, allowRoles([ADMIN, ACADEMIC_AFFAIRS]), check(RESOLVE), validate, makeup.resolve);

export default router;
