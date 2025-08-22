const Notification = require('../models/Notification');

// Create a new notification
exports.createNotification = async (req, res) => {
    const { title, message, type, userId, gameId } = req.body;

    try {
        const notification = new Notification({
            title,
            message,
            type,
            userId,
            gameId,
            timestamp: new Date(),
            read: false
        });

        await notification.save();
        res.status(201).json({ message: 'Notification created successfully', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error creating notification', error });
    }
};

// Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
    const userId = req.params.userId;

    try {
        const notifications = await Notification.find({ userId }).sort({ timestamp: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    const notificationId = req.params.id;

    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        res.status(500).json({ message: 'Error marking notification as read', error });
    }
};