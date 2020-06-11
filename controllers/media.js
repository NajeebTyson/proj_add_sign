const router = require('express').Router();
const _ = require('lodash');

const Media = require('../models/Media');
const { BadRequestError } = require('./utils/error');
const { strToObjectId } = require('./utils/utils');

router.route('/')
  .get((req, res, next) => {
    const { query } = req;
    Media.find(query, (err, data) => {
      if (err) {
        return next(err);
      }
      res.json({
        status: true,
        data
      });
    });
  })
  .delete((req, res, next) => {
    const { query } = req;
    Media.deleteMany(query, (err, data) => {
      if (err) {
        return next(err);
      }
      res.json({
        status: true,
        data
      });
    });
  });

router.post('/ids', (req, res, next) => {
  if (!req.body.media) {
    return next(new BadRequestError('`media` is missing'));
  }
  let { ids } = req.body.media;
  if (!ids) {
    return next(new BadRequestError('`ids` is missing from media'));
  }
  ids = _.map(ids, strToObjectId);
  Media.find({
    _id: { '$in': ids }
  }, (err, docs) => {
    if (err) {
      return next(new BadRequestError(err));
    }
    res.json({
      status: true,
      data: docs
    });
  });
});

module.exports = router;
