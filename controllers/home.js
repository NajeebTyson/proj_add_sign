/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/admin-login');
};

exports.dashboard = (req, res) => {
  if (!req.user) {
    return res.redirect('/admin-login');
  }
  res.render('dashboard', {
    title: 'Dashboard'
  });
};
