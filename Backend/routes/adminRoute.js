import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import DoctorModel from "../models/DoctorModel.js";
import AppointmentModel from "../models/AppointmentModel.js";

const router = express.Router();

// Admin Auth
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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
      {
        expiresIn: "7d",
      }
    );
    return res.json({ message: "Admin login successful", token });
  }

  res.status(401).json({ message: "Invalid admin credentials" });
});

// ADMIN DETAILS
router.get("/me", adminAuth, (req, res) => {
  res.json({ name: "Admin" });
});

// DASHBOARD STATS (FINAL)
router.get("/stats", adminAuth, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalDoctors = await DoctorModel.countDocuments();
  const totalAppointments = await AppointmentModel.countDocuments();

  res.json({
    totalUsers,
    totalDoctors,
    totalAppointments,
  });
});

// APPOINTMENTS (FINAL)
router.get("/appointments", adminAuth, async (req, res) => {
  const appointments = await AppointmentModel.find()
    .populate("doctor", "name speciality")
    .populate("user", "name email");

  res.json({ appointments });
});

export default router;
