import { Router } from 'express';
import account from '../controllers/account';
import authMiddleware from '../middlewares/auth';
import { check, validate } from '../util/validation/account';
import { CREATE } from '../constants/types';

const router = Router();

router.get('/', authMiddleware, account.getAll);
router.get('/:id', authMiddleware, account.get);
router.post('/', authMiddleware, check(CREATE), validate, account.create);
router.post('/:id', authMiddleware, check(), validate, account.update);

export default router;
