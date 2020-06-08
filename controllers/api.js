// const { promisify } = require('util');
// const cheerio = require('cheerio');
// const axios = require('axios');
// const { google } = require('googleapis');
// const validator = require('validator');

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

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};
