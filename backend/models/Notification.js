const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['new_chapter', 'comment_reply', 'system_announcement'],
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: {
        novelId: { type: String },
        novelTitle: { type: String },
        chapterId: { type: String },
        chapterTitle: { type: String },
        commentId: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

// Index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
