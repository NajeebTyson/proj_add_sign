const router = require('express').Router();
const validator = require('validator');
const _ = require('lodash');

const Playlist = require('../models/Playlist');
const { deletePlaylistsFromScreens } = require('./screen');
const { BadRequestError } = require('./utils/error');

async function removeMediasFromPlaylists(mediaIds) {
  const ids = await _.map(mediaIds, (id) => id.toString());
  return Playlist.updateMany({}, { $pull: { media: { $in: ids } } });
}

router.route('/')
  .post((req, res, next) => {
    if (req.body.playlist === undefined) {
      return next(new BadRequestError('`playlist` is missing in Body'));
    }
    if (validator.isEmpty(req.body.playlist.name)) {
      return next(new BadRequestError('Playlist name is not valid'));
    }
    const playlistName = req.body.playlist.name.toLowerCase();
    const playlist = new Playlist({
      name: playlistName,
      media: []
    });
    Playlist.findOne({ name: playlistName }, (err, existingMedia) => {
      if (err) {
        return next(err);
      }
      if (existingMedia) {
        return next(new BadRequestError('Playlist with this name already exist'));
      }
      playlist.save((err) => {
        if (err) {
          return next(err);
        }
        res.json({
          status: true
        });
      });
    });
  })
  .get((req, res, next) => {
    const { query } = req;
    if (query.name !== undefined) {
      query.name = query.name.toLowerCase();
    }
    Playlist.find(query, (err, data) => {
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
    if (query.name !== undefined) {
      query.name = query.name.toLowerCase();
    }
    Playlist
      .find(query)
      .then((dataFind) => {
        const ids = _.map(dataFind, (playlistDoc) => playlistDoc._id.toString());
        return deletePlaylistsFromScreens(ids);
      })
      .then(() => Playlist.deleteMany(query))
      .then((dataDelete) => {
        res.json({
          status: true,
          data: dataDelete
        });
      })
      .catch((err) => next(err));
  });

module.exports.router = router;
module.exports.removeMediasFromPlaylists = removeMediasFromPlaylists;
