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

// Models
import DoctorModel from "./models/DoctorModel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", 
    "https://hosipitalmanagementsystemfrontend.vercel.app",
    "https://hosipital-backend.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// ==================== Ensure uploads folder ====================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== MONGODB CONNECT ====================
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/docter";
mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected ->", mongoUri))
  .catch((err) => console.log("❌ MongoDB Error:", err));


// ==================== NEW API ROUTES ====================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/notifications", notificationRoutes);

// ==================== PUBLIC DOCTORS ====================
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await DoctorModel.find().select("-password");
    const doctorsWithImageUrl = doctors.map(doc => {
      const obj = doc.toObject();
      // normalize image URL:
      if (obj.image) {
        if (obj.image.startsWith('http')) {
          // already absolute
        } else if (obj.image.startsWith('/')) {
          // could be "/uploads/xxx" or similar
          obj.image = `${process.env.VERCEL_URL || 'http://localhost:8000'}${obj.image}`;
        } else {
          obj.image = `${process.env.VERCEL_URL || 'http://localhost:8000'}/uploads/${obj.image}`;
        }
      }
      return {
        ...obj,
        available: obj.available !== undefined ? obj.available : true // Default to available if not set
      };
    });
    res.json(doctorsWithImageUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
