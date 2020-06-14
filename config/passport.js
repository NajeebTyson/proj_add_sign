const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
// const _ = require('lodash');

const User = require('../models/User');
const { UnauthorizedError } = require('../controllers/utils/error');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` });
    }
    if (!user.password) {
      return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { msg: 'Invalid email or password.' });
    });
  });
}));

/**
 * Login Required middleware.
 */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function getUserTypeFromReq(req) {
  if (!req.user) return null;
  return req.user._doc.type;
}

// eslint-disable-next-line no-unused-vars
function getRouteFromReq(req) {
  const route = req.baseUrl;
  if (route === '') return '/';
  return route;
}

/**
 * Authorization Required middleware.
 */
function isAuthorized(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('Unauthorized or Unauthenticated request');
  } else {
    const type = getUserTypeFromReq(req);
    if (type === null) {
      throw new UnauthorizedError('Unauthorized or Unauthenticated request');
    } else {
      if (type === 'admin') {
        return next();
      }
      if (type === 'storeUser') {
        return next();
      }
      throw new UnauthorizedError('Unauthorized request');
    }
  }
}

module.exports = {
  isAuthenticated,
  isAuthorized,
  passport
};
