const router = require('express').Router();
const validator = require('validator');

const agenda = require('../config/worker');
const Screen = require('../models/Screen');
const logger = require('../config/logger');
const { BadRequestError, ForbiddenError, NotFoundError } = require('./utils/error');
const { isTrue } = require('./utils/utils');

const SCREEN_STATUS = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped'
};

// eslint-disable-next-line max-len
const updateScreenActiveStatus = (screenId, activeStatus) => Screen.updateOne({ screen_id: screenId }, { active: activeStatus });

const scheduleScreenJob = (jobName, screenId) => {
  agenda.define(jobName, async (job) => {
    await updateScreenActiveStatus(job.attrs.data.screen_id, false);
    logger.info(`Screen [${job.attrs.data.screen_id}] is offline now.`);
    job.remove();
  });
  agenda.schedule('one minute', jobName, { screen_id: screenId });
  logger.info(`Screen [${screenId}] is active now.`);
};

const scheduleScreenStatus = async (screenId) => {
  const jobName = `screen_${screenId}`;
  const jobs = await agenda.jobs({ name: jobName });
  if (jobs.length > 0) {
    await agenda.cancel({ name: jobName });
    scheduleScreenJob(jobName, screenId);
  } else {
    await updateScreenActiveStatus(screenId, true);
    scheduleScreenJob(jobName, screenId);
  }
};

router.get('/heartbeat', (req, res, next) => {
  const { query } = req;
  if (!query) {
    return next(new ForbiddenError('No query to get media'));
  }
  const { app } = query;
  delete query.app;
  Screen.find(query, async (err, data) => {
    if (err) {
      return next(err);
    }
    if (query.screen_id && app === 'client') {
      await scheduleScreenStatus(query.screen_id);
    }
    res.json({
      status: true,
      data
    });
  });
});

router.route('/')
  .get((req, res, next) => {
    const { query } = req;
    if (!query) {
      return next(new ForbiddenError('No query to get media'));
    }
    const { app } = query;
    delete query.app;
    Screen.find(query, async (err, data) => {
      if (err) {
        return next(err);
      }
      if (query.screen_id && app === 'client') {
        await scheduleScreenStatus(query.screen_id);
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
      shuffle: isTrue(req.body.screen.screenShuffle),
      image_duration: req.body.screen.imageDuration,
      active: false
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

router.put('/controls', (req, res, next) => {
  if (req.body.screen === undefined) {
    return next(new BadRequestError('`screen` is missing in Body'));
  }
  if (validator.isEmpty(req.body.screen.screenId)) {
    return next(new BadRequestError('Screen id is not valid'));
  }
  if (validator.isEmpty(req.body.screen.controlStatus)) {
    return next(new BadRequestError('Screen control option is missing'));
  }
  const { screenId, controlStatus } = req.body.screen;
  if (controlStatus !== SCREEN_STATUS.PLAYING
    && controlStatus !== SCREEN_STATUS.PAUSED
    && controlStatus !== SCREEN_STATUS.STOPPED) {
    return next(new BadRequestError('Screen control option is not valid'));
  }
  Screen.updateOne({ _id: screenId }, { $set: { status: controlStatus } }, (err, data) => {
    if (err) {
      return next(err);
    }
    res.json({
      status: true,
      data
    });
  });
});

router.put('/shuffle', (req, res, next) => {
  if (req.body.screen === undefined) {
    return next(new BadRequestError('`screen` is missing in Body'));
  }
  if (validator.isEmpty(req.body.screen.screenId)) {
    return next(new BadRequestError('Screen id is not valid'));
  }
  if (validator.isEmpty(req.body.screen.shuffle)) {
    return next(new BadRequestError('Screen shuffle is missing'));
  }
  const { screenId, shuffle } = req.body.screen;
  Screen.updateOne({ _id: screenId }, { $set: { shuffle: isTrue(shuffle) } }, (err, data) => {
    if (err) {
      return next(err);
    }
    res.json({
      status: true,
      data
    });
  });
});

router.route('/login').post((req, res, next) => {
  if (req.body.screen === undefined) {
    return next(new BadRequestError('Invalid request'));
  }
  if (validator.isEmpty(req.body.screen.screenId)) {
    return next(new BadRequestError('Screen id is not valid'));
  }
  if (validator.isEmpty(req.body.screen.screenCode)) {
    return next(new BadRequestError('Screen code is not valid'));
  }
  // eslint-disable-next-line max-len
  Screen.findOne({ screen_id: req.body.screen.screenId, screen_code: req.body.screen.screenCode }, (err, doc) => {
    if (err) {
      return next(err);
    }
    if (!doc) {
      return next(new NotFoundError('Invalid screen id or code'));
    }
    res.json({
      status: true,
      data: doc
    });
  });
});

// eslint-disable-next-line max-len
const deletePlaylistsFromScreens = async (playlistIds) => Screen.updateMany({ playlist_id: { $in : playlistIds } }, { $set: { playlist_id: null } });

module.exports.router = router;
module.exports.deletePlaylistsFromScreens = deletePlaylistsFromScreens;
