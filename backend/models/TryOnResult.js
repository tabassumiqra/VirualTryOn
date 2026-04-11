const mongoose = require('mongoose');

const TryOnResultSchema = new mongoose.Schema({
  userImage: { type: String, required: true },
  clothImage: { type: String, required: true },
  resultImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TryOnResult', TryOnResultSchema);
