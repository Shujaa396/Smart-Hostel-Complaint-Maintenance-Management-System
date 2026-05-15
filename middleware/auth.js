module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to continue.');
    res.redirect('/login');
  },

  forwardAuthenticated: (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    const role = req.session.user.role;
    if (role === 'admin') return res.redirect('/admin/dashboard');
    if (role === 'student') return res.redirect('/student/dashboard');
    if (role === 'worker') return res.redirect('/worker/dashboard');
    return res.redirect('/');
  },

  ensureRole: (role) => {
    return (req, res, next) => {
      if (!req.session.user) {
        req.flash('error_msg', 'Please log in to continue.');
        return res.redirect('/login');
      }
      const userRole = req.session.user.role;
      const allowedRoles = Array.isArray(role) ? role : [role];
      if (allowedRoles.includes(userRole)) {
        return next();
      }
      req.flash('error_msg', 'Unauthorized access.');
      res.redirect('/login');
    };
  }
};
