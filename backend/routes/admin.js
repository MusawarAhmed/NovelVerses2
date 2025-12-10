const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Novel = require('../models/Novel');
const Chapter = require('../models/Chapter');
const Transaction = require('../models/Transaction');
const SiteSetting = require('../models/SiteSetting');

// Get Stats
router.get('/stats', auth, admin, async (req, res) => {
    try {
        const totalNovels = await Novel.countDocuments();
        const totalChapters = await Chapter.countDocuments();
        const totalUsers = await User.countDocuments();
        // Calculate total revenue from transactions
        const transactions = await Transaction.find({ type: 'purchase' }); // Assuming 'purchase' adds to revenue, or maybe 'deposit'
        // Actually revenue is usually real money deposits. Let's sum deposits.
        const deposits = await Transaction.find({ type: 'deposit' });
        const totalRevenue = deposits.reduce((acc, curr) => acc + curr.amount, 0);

        // Top Novels by Views
        const topNovels = await Novel.find().sort({ views: -1 }).limit(5).select('title views');

        // Chapter Counts per Novel
        const novels = await Novel.find().select('title category views rating status');
        const novelStats = [];
        
        for (const novel of novels) {
            const count = await Chapter.countDocuments({ novelId: novel._id });
            novelStats.push({
                ...novel.toObject(),
                chapterCount: count
            });
        }

        res.json({
            totalNovels,
            totalChapters,
            totalUsers,
            totalRevenue,
            topNovels,
            novelStats
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Site Settings
router.get('/settings', async (req, res) => {
    try {
        let setting = await SiteSetting.findOne({ key: 'global' });
        if (!setting) {
            setting = new SiteSetting({ key: 'global' });
            await setting.save();
        }
        res.json(setting.settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Site Settings
router.put('/settings', auth, admin, async (req, res) => {
    try {
        let setting = await SiteSetting.findOne({ key: 'global' });
        if (!setting) {
            setting = new SiteSetting({ key: 'global' });
        }
        setting.settings = req.body;
        await setting.save();
        res.json(setting.settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
