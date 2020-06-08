const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: String,
  media: [
    {
      mediaName: String,
      mediaType: String,
      creationTime: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
