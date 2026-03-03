import validator from "validator";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";

// 🩺 API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address, available, isVerified } = req.body;
    const imageFile = req.file;

    // checking for all data to add doctor
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    // validating password
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      available: available === 'true' || available === true,
      isVerified: isVerified === 'true' || isVerified === true,
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// 👨‍💼 API For Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // compare with admin credentials from .env
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      // ❌ old code had a bug: (email+password.process.env.JWT_SECRET)
      // ✅ correct way:
      const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Doctor
const verifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    await doctorModel.findByIdAndUpdate(doctorId, { isVerified: true });
    res.json({ success: true, message: "Doctor verified successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get All Doctors (Admin)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select('-password');
    res.json({ success: true, doctors });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get All Appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({})
      .populate('user', 'name email')
      .populate('doctor', 'name speciality image')
      .sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Update Appointment Status (Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { status, isCompleted: status === 'completed' },
      { new: true }
    );
    res.json({ success: true, message: `Appointment ${status}`, appointment });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Cancel Appointment (Admin)
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
    res.json({ success: true, message: 'Appointment cancelled' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { addDoctor, loginAdmin, verifyDoctor, getAllDoctors, getAllAppointments, updateAppointmentStatus, cancelAppointment };
