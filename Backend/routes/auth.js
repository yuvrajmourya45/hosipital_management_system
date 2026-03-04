import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/UserModel.js";
import DoctorModel from "../models/doctorModel.js";

const router = express.Router();

// 🔹 Multer setup for profile pics
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ====================== REGISTER ======================

// 1️⃣ User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2️⃣ Doctor Registration (Admin only, handled via Admin Routes usually)
// You can create a separate admin route for adding doctors

// ====================== LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 Admin login (shortcut)
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { id: "adminid", role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        message: "Admin login successful",
        token,
        user: { name: "Admin", email, role: "admin" },
      });
    }

    // 🔹 Check if doctor
    const doctor = await DoctorModel.findOne({ email });
    if (doctor) {
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: doctor._id, role: "doctor" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ message: "Login successful", token, user: doctor });
    }

    // 🔹 Check if user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ====================== UPDATE PROFILE ======================
router.put(
  "/profile/:id",
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const { name, phone, gender } = req.body;
      const updateData = { name, phone, gender };
      if (req.file) updateData.profilePic = `/uploads/${req.file.filename}`;

      // Update user first
      let updatedUser = await User.findById(req.params.id);
      if (updatedUser) {
        updatedUser = await User.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
        );
        return res.json({ message: "Profile updated successfully", user: updatedUser });
      }

      // If not user, try doctor
      let updatedDoctor = await DoctorModel.findById(req.params.id);
      if (updatedDoctor) {
        updatedDoctor = await DoctorModel.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
        );
        return res.json({ message: "Profile updated successfully", user: updatedDoctor });
      }

      res.status(404).json({ message: "User/Doctor not found" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
