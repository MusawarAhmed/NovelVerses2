const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  novelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Novel', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  volume: { type: String },
  order: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
