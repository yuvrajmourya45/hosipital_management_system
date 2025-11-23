import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: String,
  speciality: String,
  degree: String,
  experience: String,
  about: String,
  fees: Number,
});

// ---- FIX HERE ----
export default mongoose.models.Doctor || mongoose.model("Doctor", DoctorSchema);
