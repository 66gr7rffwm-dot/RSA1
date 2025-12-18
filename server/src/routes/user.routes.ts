import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getProfile, updateProfile } from '../controllers/user.controller';

const router = express.Router();

router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/:id', getProfile);

export default router;

