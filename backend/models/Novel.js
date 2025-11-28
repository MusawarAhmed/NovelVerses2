const mongoose = require('mongoose');

const novelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  author: { type: String, required: true },
  description: { type: String },
  coverUrl: { type: String },
  tags: [{ type: String }],
  category: { type: String, enum: ['Original', 'Fanfic', 'Translation'], default: 'Original' },
  status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
  views: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  isWeeklyFeatured: { type: Boolean, default: false },
  offerPrice: { type: Number },
  isFree: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Novel', novelSchema);
