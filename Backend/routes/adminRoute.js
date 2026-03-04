import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import User from "../models/UserModel.js";
import DoctorModel from "../models/DoctorModel.js";
import AppointmentModel from "../models/appointmentModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer setup for doctor images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ADMIN LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ message: "Admin login successful", token });
  }

  res.status(401).json({ message: "Invalid admin credentials" });
});

// ADMIN DETAILS
router.get("/me", authMiddleware, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  res.json({ name: "Admin", email: process.env.ADMIN_EMAIL });
});

// DASHBOARD STATS
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const totalUsers = await User.countDocuments();
    const totalDoctors = await DoctorModel.countDocuments();
    const totalAppointments = await AppointmentModel.countDocuments();

    // Today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await AppointmentModel.countDocuments({
      date: today
    });

    // Recent 5 appointments
    const recentAppointments = await AppointmentModel.find()
      .populate("doctor", "name speciality image")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      recentAppointments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// APPOINTMENTS
router.get("/appointments", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const appointments = await AppointmentModel.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    // Manually populate doctor data
    const appointmentsWithDoctors = await Promise.all(
      appointments.map(async (apt) => {
        const aptObj = apt.toObject();
        
        if (typeof aptObj.doctor === 'string' && aptObj.doctor.match(/^[0-9a-fA-F]{24}$/)) {
          try {
            const doctor = await DoctorModel.findById(aptObj.doctor).select('name speciality image');
            if (doctor) {
              aptObj.doctor = doctor;
            }
          } catch (err) {
            console.log('Error fetching doctor for admin:', err);
          }
        }
        
        return aptObj;
      })
    );
    
    res.json({ appointments: appointmentsWithDoctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE APPOINTMENT STATUS
router.post("/appointment-status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { appointmentId, status } = req.body;
    const updateData = { status };

    if (status === "completed") {
      updateData.isCompleted = true;
      updateData.cancelled = false;
    } else if (status === "rejected") {
      updateData.cancelled = true;
    } else if (status === "confirmed") {
      updateData.cancelled = false;
    }

    const appointment = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate("doctor", "name speciality image")
      .populate("user", "name email");

    res.json({ message: `Appointment ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CANCEL APPOINTMENT
router.post("/cancel-appointment", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { appointmentId } = req.body;
    await AppointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      isCompleted: false
    });
    res.json({ message: "Appointment Cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DOCTORS
router.get("/doctors", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const doctors = await DoctorModel.find().select("-password");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TOGGLE DOCTOR AVAILABILITY
router.post("/change-availability", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { docId } = req.body;
    const doctor = await DoctorModel.findById(docId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.available = !doctor.available;
    await doctor.save();
    res.json({ message: "Availability Changed", available: doctor.available });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY DOCTOR
router.post("/verify-doctor", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { docId } = req.body;
    const doctor = await DoctorModel.findById(docId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isVerified = !doctor.isVerified;
    await doctor.save();
    res.json({ message: doctor.isVerified ? "Doctor verified" : "Doctor unverified", isVerified: doctor.isVerified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD DOCTOR
router.post("/add-doctor", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { name, email, speciality, degree, experience, fees, about, address, password, available, isVerified } = req.body;

    // Check if doctor exists
    const existingDoctor = await DoctorModel.findOne({ email });
    if (existingDoctor) return res.status(400).json({ message: "Doctor already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    // Handle address - parse if it's JSON string
    let formattedAddress;
    try {
      formattedAddress = typeof address === 'string' ? JSON.parse(address) : address;
    } catch {
      // If parsing fails, treat as line1
      formattedAddress = { line1: address, line2: "" };
    }

    const newDoctor = new DoctorModel({
      name,
      email,
      speciality,
      degree,
      experience,
      fees,
      about,
      address: formattedAddress,
      password: hashedPassword,
      image: imagePath,
      available: available === 'true' || available === true,
      isVerified: isVerified === 'true' || isVerified === true,
    });

    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor: newDoctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE DOCTOR
router.put("/doctors/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const updateData = { ...req.body };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE DOCTOR
router.delete("/doctors/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    await DoctorModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// USERS
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD USER
router.post("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE USER
router.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    const { name, email, password } = req.body;
    const updateData = { name, email };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE USER
router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

