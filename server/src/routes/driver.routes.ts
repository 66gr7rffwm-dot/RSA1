import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { submitKYC, getKYCStatus, updateKYC } from '../controllers/driver.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'kyc');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) // default 5MB
  }
});

router.use(authenticate);
router.use(authorize('driver'));

router.post('/kyc', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'vehicleRegistration', maxCount: 1 },
  { name: 'tokenTax', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), submitKYC);

router.get('/kyc/status', getKYCStatus);
router.put('/kyc', upload.fields([
  { name: 'cnicFront', maxCount: 1 },
  { name: 'cnicBack', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'vehicleRegistration', maxCount: 1 },
  { name: 'tokenTax', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), updateKYC);

export default router;

