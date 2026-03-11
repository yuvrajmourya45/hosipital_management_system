import express from "express";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  loginAdmin, getAdminDetails, getDashboardStats, getAllAppointments,
  updateAppointmentStatus, cancelAppointment, getAllDoctors, toggleDoctorAvailability,
  verifyDoctor, addDoctor, updateDoctor, deleteDoctor, getAllUsers, addUser, updateUser, deleteUser,
  getPatientMedicalRecords, getPatientAppointments, deletePatientRecord
} from "../controllers/adminController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/login", loginAdmin);
router.get("/me", authMiddleware, getAdminDetails);
router.get("/stats", authMiddleware, getDashboardStats);
router.get("/appointments", authMiddleware, getAllAppointments);
router.post("/appointment-status", authMiddleware, updateAppointmentStatus);
router.post("/cancel-appointment", authMiddleware, cancelAppointment);
router.get("/doctors", authMiddleware, getAllDoctors);
router.post("/change-availability", authMiddleware, toggleDoctorAvailability);
router.post("/verify-doctor", authMiddleware, verifyDoctor);
router.post("/add-doctor", authMiddleware, upload.single("image"), addDoctor);
router.put("/doctors/:id", authMiddleware, upload.single("image"), updateDoctor);
router.delete("/doctors/:id", authMiddleware, deleteDoctor);
router.get("/users", authMiddleware, getAllUsers);
router.post("/users", authMiddleware, addUser);
router.put("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);

// Medical Records Routes
router.get("/patients/:userId/medical-records", authMiddleware, getPatientMedicalRecords);
router.get("/patients/:userId/appointments", authMiddleware, getPatientAppointments);
router.delete("/patients/:userId/records/:recordId", authMiddleware, deletePatientRecord);

export default router;
