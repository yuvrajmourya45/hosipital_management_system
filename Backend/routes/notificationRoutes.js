import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/doctor/:doctorId', getNotifications);
router.patch('/:notificationId/read', markAsRead);
router.patch('/doctor/:doctorId/read-all', markAllAsRead);

export default router;
