import { Router } from 'express';
import auth from '../controllers/auth';
import passwordMiddleware, { confirmResetToken } from '../middlewares/password';
import profile from '../controllers/profile';
import { checkEmail, validateEmail } from '../util/validation/profile';

const router = Router();

router.post('/login', auth.login);
router.post('/resetPassword', checkEmail, validateEmail, profile.sendPasswordResetEmail);
router.get('/resetPassword/:token', confirmResetToken);
router.post('/resetPassword/:token', passwordMiddleware, profile.updatePassword);
export default router;
