const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Novel = require('../models/Novel');
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

// Get comments (reviews) for a novel
router.get('/novel/:novelId', async (req, res) => {
    try {
        const comments = await Comment.find({ novelId: req.params.novelId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create comment
router.post('/', auth, async (req, res) => {
    try {
        const { chapterId, novelId, content, username, avatarColor, rating, paragraphId } = req.body;
        
        if (!chapterId && !novelId) {
            return res.status(400).json({ msg: 'Chapter ID or Novel ID is required' });
        }

        const newComment = new Comment({
            chapterId,
            novelId,
            userId: req.user.id,
            username: username || 'User', // Fallback
            content,
            rating,
            avatarColor: avatarColor || 'bg-indigo-500',
            paragraphId
        });
        const comment = await newComment.save();

        // If it's a review (has novelId and rating), update novel rating
        if (novelId && rating) {
            const reviews = await Comment.find({ novelId, rating: { $exists: true } });
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                const avgRating = (totalRating / reviews.length).toFixed(1);
                
                await Novel.findByIdAndUpdate(novelId, { rating: parseFloat(avgRating) });
            }
        }

        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
