const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String }, 
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  avatarColor: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
