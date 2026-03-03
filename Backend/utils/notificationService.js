// Enhanced Notification Service
class NotificationService {
  constructor() {
    this.notifications = new Map(); // Store notifications by doctorId
  }

  // Add notification for doctor
  addNotification(doctorId, notification) {
    if (!this.notifications.has(doctorId)) {
      this.notifications.set(doctorId, []);
    }
    const doctorNotifications = this.notifications.get(doctorId);
    doctorNotifications.unshift({
      id: Date.now() + Math.random(),
      ...notification,
      timestamp: new Date(),
      read: false
    });
    // Keep only last 50 notifications
    if (doctorNotifications.length > 50) {
      doctorNotifications.splice(50);
    }
  }

  // Get notifications for doctor
  getNotifications(doctorId) {
    return this.notifications.get(doctorId) || [];
  }

  // Mark notification as read
  markAsRead(doctorId, notificationId) {
    const doctorNotifications = this.notifications.get(doctorId);
    if (doctorNotifications) {
      const notification = doctorNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  // Mark all notifications as read
  markAllAsRead(doctorId) {
    const doctorNotifications = this.notifications.get(doctorId);
    if (doctorNotifications) {
      doctorNotifications.forEach(n => n.read = true);
    }
  }

  // Get unread count
  getUnreadCount(doctorId) {
    const doctorNotifications = this.notifications.get(doctorId) || [];
    return doctorNotifications.filter(n => !n.read).length;
  }
}

const notificationService = new NotificationService();

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_APPOINTMENT: 'new_appointment',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  PROFILE_UPDATED: 'profile_updated'
};

// Notification functions
export const notifyDoctorOfNewAppointment = async (doctorId, appointment) => {
  try {
    notificationService.addNotification(doctorId, {
      type: NOTIFICATION_TYPES.NEW_APPOINTMENT,
      title: 'New Appointment Booked',
      message: `New appointment from ${appointment.user?.name || 'Patient'} on ${appointment.date} at ${appointment.time}`,
      data: { appointmentId: appointment._id }
    });
    console.log(`🔔 New appointment notification sent to doctor ${doctorId}`);
    return true;
  } catch (error) {
    console.error('Error sending new appointment notification:', error);
    return false;
  }
};

export const notifyDoctorOfCancellation = async (doctorId, appointment) => {
  try {
    notificationService.addNotification(doctorId, {
      type: NOTIFICATION_TYPES.APPOINTMENT_CANCELLED,
      title: 'Appointment Cancelled',
      message: `Appointment cancelled by ${appointment.user?.name || 'Patient'} for ${appointment.date} at ${appointment.time}`,
      data: { appointmentId: appointment._id }
    });
    console.log(`📧 Cancellation notification sent to doctor ${doctorId}`);
    return true;
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return false;
  }
};

export const notifyDoctorOfConfirmation = async (doctorId, appointment) => {
  try {
    notificationService.addNotification(doctorId, {
      type: NOTIFICATION_TYPES.APPOINTMENT_CONFIRMED,
      title: 'Appointment Confirmed',
      message: `You confirmed appointment with ${appointment.user?.name || 'Patient'} on ${appointment.date}`,
      data: { appointmentId: appointment._id }
    });
    return true;
  } catch (error) {
    console.error('Error sending confirmation notification:', error);
    return false;
  }
};

// Export service instance
export { notificationService };

// Legacy functions for backward compatibility
export const notifyUserOfCancellation = async (appointment) => {
  try {
    console.log(`📧 User notification: Appointment cancellation confirmed`);
    console.log(`User ID: ${appointment.user}`);
    console.log(`Date: ${appointment.date}, Time: ${appointment.time}`);
    return true;
  } catch (error) {
    console.error('Error sending user notification:', error);
    return false;
  }
};