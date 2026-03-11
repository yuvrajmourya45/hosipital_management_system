import express from "express";
import multer from "multer";
import path from "path";
import authDoctor from "../middleware/authDoctor.js";
import { loginDoctor, getDoctorProfile, updateDoctorAvailability, updateDoctorProfile, getDoctorAppointments, completeAppointment, updateAppointmentStatus, getPatientHistory } from "../controllers/doctorController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post("/login", loginDoctor);
router.get("/profile/:id", getDoctorProfile);
router.put("/availability/:id", updateDoctorAvailability);
router.put("/profile/:id", upload.single('image'), updateDoctorProfile);
router.get("/appointments/:doctorId", authDoctor, getDoctorAppointments);
router.patch("/complete/:id", authDoctor, completeAppointment);
router.patch("/:id/status", authDoctor, updateAppointmentStatus);
router.get("/history/:doctorId", getPatientHistory);

export default router;
