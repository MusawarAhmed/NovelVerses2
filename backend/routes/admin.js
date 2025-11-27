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
        const totalRevenue = deposits.reduce((acc, curr) => acc + curr.amount, 0); // This is coins, not $, but fine for now.

        res.json({
            totalNovels,
            totalChapters,
            totalUsers,
            totalRevenue
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
