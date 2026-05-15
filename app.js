const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const studentRouter = require('./routes/student');
const adminRouter = require('./routes/admin');
const workerRouter = require('./routes/worker');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: 'smartHostelSecretKey2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 3 }
}));

app.use(flash());

app.use((req, res, next) => {
  const successMessages = req.flash('success_msg');
  const errorMessages = req.flash('error_msg');
  res.locals.success_msg = successMessages.length ? successMessages[0] : null;
  res.locals.error_msg = errorMessages.length ? errorMessages[0] : null;
  res.locals.errors = req.flash('errors');
  res.locals.user = req.session.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/student', studentRouter);
app.use('/admin', adminRouter);
app.use('/worker', workerRouter);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Smart Hostel app running on http://localhost:${PORT}`);
});
