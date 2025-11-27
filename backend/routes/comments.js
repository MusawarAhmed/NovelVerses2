const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { auth } = require('../middleware/authMiddleware');

// Get comments for a chapter
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const comments = await Comment.find({ chapterId: req.params.chapterId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create comment
router.post('/', auth, async (req, res) => {
    try {
        const { chapterId, content, username, avatarColor } = req.body;
        const newComment = new Comment({
            chapterId,
            userId: req.user.id,
            username: username || 'User', // Fallback
            content,
            avatarColor: avatarColor || 'bg-indigo-500'
        });
        const comment = await newComment.save();
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
