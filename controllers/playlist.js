const router = require('express').Router();
const validator = require('validator');

const Playlist = require('../models/Playlist');
const { BadRequestError } = require('./utils/error');

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
    Playlist.deleteMany(query, (err, data) => {
      if (err) {
        return next(err);
      }
      res.json({
        status: true,
        data
      });
    });
  });

module.exports = router;
