import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createSOS, getMySOSIncidents } from '../controllers/sos.controller';

const router = express.Router();

router.use(authenticate);

router.post('/', createSOS);
router.get('/my', getMySOSIncidents);

export default router;


