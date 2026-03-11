import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { bookAppointment, getUserAppointments, cancelAppointment } from "../controllers/userController.js";

const router = express.Router();

router.post("/book-appointment", authMiddleware, bookAppointment);
router.get("/appointments", authMiddleware, getUserAppointments);
router.post("/cancel-appointment", authMiddleware, cancelAppointment);

export default router;
