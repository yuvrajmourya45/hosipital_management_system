import DoctorModel from "../models/DoctorModel.js";
import AppointmentModel from "../models/appointmentModel.js";
import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import authDoctor from "../middleware/authDoctor.js";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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

router.get("/profile/:id", async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const docObj = doctor.toObject();
    // ensure the image URL is absolute so clients don't have to guess
    if (docObj.image) {
      if (!docObj.image.startsWith("http")) {
        docObj.image = `http://localhost:8000${docObj.image.startsWith("/") ? "" : "/"}${docObj.image}`;
      }
    }

    res.json(docObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/availability/:id", async (req, res) => {
  try {
    const { available } = req.body;
    const doctor = await DoctorModel.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );
    res.json({ message: "Availability updated", available: doctor.available });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile/:id", upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.address) {
      updateData.address = JSON.parse(req.body.address);
    }
    if (req.file) {
      updateData.image = req.file.filename;
    }
    
    const doctor = await DoctorModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/appointments/:doctorId", authDoctor, async (req, res) => {
  try {
    const appointments = await AppointmentModel.find({ 
      doctor: req.params.doctorId,
      cancelled: false
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
    
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
