import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { 
  processPayment, 
  getPaymentStatus,
  processRefund 
} from '../controllers/payment.controller';

const router = express.Router();

router.use(authenticate);

router.post('/process', processPayment);
router.get('/:transactionId', getPaymentStatus);
router.post('/refund', processRefund);

export default router;

