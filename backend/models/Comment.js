const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String }, 
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  rating: { type: Number },
  avatarColor: { type: String },
  paragraphId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
