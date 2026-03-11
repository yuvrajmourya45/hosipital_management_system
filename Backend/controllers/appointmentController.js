import Appointment from "../models/appointmentModel.js";
import DoctorModel from "../models/DoctorModel.js";

// ==================== GET AVAILABLE SLOTS =========================
export const getAvailableSlots = async (req, res) => {
  try {
    const { docId, date } = req.params;
    
    // Check if selected date is in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.json({ date, availableSlots: [], bookedSlots: [], message: 'Cannot book appointments for past dates' });
    }
    
    // Only consider confirmed and pending appointments as booked (exclude rejected and cancelled)
    const booked = await Appointment.find({ 
      doctor: docId, 
      date, 
      cancelled: false,
      status: { $nin: ['rejected'] } // Exclude rejected appointments
    }).select('time');
    
    const bookedTimes = booked.map(apt => apt.time);
    const allSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];
    
    // If selected date is today, filter out past time slots
    let availableSlots = allSlots.filter(s => !bookedTimes.includes(s));
    
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      
      availableSlots = availableSlots.filter(slot => {
        const [time, period] = slot.split(' ');
        let [hour, minute] = time.split(':').map(Number);
        
        // Convert to 24-hour format
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        
        // Check if slot time is in the future
        if (hour > currentHour) return true;
        if (hour === currentHour && minute > currentMinute) return true;
        return false;
      });
    }
    
    res.json({ date, availableSlots, bookedSlots: bookedTimes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================== GET ALL DOCTOR APPOINTMENTS ==========================
export const getAllDoctorAppointments = async (req, res) => {
  try {
    const apts = await Appointment.find({ doctor: req.params.docId }).populate("user", "name email phone").sort({ createdAt: -1 });
    res.json(apts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
