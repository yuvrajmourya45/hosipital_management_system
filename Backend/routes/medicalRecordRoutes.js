import express from 'express';
import multer from 'multer';
import MedicalRecord from '../models/medicalRecordModel.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer configuration
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
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    if (extname || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents allowed'));
    }
  }
});

// Upload medical record
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { title, description, documentType } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const record = await MedicalRecord.create({
      user: userId,
      title,
      description,
      documentType,
      file: req.file.filename
    });

    res.status(201).json({ message: 'Medical record uploaded successfully', record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload medical record' });
  }
});

// Get user's medical records
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const records = await MedicalRecord.find({ user: userId, isDeleted: false }).sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
});

// Get my medical records
router.get('/my-records', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await MedicalRecord.find({ user: userId, isDeleted: false }).sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
});

// Delete medical record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const record = await MedicalRecord.findOne({ _id: id, user: userId });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    record.isDeleted = true;
    await record.save();

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete medical record' });
  }
});

export default router;
