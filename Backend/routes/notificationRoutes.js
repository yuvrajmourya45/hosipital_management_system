import express from 'express';
import { notificationService } from '../utils/notificationService.js';

const router = express.Router();

// Get notifications for doctor
router.get('/doctor/:doctorId', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // Add a test notification if none exist
    if (!notificationService.getNotifications(doctorId).length) {
      notificationService.addNotification(doctorId, {
        type: 'new_appointment',
        title: 'Test Notification',
        message: 'This is a test notification to verify your system is working!',
        data: { test: true }
      });
    }
    
    const notifications = notificationService.getNotifications(doctorId);
    const unreadCount = notificationService.getUnreadCount(doctorId);
    
    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', (req, res) => {
  try {
    const { notificationId } = req.params;
    const { doctorId } = req.body;
    
    notificationService.markAsRead(doctorId, parseInt(notificationId));
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.patch('/doctor/:doctorId/read-all', (req, res) => {
  try {
    const { doctorId } = req.params;
    
    notificationService.markAllAsRead(doctorId);
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

export default router;