const router = require('express').Router();
const validator = require('validator');

const Screen = require('../models/Screen');
const { BadRequestError, ForbiddenError } = require('./utils/error');
const { isTrue } = require('./utils/utils');

const SCREEN_STATUS = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped'
};

router.route('/')
  .get((req, res, next) => {
    const { query } = req;
    if (!query) {
      return next(new ForbiddenError('No query to get media'));
    }
    Screen.find(query, (err, data) => {
      if (err) {
        return next(err);
      }
      res.json({
        status: true,
        data
      });
    });
  })
  .post((req, res, next) => {
    if (req.body.screen === undefined) {
      return next(new BadRequestError('`screen` is missing in Body'));
    }
    if (validator.isEmpty(req.body.screen.screenId)) {
      return next(new BadRequestError('Screen id is not valid'));
    }
    if (validator.isEmpty(req.body.screen.screenName)) {
      return next(new BadRequestError('Screen name is not valid'));
    }
    if (validator.isEmpty(req.body.screen.screenCode)) {
      return next(new BadRequestError('Screen name is not valid'));
    }
    const screenName = req.body.screen.screenName.toLowerCase();
    const { screenId } = req.body.screen;
    const screen = new Screen({
      screen_id: screenId,
      screen_name: screenName,
      screen_code: req.body.screen.screenCode,
      playlist_id: null,
      status: SCREEN_STATUS.STOPPED,
      shuffle: isTrue(req.body.screen.screenShuffle)
    });
    Screen.findOne({ screen_id: screenId }, (err, existingScreen) => {
      if (err) {
        return next(err);
      }
      if (existingScreen) {
        return next(new BadRequestError('Screen with this id already exist'));
      }
      screen.save((err) => {
        if (err) {
          return next(err);
        }
        res.json({
          status: true
        });
      });
    });
  })
  .delete((req, res, next) => {
    const { query } = req;
    if (query.name !== undefined) {
      query.name = query.name.toLowerCase();
    }
    Screen.deleteMany(query, (err, data) => {
      if (err) {
        return next(err);
      }
      res.json({
        status: true,
        data
      });
    });
  });

router.route('/playlist')
  .post((req, res, next) => {
    if (req.body.screen === undefined) {
      return next(new BadRequestError('`screen` is missing in Body'));
    }
    if (validator.isEmpty(req.body.screen.screenId)) {
      return next(new BadRequestError('Screen id is not valid'));
    }
    if (validator.isEmpty(req.body.screen.playlistId)) {
      return next(new BadRequestError('Playlist id is not valid'));
    }
    Screen.updateOne({ _id: req.body.screen.screenId },
      { $set: { playlist_id: req.body.screen.playlistId } },
      (err, data) => {
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
