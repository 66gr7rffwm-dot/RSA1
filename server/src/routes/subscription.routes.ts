import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createSubscription, 
  getMySubscription, 
  updateSubscription,
  cancelSubscription 
} from '../controllers/subscription.controller';

const router = express.Router();

router.use(authenticate);

router.get('/my-subscription', getMySubscription);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.put('/:id/cancel', cancelSubscription);

export default router;

