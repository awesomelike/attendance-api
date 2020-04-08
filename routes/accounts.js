import { Router } from 'express';
import account from '../controllers/account';
import authMiddleware from '../middlewares/auth';
import { check, validate } from '../util/validation/account';

const router = Router();

router.get('/', authMiddleware, account.getAll);
router.get('/:id', authMiddleware, account.get);
router.post('/', authMiddleware, check, validate, account.create);
router.post('/:id', authMiddleware, check, validate, account.update);

export default router;
