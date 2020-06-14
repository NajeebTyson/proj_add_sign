const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  name: String,
  encoding: String,
  type: String,
  extension: String,
  path: String,
  saved_name: String,
  size: Number
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Media', MediaSchema);
