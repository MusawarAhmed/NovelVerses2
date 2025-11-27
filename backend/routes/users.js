const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const Transaction = require('../models/Transaction');
const { auth, admin } = require('../middleware/authMiddleware');

// Update Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, avatar } = req.body;
        const user = await User.findById(req.user.id);
        if (username) user.username = username;
        if (avatar) user.avatar = avatar;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Toggle Bookmark
router.post('/bookmark/:novelId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const novelId = req.params.novelId; 
        
        // Check if novel exists (optional but good)
        // const novel = await Novel.findById(novelId);
        // if (!novel) return res.status(404).json({ msg: 'Novel not found' });

        if (user.bookmarks.includes(novelId)) {
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== novelId);
        } else {
            user.bookmarks.push(novelId);
        }
        await user.save();
        res.json(user.bookmarks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Purchase Chapter
router.post('/purchase/:chapterId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const chapter = await Chapter.findById(req.params.chapterId);
        if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });

        if (user.purchasedChapters.includes(chapter.id)) {
            return res.status(400).json({ msg: 'Already purchased' });
        }

        const novel = await Novel.findById(chapter.novelId);
        let price = chapter.price;
        if (novel && (novel.isFree || (novel.offerPrice && novel.offerPrice > 0))) {
             if (novel.isFree) price = 0;
             else if (novel.offerPrice) price = novel.offerPrice;
        }

        if (user.coins < price) {
            return res.status(400).json({ msg: 'Insufficient coins' });
        }

        user.coins -= price;
        user.purchasedChapters.push(chapter.id);
        await user.save();

        if (price > 0) {
            const transaction = new Transaction({
                userId: user.id,
                amount: price,
                type: 'purchase',
                description: `Purchased ${chapter.title}`
            });
            await transaction.save();
        }

        res.json({ success: true, coins: user.coins });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add Coins (Mock Payment)
router.post('/add-coins', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.id);
        user.coins += amount;
        await user.save();

        const transaction = new Transaction({
            userId: user.id,
            amount: amount,
            type: 'deposit',
            description: 'Wallet Top-up'
        });
        await transaction.save();

        res.json({ coins: user.coins });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Save Reading History
router.post('/history', auth, async (req, res) => {
    try {
        const { novelId, chapterId } = req.body;
        const user = await User.findById(req.user.id);
        
        // Remove existing entry for this novel if exists
        user.readingHistory = user.readingHistory.filter(h => h.novelId !== novelId);
        
        // Add new entry to top
        user.readingHistory.unshift({
            novelId,
            chapterId,
            lastReadAt: Date.now()
        });

        // Limit history size
        if (user.readingHistory.length > 20) {
            user.readingHistory = user.readingHistory.slice(0, 20);
        }

        await user.save();
        res.json(user.readingHistory);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get All Users (Admin)
router.get('/', auth, admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
