import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { bookAppointment, getUserAppointments, cancelAppointment, deleteAppointment, updateAppointmentStatus } from "../controllers/userController.js";
import { getAvailableSlots, getAllDoctorAppointments } from "../controllers/appointmentController.js";

const router = express.Router();

// Specific routes first (before :id routes)
router.get("/doctor/:docId", getAllDoctorAppointments);
router.get("/available/:docId/:date", getAvailableSlots);
router.patch("/:id/cancel", authMiddleware, cancelAppointment);
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);

// Generic routes last
router.post("/", authMiddleware, bookAppointment);
router.get("/", authMiddleware, getUserAppointments);
router.get("/:userId", authMiddleware, getUserAppointments);
router.delete("/:id", authMiddleware, deleteAppointment);

export default router;
