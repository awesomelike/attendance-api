import { Router } from 'express';
import test from '../data/dummyclasses';

const router = Router();

router.get('/', test);

export default router;
