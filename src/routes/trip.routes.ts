import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { 
  createTrip, 
  getTrips, 
  getTrip, 
  updateTrip, 
  cancelTrip,
  getMyTrips,
  searchTrips 
} from '../controllers/trip.controller';
import { validateSubscription } from '../middleware/validateSubscription';

const router = express.Router();

router.get('/search', searchTrips);
router.get('/my-trips', authenticate, getMyTrips);

router.use(authenticate);
router.use(authorize('driver'));
router.use(validateSubscription);

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', cancelTrip);

export default router;

