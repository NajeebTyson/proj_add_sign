/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  });
};

exports.dashboard = (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard'
  });
};

exports.dashboardScreens = (req, res) => {
  res.render('dashboard_screen', {
    title: 'Dashboard Screens'
  });
};
