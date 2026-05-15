const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const roles = ['student'];

module.exports = {
  showLogin: (req, res) => {
    res.render('login', { title: 'Login' });
  },

  showRegister: (req, res) => {
    res.render('register', { title: 'Register' });
  },

  registerUser: async (req, res) => {
    const { name, email, password, password2 } = req.body;
    const errors = [];

    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all required fields.' });
    }
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters.' });
    }

    if (errors.length > 0) {
      req.flash('errors', errors.map((error) => error.msg));
      return res.redirect('/register');
    }

    try {
      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        req.flash('error_msg', 'Email already registered. Please log in.');
        return res.redirect('/register');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await userModel.createUser(name, email, hashedPassword, 'student');
      req.flash('success_msg', 'Registration successful. Please login.');
      res.redirect('/login');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'An error occurred while registering. Please try again.');
      res.redirect('/register');
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      req.flash('error_msg', 'Please enter both email and password.');
      return res.redirect('/login');
    }

    try {
      const user = await userModel.getUserByEmail(email);
      if (!user) {
        console.log(`Login failed: No user found with email ${email}`);
        req.flash('error_msg', 'Invalid email or password.');
        return res.redirect('/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`Login failed: Incorrect password for user ${email}`);
        req.flash('error_msg', 'Invalid email or password.');
        return res.redirect('/login');
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      if (user.role === 'admin') return res.redirect('/admin/dashboard');
      if (user.role === 'worker') return res.redirect('/worker/dashboard');
      return res.redirect('/student/dashboard');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to login at this time.');
      res.redirect('/login');
    }
  },

  logoutUser: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect('/login');
    });
  }
};
