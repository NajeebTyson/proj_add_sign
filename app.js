/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('express-flash');
const path = require('path');
const util = require('util');
const passport = require('passport');
const sass = require('node-sass-middleware');
const multer = require('multer');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Utils
 */
const logger = require('./config/logger');
const { HttpCodes } = require('./controllers/utils/error');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
// const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const { isAuthorized } = require('./config/passport');
const playlistApi = require('./controllers/playlist');
const mediaApi = require('./controllers/media');
const screenApi = require('./controllers/screen');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  logger.error(err);
  logger.info('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/static/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/static/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
app.use('/static/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/static/bootstrap/', express.static(path.join(__dirname, 'node_modules/bootstrap'), { maxAge: 31557600000 }));
app.use('/static/jquery/', express.static(path.join(__dirname, 'node_modules/jquery'), { maxAge: 31557600000 }));
app.use('/static/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));
app.use('/static/bootstrap-notify/', express.static(path.join(__dirname, 'node_modules/bootstrap-notify'), { maxAge: 31557600000 }));
app.use('/static/blueimp-file-upload/', express.static(path.join(__dirname, 'node_modules/blueimp-file-upload'), { maxAge: 31557600000 }));
app.use('/static/media/', express.static(path.join(__dirname, 'uploads'), { maxAge: 31557600000 }));


app.use((req, res, next) => {
  logger.info(`--Request ${req.connection.remoteAddress} ${req.method} ${req.originalUrl} args: ${util.inspect(req.query)}`);
  next();
});

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/dashboard', homeController.dashboard);
app.get('/screens', homeController.dashboardScreens);
app.get('/admin-signup', userController.getAdminSignup);
app.post('/admin-signup', userController.postAdminSignup);
app.get('/admin-login', userController.getAdminLogin);
app.post('/admin-login', userController.postAdminLogin);
app.get('/logout', userController.logout);
// app.get('/login', userController.getLogin);
// app.post('/login', userController.postLogin);
// app.get('/forgot', userController.getForgot);
// app.post('/forgot', userController.postForgot);
// app.get('/reset/:token', userController.getReset);
// app.post('/reset/:token', userController.postReset);
// app.get('/signup', userController.getSignup);
// app.post('/signup', userController.postSignup);
// app.get('/contact', contactController.getContact);
// app.post('/contact', contactController.postContact);
// app.get('/account/verify', passportConfig.isAuthenticated, userController.getVerifyEmail);
// eslint-disable-next-line max-len
// app.get('/account/verify/:token', passportConfig.isAuthenticated, userController.getVerifyEmailToken);
// app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
// app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
// app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
// app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
// eslint-disable-next-line max-len
// app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.use('/api/playlist', playlistApi.router);
app.use('/api/media', mediaApi);
app.use('/api/screen', screenApi.router);
// eslint-disable-next-line max-len
// app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
// app.get('/api/upload', lusca({ csrf: true }), apiController.getFileUpload);
// eslint-disable-next-line max-len
app.post('/api/upload', upload.array('mediaFiles[]'), apiController.postFileUpload);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    if (err) {
      logger.error(err.toString());
      if (err.code === 11000) { // duplicate key error
        res.status(HttpCodes.BadRequest).json({ error: 'duplicate value error' });
      } else if (err.code === HttpCodes.BadRequest) {
        res.status(HttpCodes.BadRequest).json({ error: err.message });
      } else if (err.code === HttpCodes.Forbidden) {
        res.status(HttpCodes.Forbidden).json({ error: err.message });
      } else if (err.code === HttpCodes.Unauthorized) {
        res.send('You are not authorized to Access this page');
      } else {
        res.status(500).send(err.toString());
      }
    } else {
      logger.error(err.toString());
      res.status(500).send('Server Error');
    }
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
