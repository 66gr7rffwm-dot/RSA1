import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { pool } from '../database/connection';
import { AppError } from '../middleware/errorHandler';

type UploadedFiles = {
  [field: string]: Express.Multer.File[];
};

const requiredFields = [
  'cnicFront',
  'cnicBack',
  'drivingLicense',
  'vehicleRegistration',
  'tokenTax',
  'selfie',
];

const toPublicUrl = (filePath: string): string => {
  // Ensure leading slash so it matches /uploads static route
  return filePath.startsWith('/') ? filePath : `/${filePath}`;
};

const extractFilePath = (files: UploadedFiles | undefined, field: string): string | null => {
  if (!files || !files[field] || files[field].length === 0) return null;
  // Multer's path is already relative to project; keep as-is
  const fp = files[field][0].path.replace(/\\/g, '/');
  return toPublicUrl(fp);
};

export const submitKYC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { cnicNumber, drivingLicenseNumber } = req.body;
    const files = req.files as UploadedFiles | undefined;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!cnicNumber || !drivingLicenseNumber) {
      res.status(400).json({ success: false, error: 'cnicNumber and drivingLicenseNumber are required' });
      return;
    }

    for (const field of requiredFields) {
      if (!files || !files[field] || files[field].length === 0) {
        res.status(400).json({ success: false, error: `Missing file: ${field}` });
        return;
      }
    }

    const cnicFrontUrl = extractFilePath(files, 'cnicFront');
    const cnicBackUrl = extractFilePath(files, 'cnicBack');
    const drivingLicenseUrl = extractFilePath(files, 'drivingLicense');
    const vehicleRegistrationUrl = extractFilePath(files, 'vehicleRegistration');
    const tokenTaxUrl = extractFilePath(files, 'tokenTax');
    const selfieUrl = extractFilePath(files, 'selfie');

    if (!cnicFrontUrl || !cnicBackUrl || !drivingLicenseUrl || !vehicleRegistrationUrl || !tokenTaxUrl || !selfieUrl) {
      res.status(400).json({ success: false, error: 'All document files are required' });
      return;
    }

    // Upsert KYC: if exists, update; else insert
    const existing = await pool.query(
      'SELECT id FROM driver_kyc WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE driver_kyc
         SET cnic_number = $1,
             cnic_front_url = $2,
             cnic_back_url = $3,
             driving_license_number = $4,
             driving_license_url = $5,
             vehicle_registration_url = $6,
             token_tax_url = $7,
             selfie_url = $8,
             verification_status = 'pending',
             rejection_reason = NULL,
             verified_by = NULL,
             verified_at = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [
          cnicNumber,
          cnicFrontUrl,
          cnicBackUrl,
          drivingLicenseNumber,
          drivingLicenseUrl,
          vehicleRegistrationUrl,
          tokenTaxUrl,
          selfieUrl,
          existing.rows[0].id,
        ]
      );
    } else {
      result = await pool.query(
        `INSERT INTO driver_kyc (
            user_id,
            cnic_number,
            cnic_front_url,
            cnic_back_url,
            driving_license_number,
            driving_license_url,
            vehicle_registration_url,
            token_tax_url,
            selfie_url,
            verification_status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
        RETURNING *`,
        [
          userId,
          cnicNumber,
          cnicFrontUrl,
          cnicBackUrl,
          drivingLicenseNumber,
          drivingLicenseUrl,
          vehicleRegistrationUrl,
          tokenTaxUrl,
          selfieUrl,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(new AppError('Failed to submit KYC', 500));
  }
};

export const getKYCStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      'SELECT * FROM driver_kyc WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.json({ success: true, data: { status: 'not_submitted' } });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(new AppError('Failed to get KYC status', 500));
  }
};

export const updateKYC = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Reuse submit logic since it upserts; this keeps one code path.
    await submitKYC(req, res, next);
  } catch (error) {
    next(new AppError('Failed to update KYC', 500));
  }
};

