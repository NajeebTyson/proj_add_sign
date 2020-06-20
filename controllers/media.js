const router = require('express').Router();
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const Media = require('../models/Media');
const { removeMediasFromPlaylists } = require('./playlist');
const { BadRequestError, ForbiddenError } = require('./utils/error');
const { strToObjectId } = require('./utils/utils');

const deleteMediaContent = async (names) => {
  _.forEach(names, (mediaName) => {
    fs.unlinkSync(path.join('./uploads', mediaName));
  });
};


router.route('/')
  .get((req, res, next) => {
    const { query } = req;
    if (!query) {
      return next(new ForbiddenError('No query to get media'));
    }
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
    if (!query) {
      return next(new ForbiddenError('Forbidden to delete all media'));
    }
    Media.find(query, async (findErr, findData) => {
      if (findErr) {
        return next(findErr);
      }
      const mediaNames = _.map(findData, (doc) => doc.saved_name);
      await deleteMediaContent(mediaNames);
      Media.deleteMany(query, (err, deleteData) => {
        if (err) {
          return next(err);
        }
        // remove it from all the playlists
        const idsMedia = _.map(findData, (doc) => doc._id);
        removeMediasFromPlaylists(idsMedia).then((rres) => {
          res.json({
            status: true,
            data: deleteData
          });
        }).catch((err) => next(new BadRequestError(err)));
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
