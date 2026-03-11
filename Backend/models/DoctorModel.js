import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  speciality: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  about: { type: String, required: true },
  available: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  fees: { type: Number, required: true },
  address: {
    line1: String,
    line2: String
  },
  workingHours: {
    start: { type: String, default: "09:00 AM" },
    end: { type: String, default: "05:00 PM" },
    breaks: [{
      type: {
        type: String,
        enum: ['tea', 'lunch', 'other'],
        required: true
      },
      start: {
        type: String,
        required: true
      },
      end: {
        type: String,
        required: true
      },
      label: String
    }]
  },
  role: { type: String, default: "doctor" },
  date: { type: Number, default: Date.now }
});

export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);

