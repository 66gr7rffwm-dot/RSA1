import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'vehicles');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },
});

router.use(authenticate);
router.use(authorize('driver'));

router.get('/', getVehicles);
router.post('/', upload.array('images', 5), addVehicle);
router.put('/:id', upload.array('images', 5), updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;

