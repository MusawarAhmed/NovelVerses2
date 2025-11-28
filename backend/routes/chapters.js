const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');
const Novel = require('../models/Novel');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, admin } = require('../middleware/authMiddleware');

// Get chapters for a novel
// Get chapters for a novel
router.get('/novel/:novelId', async (req, res) => {
    try {
        let novelId = req.params.novelId;
        
        // Check if it's a slug (not an ObjectId)
        if (!novelId.match(/^[0-9a-fA-F]{24}$/)) {
             // Try to find novel by slug first
             const novel = await Novel.findOne({ slug: novelId });
             if (novel) {
                 novelId = novel._id;
             } else {
                 // If not found by slug, it might be a slug_id format or just invalid
                 const idMatch = novelId.match(/_([0-9a-fA-F]{24})$/);
                 if (idMatch) {
                     novelId = idMatch[1];
                 }
             }
        }

        const chapters = await Chapter.find({ novelId: novelId }).sort({ order: 1 });
        res.json(chapters);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single chapter
// Get single chapter
router.get('/:id', async (req, res) => {
    try {
        let query = req.params.id;
        
        // Check if it's a slug_id format (ends with _ObjectId)
        const idMatch = query.match(/_([0-9a-fA-F]{24})$/);
        if (idMatch) {
            query = idMatch[1];
        }

        const chapter = await Chapter.findById(query);
        if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
        res.json(chapter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create chapter (Admin)
router.post('/', [auth, admin], async (req, res) => {
    try {
        const newChapter = new Chapter(req.body);
        const chapter = await newChapter.save();
        
        // Update novel updatedAt
        const novel = await Novel.findByIdAndUpdate(req.body.novelId, { updatedAt: Date.now() }, { new: true });

        // Create notifications for users who bookmarked this novel
        if (novel) {
            const usersWithBookmark = await User.find({ bookmarks: req.body.novelId }).select('_id');
            
            if (usersWithBookmark.length > 0) {
                const notifications = usersWithBookmark.map(user => ({
                    userId: user._id,
                    type: 'new_chapter',
                    title: 'New Chapter Released!',
                    message: `${novel.title} - ${chapter.title}`,
                    link: `/reader/${novel._id}/${chapter._id}`,
                    metadata: {
                        novelId: novel._id.toString(),
                        novelTitle: novel.title,
                        chapterId: chapter._id.toString(),
                        chapterTitle: chapter.title
                    }
                }));
                
                await Notification.insertMany(notifications);
                console.log(`Created ${notifications.length} notifications for new chapter`);
            }
        }

        res.json(chapter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update chapter (Admin)
router.put('/:id', [auth, admin], async (req, res) => {
    try {
        let chapter = await Chapter.findById(req.params.id);
        if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });

        chapter = await Chapter.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(chapter);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete chapter (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        let chapter = await Chapter.findById(req.params.id);
        if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });

        await Chapter.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Chapter removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
