import { notificationService } from '../utils/notificationService.js';

// ===================== GET NOTIFICATIONS =======================
export const getNotifications = (req, res) => {
  try {
    const { doctorId } = req.params;
    if (!notificationService.getNotifications(doctorId).length) {
      notificationService.addNotification(doctorId, {
        type: 'new_appointment',
        title: 'Test',
        message: 'Test notification',
        data: { test: true }
      });
    }
    res.json({ success: true, notifications: notificationService.getNotifications(doctorId), unreadCount: notificationService.getUnreadCount(doctorId) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: error.message });
  }
};

// ===================== MARK AS READ =====================
export const markAsRead = (req, res) => {
  try {
    notificationService.markAsRead(req.body.doctorId, parseInt(req.params.notificationId));
    res.json({ success: true, message: 'Marked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: error.message });
  }
};

// ==================== MARK ALL AS READ ===========================
export const markAllAsRead = (req, res) => {
  try {
    notificationService.markAllAsRead(req.params.doctorId);
    res.json({ success: true, message: 'Marked all' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed', error: error.message });
  }
};
