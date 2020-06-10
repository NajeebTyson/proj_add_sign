const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: String,
  media: [String]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
