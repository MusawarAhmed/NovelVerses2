const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  coins: { type: Number, default: 0 },
  avatar: { type: String },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Novel' }],
  purchasedChapters: [{ type: String }], // Storing Chapter IDs (might be ObjectIds or custom strings)
  readingHistory: [{
    novelId: { type: String },
    chapterId: { type: String },
    lastReadAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
