const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screen_id: String,
  screen_name: String,
  screen_code: String,
  playlist_id: String,
  status: String
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Screen', screenSchema);
