const _ = require('lodash');
const validator = require('validator');

const logger = require('../config/logger');

/**
 * GET /app-login
 * App Login page.
 */
exports.getClientAppLogin = (req, res) => {
  res.render('account/client_login', {
    title: 'App Login',
    flashMessage: req.flash('errors')
  });
};

/**
 * GET /app
 * App page.
 */
exports.getAppPage = (req, res) => {
  res.render('client_app', {
    title: 'Signage App'
  });
};
