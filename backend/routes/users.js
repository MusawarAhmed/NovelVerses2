const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcryptjs');
const { auth, admin } = require('../middleware/authMiddleware');

// Create User (Admin)
router.post('/', auth, admin, async (req, res) => {
    const { username, email, password, role, coins } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ 
            username, 
            email, 
            password, 
            role: role || 'user',
            coins: coins || 0
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        
        // Return user without password
        const userObj = user.toObject();
        delete userObj.password;
        
        res.json(userObj);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

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

        const totalBalance = (user.coins || 0) + (user.bonusCoins || 0);
        if (totalBalance < price) {
            return res.status(400).json({ msg: 'Insufficient coins' });
        }

        // Deduct from Bonus Coins first
        if ((user.bonusCoins || 0) >= price) {
            user.bonusCoins -= price;
        } else {
            const remainder = price - (user.bonusCoins || 0);
            user.bonusCoins = 0;
            user.coins -= remainder;
        }
        
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

// Award XP
router.post('/xp', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const xpGain = amount || 10;
        
        const user = await User.findById(req.user.id);
        user.xp = (user.xp || 0) + xpGain;

        // Award Bonus Coins (e.g., 1 Bonus Coin per 10 XP)
        const bonusGain = Math.floor(xpGain / 10);
        if (bonusGain > 0) {
            user.bonusCoins = (user.bonusCoins || 0) + bonusGain;
        }

        // Calculate Rank
        let newRank = 'Mortal';
        if (user.xp >= 10000) newRank = 'Immortal';
        else if (user.xp >= 5000) newRank = 'Nascent Soul';
        else if (user.xp >= 2000) newRank = 'Golden Core';
        else if (user.xp >= 500) newRank = 'Foundation Establishment';
        else if (user.xp >= 100) newRank = 'Qi Condensation';

        let leveledUp = false;
        if (newRank !== user.cultivationRank) {
            user.cultivationRank = newRank;
            leveledUp = true;
        }

        await user.save();
        res.json({ xp: user.xp, rank: user.cultivationRank, leveledUp, bonusCoinsEarned: bonusGain });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete User (Admin)
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update User Role (Admin)
router.put('/:id/role', auth, admin, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        user.role = role;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
