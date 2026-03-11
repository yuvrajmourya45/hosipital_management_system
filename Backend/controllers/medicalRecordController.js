import MedicalRecord from '../models/medicalRecordModel.js';

// Upload medical record
export const uploadRecord = async (req, res) => {
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
};

// Get user's medical records
export const getUserRecords = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const records = await MedicalRecord.find({ user: userId, isDeleted: false }).sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch medical records' });
  }
};

// Delete medical record (soft delete)
export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const record = await MedicalRecord.findOne({ _id: id, user: userId });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Soft delete - mark as deleted instead of removing from database
    record.isDeleted = true;
    await record.save();
    
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete medical record' });
  }
};
