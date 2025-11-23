// doctorRoute.js me add kare
import DoctorModel from "../models/DoctorModel.js";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();

// Doctor login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await DoctorModel.findOne({ email });
    if (!doctor) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Doctor login successful", token, doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
