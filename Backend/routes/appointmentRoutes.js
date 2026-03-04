import express from "express";
import Appointment from "../models/AppointmentModel.js";
import DoctorModel from "../models/DoctorModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { notifyDoctorOfCancellation, notifyUserOfCancellation, notifyDoctorOfNewAppointment, notifyDoctorOfConfirmation } from "../utils/notificationService.js";

const router = express.Router();

// ✅ Create new appointment (Only User)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "user")
      return res.status(403).json({ message: "Only users can book appointments" });

    const { doctor: docId, date, time, speciality } = req.body;
    console.log('📝 Received appointment booking request:');
    console.log('Doctor ID:', docId);
    console.log('Date:', date);
    console.log('Time:', time);
    console.log('User ID:', req.user.id);

    // For demo mode with string IDs like 'doc1'
    if (typeof docId === 'string' && docId.startsWith('doc')) {
      // Check if this is a real doctor with availability status
      const realDoctor = await Doctor.findOne({ _id: docId }).select('available');
      if (realDoctor && !realDoctor.available) {
        return res.status(400).json({ message: "Doctor is currently unavailable for appointments" });
      }
      
      const existingAppointment = await Appointment.findOne({
        doctor: docId,
        date,
        time,
        cancelled: false
      });
      if (existingAppointment) {
        return res.status(400).json({ message: "This slot is already booked" });
      }

      const newAppointment = new Appointment({
        user: req.user.id,
        doctor: docId,
        date,
        time,
        amount: 50,
        speciality: speciality || 'General',
        date_booked: Date.now()
      });
      await newAppointment.save();
      console.log('✅ Demo appointment saved:', newAppointment);
      return res.status(201).json({ message: "Appointment booked successfully!", appointment: newAppointment });
    }

    const doctorData = await Doctor.findById(docId).select("-password");
    if (!doctorData) {
      console.log('❌ Doctor not found with ID:', docId);
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    // Check if doctor is available
    if (!doctorData.available) {
      console.log('❌ Doctor is not available:', doctorData.name, 'Available status:', doctorData.available);
      return res.status(400).json({ message: "Doctor is currently unavailable for appointments" });
    }
    
    console.log('✅ Doctor found and available:', doctorData.name);

    const existingAppointment = await Appointment.findOne({
      doctor: docId,
      date,
      time,
      cancelled: false
    });
    if (existingAppointment) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const newAppointment = new Appointment({
      user: req.user.id,
      doctor: docId,
      date,
      time,
      amount: doctorData.fees || 0,
      docData: doctorData,
      date_booked: Date.now()
    });

    await newAppointment.save();
    console.log('✅ Appointment saved successfully!');
    console.log('Appointment ID:', newAppointment._id);
    console.log('Doctor ID in appointment:', newAppointment.doctor);
    
    // Send notification to doctor
    await notifyDoctorOfNewAppointment(docId, {
      ...newAppointment.toObject(),
      user: { name: req.user.name || 'Patient' }
    });
    
    res.status(201).json({ message: "Appointment booked successfully!", appointment: newAppointment });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ✅ Get all appointments for a user
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    // Manually populate doctor data
    const processedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        const aptObj = apt.toObject();
        
        if (typeof aptObj.doctor === 'string' && aptObj.doctor.match(/^[0-9a-fA-F]{24}$/)) {
          // It's an ObjectId, fetch doctor data
          try {
            const doctor = await Doctor.findById(aptObj.doctor).select('name speciality image fees degree');
            console.log('🔍 Found doctor:', doctor);
            if (doctor) {
              aptObj.doctor = doctor.toObject();
            }
          } catch (err) {
            console.log('❌ Error fetching doctor:', err);
          }
        }
        
        return aptObj;
      })
    );

    res.json(processedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Cancel appointment
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    // Check if appointment was already confirmed by doctor
    const wasConfirmed = appointment.status === 'confirmed';
    
    // Update appointment status
    appointment.cancelled = true;
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = 'user';
    
    await appointment.save();
    
    // Send notifications
    if (wasConfirmed) {
      await notifyDoctorOfCancellation(appointment.doctor, appointment);
    }
    await notifyUserOfCancellation(appointment);
    
    console.log(`✅ Appointment cancelled by user:`, appointment._id);
    
    // Different response based on previous status
    if (wasConfirmed) {
      res.json({ 
        message: "Confirmed appointment cancelled successfully!", 
        note: "Doctor will be notified about the cancellation.",
        refundEligible: true
      });
    } else {
      res.json({ 
        message: "Appointment cancelled successfully!",
        refundEligible: false
      });
    }
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update appointment status (Doctor only)
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('user', 'name');
    
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Update appointment status
    appointment.status = status;
    if (status === 'rejected') {
      appointment.cancelled = true;
      appointment.cancelledAt = new Date();
      appointment.cancelledBy = 'doctor';
    }
    if (status === 'confirmed') {
      appointment.cancelled = false;
    }
    
    await appointment.save();
    
    // Send notification for confirmation
    if (status === 'confirmed') {
      await notifyDoctorOfConfirmation(appointment.doctor, appointment);
    }
    
    console.log(`✅ Appointment ${status}:`, appointment._id);
    res.json({ message: `Appointment ${status} successfully`, appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete appointment (Only User)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await Appointment.findByIdAndDelete(req.params.id);
    console.log(`✅ Appointment deleted:`, req.params.id);
    res.json({ message: "Appointment cancelled successfully!" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error while cancelling appointment" });
  }
});

// ✅ Get all appointments for a doctor
router.get("/doctor/:docId", async (req, res) => {
  try {
    const docId = req.params.docId;
    console.log('🔍 Fetching appointments for doctor ID:', docId);
    
    // Try both string and ObjectId matching
    const appointments = await Appointment.find({
      $or: [
        { doctor: docId },
        { doctor: docId.toString() }
      ]
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    console.log('📊 Found appointments:', appointments.length);

    res.json(appointments);
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({ message: error.message });
  }
});

// 🔧 DEBUG: Get ALL appointments (for debugging)
router.get("/debug/all", async (req, res) => {
  try {
    const allAppointments = await Appointment.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    console.log('🔍 Total appointments in DB:', allAppointments.length);
    
    const formatted = allAppointments.map(apt => ({
      _id: apt._id,
      doctorId: apt.doctor,
      doctorIdType: typeof apt.doctor,
      userId: apt.user?._id,
      userName: apt.user?.name,
      date: apt.date,
      time: apt.time
    }));
    
    res.json({ total: allAppointments.length, appointments: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get available time slots for a doctor on a specific date
router.get("/available/:docId/:date", async (req, res) => {
  try {
    const { docId, date } = req.params;
    
    // Get all booked appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: docId,
      date: date,
      cancelled: false
    }).select('time');

    const bookedTimes = bookedAppointments.map(apt => apt.time);
    
    // Define all possible time slots (you can customize this)
    const allTimeSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
    ];

    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ 
      date,
      availableSlots,
      bookedSlots: bookedTimes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
