import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { 
  createBooking, 
  getBookings, 
  getBooking, 
  cancelBooking,
  getMyBookings 
} from '../controllers/booking.controller';
import { validateSubscription } from '../middleware/validateSubscription';

const router = express.Router();

router.use(authenticate);

router.get('/my-bookings', getMyBookings);
router.post('/', authorize('passenger'), validateSubscription, createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

export default router;

