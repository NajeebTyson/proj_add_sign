const mongoose = require('mongoose');

function strToObjectId(strObjId) {
  return mongoose.Types.ObjectId(strObjId);
}

module.exports = {
  strToObjectId
};
