import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    createNotification,
    getNotificationsByUser,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../db';
import { CreateNotificationData, NotificationResponse, NotificationsResponse } from '@shared/api';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const notifications = await getNotificationsByUser(user.id, limit);
        const unreadCount = await getUnreadNotificationCount(user.id);

        const response: NotificationsResponse = {
            success: true,
            message: 'Notifications retrieved successfully',
            notifications: notifications,
            unread_count: unreadCount
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const unreadCount = await getUnreadNotificationCount(user.id);

        res.json({
            success: true,
            message: 'Unread count retrieved successfully',
            unread_count: unreadCount
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count'
        });
    }
});

// Mark a notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const success = await markNotificationAsRead(id, user.id);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or already read'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const updatedCount = await markAllNotificationsAsRead(user.id);

        res.json({
            success: true,
            message: `Marked ${updatedCount} notifications as read`,
            updated_count: updatedCount
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read'
        });
    }
});

// Create notification (internal use, for system notifications)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Only project managers can create system notifications
        if (user.role !== 'project_manager') {
            return res.status(403).json({ success: false, message: 'Only project managers can create notifications' });
        }

        const notificationData: CreateNotificationData = req.body;

        // Validate required fields
        if (!notificationData.user_id || !notificationData.type || !notificationData.title || !notificationData.message) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: user_id, type, title, message'
            });
        }

        const notificationId = uuidv4();
        const notification = await createNotification({
            ...notificationData,
            id: notificationId
        });

        const response: NotificationResponse = {
            success: true,
            message: 'Notification created successfully',
            notification: notification
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
});

export default router;