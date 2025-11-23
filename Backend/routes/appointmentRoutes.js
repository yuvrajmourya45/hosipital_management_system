import express from "express";
import Appointment from "../models/appointmentModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create new appointment (Only User)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can book appointments" });

    const appointment = new Appointment({
      ...req.body,
      userId: req.user.id,
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get all appointments for a user
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can view appointments" });

    const appointments = await Appointment.find({ userId: req.params.userId });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Cancel (Delete) appointment (Only User)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can cancel appointments" });

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment cancelled successfully!" });
  } catch (error) {
    console.error("Error cancelling:", error);
    res.status(500).json({ message: "Server error while cancelling appointment" });
  }
});

export default router;
