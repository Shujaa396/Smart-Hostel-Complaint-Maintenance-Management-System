module.exports = {
  showHome: (req, res) => {
    res.render('index', { title: 'Smart Hostel Management' });
  }
};
