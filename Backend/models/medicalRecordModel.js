import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  documentType: {
    type: String,
    enum: ['lab_report', 'xray', 'prescription', 'scan', 'ecg', 'vaccination', 'discharge_summary', 'medical_history', 'allergy_report', 'other'],
    required: true
  },
  file: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
