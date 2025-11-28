const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, admin } = require('../middleware/authMiddleware');

// Get user's notifications (paginated)
router.get('/', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const skip = parseInt(req.query.skip) || 0;
        
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);
        
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ 
            userId: req.user.id, 
            isRead: false 
        });
        res.json({ count });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        
        notification.isRead = true;
        await notification.save();
        
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ msg: 'All notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });
        
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        
        res.json({ msg: 'Notification deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create system announcement (Admin only)
router.post('/announcement', auth, admin, async (req, res) => {
    try {
        const { title, message, link } = req.body;
        
        // Get all users
        const users = await User.find().select('_id');
        console.log(`Found ${users.length} users for announcement.`);
        
        // Create notification for each user
        const notifications = users.map(user => ({
            userId: user._id,
            type: 'system_announcement',
            title,
            message,
            link: link || '/',
            metadata: {}
        }));
        
        const result = await Notification.insertMany(notifications);
        console.log(`Created ${result.length} notifications.`);
        
        res.json({ msg: `Announcement sent to ${users.length} users` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
