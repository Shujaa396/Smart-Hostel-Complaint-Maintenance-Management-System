const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

router.use(ensureAuthenticated, ensureRole('student'));
router.get('/dashboard', studentController.dashboard);
router.get('/create-complaint', studentController.showCreateComplaint);
router.post('/create-complaint', studentController.createComplaint);
router.get('/my-complaints', studentController.myComplaints);
router.get('/edit-complaint/:id', studentController.showEditComplaint);
router.post('/update-complaint/:id', studentController.updateComplaint);
router.post('/delete-complaint/:id', studentController.deleteComplaint);

module.exports = router;
