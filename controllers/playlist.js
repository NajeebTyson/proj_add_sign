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
    const playlist = new Playlist({
      name: req.body.playlist.name,
      media: []
    });
    Playlist.findOne({ name: req.body.playlist.name }, (err, existingMedia) => {
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
    Playlist.find(query, (err, data) => {
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
