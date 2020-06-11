// const { promisify } = require('util');
// const cheerio = require('cheerio');
// const axios = require('axios');
// const { google } = require('googleapis');
// const validator = require('validator');

const Media = require('../models/Media');
const Playlist = require('../models/Playlist');

const logger = require('../config/logger');
const { BadRequestError } = require('./utils/error');
const { strToObjectId } = require('./utils/utils');

/**
 * GET /api
 * List of API examples.
 */
exports.getApi = (req, res) => {
  res.render('api/index', {
    title: 'API Examples'
  });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
// exports.getFacebook = (req, res, next) => {
//   const token = req.user.tokens.find((token) => token.kind === 'facebook');
//   graph.setAccessToken(token.accessToken);
//   graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, profile) => {
//     if (err) { return next(err); }
//     res.render('api/facebook', {
//       title: 'Facebook API',
//       profile
//     });
//   });
// };

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res, next) => {
  const playlistId = req.body.playlist;
  if (!playlistId) {
    return next(new BadRequestError('Playlist not given'));
  }
  const { files } = req;
  if (!files) {
    return next(new BadRequestError('Files not uploaded'));
  }
  const tasks = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const media = new Media({
      name: file.originalname,
      encoding: file.encoding,
      type: file.mimetype.substring(0, file.mimetype.search('/')),
      extension: file.mimetype.substring(file.mimetype.search('/') + 1),
      path: file.path,
      saved_name: file.filename,
      size: file.size
    });
    tasks.push(media.save());
  }
  Promise.all(tasks).then((value) => {
    const ids = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const doc of value) {
      ids.push(doc._id.toString());
    }
    console.log('playlist:', strToObjectId(playlistId));
    console.log('ids: ', ids);
    Playlist.updateOne({ _id: strToObjectId(playlistId) }, { '$addToSet': { 'media': { '$each': ids } } }, (err) => {
      if (err) {
        logger.error(`postFileUpload - Error: ${err}`);
      }
      res.json({
        status: true
      });
    });
  }).catch((err) => {
    next(new BadRequestError(err));
  });
};
