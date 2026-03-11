import express from 'express';
import { uploadRecord, getUserRecords, deleteRecord } from '../controllers/medicalRecordController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer configuration for medical records
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/medical-records/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

router.post('/upload', authMiddleware, upload.single('file'), uploadRecord);
router.get('/user/:userId', authMiddleware, getUserRecords);
router.get('/my-records', authMiddleware, getUserRecords);
router.delete('/:id', authMiddleware, deleteRecord);

export default router;
