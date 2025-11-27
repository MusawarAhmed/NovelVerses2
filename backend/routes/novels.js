const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');
const { auth, admin } = require('../middleware/authMiddleware');

// Get all novels
router.get('/', async (req, res) => {
    try {
        const novels = await Novel.find().sort({ updatedAt: -1 });
        res.json(novels);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single novel
router.get('/:id', async (req, res) => {
    try {
        const novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ msg: 'Novel not found' });
        res.json(novel);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Novel not found' });
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create novel (Admin)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const newNovel = new Novel(req.body);
        const novel = await newNovel.save();
        res.json(novel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update novel (Admin)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        let novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ msg: 'Novel not found' });

        novel = await Novel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(novel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete novel (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        let novel = await Novel.findById(req.params.id);
        if (!novel) return res.status(404).json({ msg: 'Novel not found' });

        await Novel.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Novel removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
