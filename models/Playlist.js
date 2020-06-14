const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: String,
  media: [String]
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Playlist', playlistSchema);
