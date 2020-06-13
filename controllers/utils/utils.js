const mongoose = require('mongoose');

function strToObjectId(strObjId) {
  return mongoose.Types.ObjectId(strObjId);
}

function isTrue(obj) {
  const trueObjects = ['true', 'True', '1', 1];
  // eslint-disable-next-line no-restricted-syntax
  for (const trueObj of trueObjects) {
    if (obj === trueObj) {
      return true;
    }
  }
  return false;
}

module.exports = {
  strToObjectId,
  isTrue
};
