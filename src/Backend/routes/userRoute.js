import express from "express";
import AppointmentModel from "../models/appointmentModel.js";
import DoctorModel from "../models/DoctorModel.js";
import User from "../models/UserModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Book Appointment
router.post("/book-appointment", authMiddleware, async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const userId = req.user.id;

        const doctorData = await DoctorModel.findById(doctorId).select("-password");
        if (!doctorData) return res.status(404).json({ message: "Doctor not found" });
        if (!doctorData.isVerified) return res.status(403).json({ message: "Doctor not verified yet" });

        // Check for double booking
        const existingAppointment = await AppointmentModel.findOne({
            doctor: doctorId,
            date,
            time,
            cancelled: false
        });
        if (existingAppointment) {
            return res.status(400).json({ message: "This slot is already booked" });
        }

        const appointmentData = {
            user: userId,
            doctor: doctorId,
            date,
            time,
            amount: doctorData.fees,
            speciality: doctorData.speciality,
            date_booked: Date.now(),
        };

        const newAppointment = new AppointmentModel(appointmentData);
        await newAppointment.save();

        res.json({ success: true, message: "Appointment Booked" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// List User Appointments
router.get("/appointments", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const appointments = await AppointmentModel.find({ user: userId }).populate("doctor", "-password");
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

// Cancel Appointment
router.post("/cancel-appointment", authMiddleware, async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;

        const appointmentData = await AppointmentModel.findById(appointmentId);
        if (!appointmentData) return res.status(404).json({ message: "Appointment not found" });

        if (appointmentData.user.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized action" });
        }

        await AppointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        res.json({ success: true, message: "Appointment Cancelled" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
});

export default router;
