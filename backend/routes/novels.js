const express = require('express');
const router = express.Router();
const Novel = require('../models/Novel');
const { auth, admin } = require('../middleware/authMiddleware');

// Get all novels
router.get('/', async (req, res) => {
    try {
        const { limit, skip, category, sort, status, search } = req.query;
        let query = {};
        
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { author: searchRegex },
                { tags: searchRegex }
            ];
        }

        if (category && category !== 'all') {
             query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (status && status !== 'all') {
            query.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }

        let sortOption = { updatedAt: -1 };
        if (sort === 'popular') sortOption = { views: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };
        if (sort === 'new') sortOption = { createdAt: -1 };
        if (sort === 'collections') sortOption = { views: -1 }; // Assuming collections ~ views for now, or add bookmarks count if available

        const l = parseInt(limit) || 20;
        const s = parseInt(skip) || 0;

        const novels = await Novel.find(query)
            .sort(sortOption)
            .limit(l)
            .skip(s);
            
        res.json(novels);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Helper to slugify
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
};

// Get single novel (by ID or Slug)
// Get single novel (by ID or Slug or slug_id)
router.get('/:id', async (req, res) => {
    try {
        let query = req.params.id;
        
        // Check if it's a slug_id format (ends with _ObjectId)
        // Regex for ObjectId: 24 hex characters
        const idMatch = query.match(/_([0-9a-fA-F]{24})$/);
        if (idMatch) {
            query = idMatch[1];
        }

        let novel;
        if (query.match(/^[0-9a-fA-F]{24}$/)) {
            novel = await Novel.findById(query);
        } else {
            novel = await Novel.findOne({ slug: query });
        }

        if (!novel) return res.status(404).json({ msg: 'Novel not found' });
        res.json(novel);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create novel (Admin)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const { title } = req.body;
        let slug = slugify(title);
        
        // Check if slug exists
        let existingNovel = await Novel.findOne({ slug });
        if (existingNovel) {
            slug = `${slug}-${Date.now()}`;
        }

        const newNovel = new Novel({ ...req.body, slug });
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

        const { title } = req.body;
        let slug = novel.slug;

        // If title changed, update slug
        if (title && title !== novel.title) {
            slug = slugify(title);
            let existingNovel = await Novel.findOne({ slug });
            if (existingNovel && existingNovel.id !== novel.id) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        novel = await Novel.findByIdAndUpdate(req.params.id, { $set: { ...req.body, slug } }, { new: true });
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
