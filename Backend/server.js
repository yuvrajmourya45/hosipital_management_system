import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Routes
import userRoutes from "./routes/auth.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";

// Middlewares
import authMiddleware from "./middleware/authMiddleware.js";
import authAdmin from "./middleware/authAdmin.js";

dotenv.config();

// __dirname fix for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ==================== Ensure uploads folder ====================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Static route
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==================== MONGODB CONNECT ====================
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ==================== MULTER SETUP ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ==================== OLD SYSTEM (In-memory) ====================
const users = [];
const appointments = [];

// ==================== OLD AUTH ROUTES ====================

// REGISTER OLD
app.post("/api/auth/register-old", (req, res) => {
  const { name, email, password } = req.body;

  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  const newUser = { _id: Date.now().toString(), name, email, password };
  users.push(newUser);

  res.json({ message: "Registration successful!", user: newUser });
});

// LOGIN OLD
app.post("/api/auth/login-old", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });

  res.json({ token, user, message: "Login successful!" });
});

// ==================== OLD APPOINTMENTS SYSTEM ====================

// Create appointment (OLD)
app.post("/api/appointments", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const { doctor, speciality, date, time, image } = req.body;

  if (!doctor || !date || !time)
    return res.status(400).json({ message: "Invalid data" });

  const newAppointment = {
    _id: Date.now().toString(),
    doctor,
    speciality,
    date,
    time,
    image,
  };

  appointments.push(newAppointment);

  res.json({
    message: "Appointment booked successfully!",
    appointment: newAppointment,
  });
});

// Get all appointments (OLD)
app.get("/api/appointments/:userId", (req, res) => {
  res.json(appointments);
});

// Cancel Appointment (OLD)
app.delete("/api/appointments/:id", (req, res) => {
  const index = appointments.findIndex((a) => a._id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  appointments.splice(index, 1);

  res.json({ message: "Appointment cancelled successfully" });
});

// ==================== NEW MONGODB AUTH ROUTES ====================
app.use("/api/auth", userRoutes);

// ==================== ADMIN ROUTES ====================
app.use("/api/admin", adminRouter);

// ==================== DOCTOR ROUTES ====================
app.use("/api/doctor", doctorRouter);

// ==================== SERVER START ====================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

