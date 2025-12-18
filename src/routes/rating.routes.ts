import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createRating,
  getMyReceivedRatings,
  getMyGivenRatings,
} from '../controllers/rating.controller';

const router = express.Router();

router.use(authenticate);

router.post('/', createRating);
router.get('/received', getMyReceivedRatings);
router.get('/given', getMyGivenRatings);

export default router;


