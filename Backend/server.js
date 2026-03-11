import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRoute from "./routes/userRoute.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";

// Models
import doctorModel from "./models/DoctorModel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS Configuration - Allow all origins temporarily
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma']
}));

app.use(express.json());

// Uploads Folder Setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const medicalRecordsDir = path.join(__dirname, "uploads/medical-records");
if (!fs.existsSync(medicalRecordsDir)) fs.mkdirSync(medicalRecordsDir, { recursive: true });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/docter";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected ->", mongoUri))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/medical-records", medicalRecordRoutes);

// User profile endpoint for doctor to view patient info
app.get("/api/user/profile/:userId", async (req, res) => {
  try {
    const User = (await import("./models/UserModel.js")).default;
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Doctors Endpoint
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    const doctorsWithImageUrl = doctors.map(doc => {
      const obj = doc.toObject();
      if (obj.image) {
        if (obj.image.startsWith('http')) {
        } else if (obj.image.startsWith('/')) {
          obj.image = `${process.env.NODE_ENV === 'production' ? 'https://hosipital-management-system-backend.onrender.com' : 'http://localhost:8000'}${obj.image}`;
        } else {
          obj.image = `${process.env.NODE_ENV === 'production' ? 'https://hosipital-management-system-backend.onrender.com' : 'http://localhost:8000'}/uploads/${obj.image}`;
        }
      }
      return { ...obj, available: obj.available !== undefined ? obj.available : true };
    });
    res.json(doctorsWithImageUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug Endpoint
app.get("/api/debug/appointments", async (req, res) => {
  try {
    const Appointment = (await import("./models/appointmentModel.js")).default;
    const allAppointments = await Appointment.find();
    res.json({ count: allAppointments.length, appointments: allAppointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Doctors Endpoint (Temporary)
app.post("/api/seed-doctors", async (req, res) => {
  try {
    const bcryptjs = (await import("bcryptjs")).default;
    
    const sampleDoctors = [
      {
        name: "Dr. Richard James",
        email: "richard@hospital.com",
        password: "doctor123",
        image: "doc1.png",
        speciality: "General physician",
        degree: "MBBS",
        experience: "4 Years",
        about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
        fees: 50,
        address: { line1: "17th Cross, Richmond", line2: "Circle, Ring Road, London" },
        available: true
      },
      {
        name: "Dr. Emily Larson",
        email: "emily@hospital.com", 
        password: "doctor123",
        image: "doc2.png",
        speciality: "Gynecologist",
        degree: "MBBS",
        experience: "3 Years",
        about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
        fees: 60,
        address: { line1: "27th Cross, Richmond", line2: "Circle, Ring Road, London" },
        available: true
      },
      {
        name: "Dr. Sarah Patel",
        email: "sarah@hospital.com",
        password: "doctor123", 
        image: "doc3.png",
        speciality: "Dermatologist",
        degree: "MBBS",
        experience: "1 Years",
        about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
        fees: 30,
        address: { line1: "37th Cross, Richmond", line2: "Circle, Ring Road, London" },
        available: true
      },
      {
        name: "Dr. Christopher Lee",
        email: "christopher@hospital.com",
        password: "doctor123",
        image: "doc4.png", 
        speciality: "Pediatricians",
        degree: "MBBS",
        experience: "2 Years",
        about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
        fees: 40,
        address: { line1: "47th Cross, Richmond", line2: "Circle, Ring Road, London" },
        available: true
      },
      {
        name: "Dr. Jennifer Garcia",
        email: "jennifer@hospital.com",
        password: "doctor123",
        image: "doc5.png",
        speciality: "Neurologist", 
        degree: "MBBS",
        experience: "4 Years",
        about: "Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.",
        fees: 50,
        address: { line1: "57th Cross, Richmond", line2: "Circle, Ring Road, London" },
        available: true
      }
    ];

    // Clear existing doctors
    await doctorModel.deleteMany({});
    
    // Create new doctors
    for (const doctor of sampleDoctors) {
      const hashedPassword = await bcryptjs.hash(doctor.password, 10);
      const newDoctor = new doctorModel({
        ...doctor,
        password: hashedPassword
      });
      await newDoctor.save();
    }

    res.json({ message: "Doctors seeded successfully!", count: sampleDoctors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed Admin Endpoint (Temporary)
app.post("/api/seed-admin", async (req, res) => {
  try {
    const bcryptjs = (await import("bcryptjs")).default;
    const User = (await import("./models/UserModel.js")).default;
    
    const adminUser = {
      name: "Admin",
      email: "admin@yuvrajdocter.com",
      password: "YuvrajAdmin@2024",
      role: "admin"
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      return res.json({ message: "Admin user already exists", email: adminUser.email });
    }

    // Hash password and create admin
    const hashedPassword = await bcryptjs.hash(adminUser.password, 10);
    const newAdmin = new User({
      ...adminUser,
      password: hashedPassword
    });
    
    await newAdmin.save();
    res.json({ 
      message: "Admin user created successfully!", 
      email: adminUser.email,
      password: adminUser.password
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server Start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
