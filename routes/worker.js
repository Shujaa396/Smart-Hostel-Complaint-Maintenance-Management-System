const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

router.use(ensureAuthenticated, ensureRole('worker'));
router.get('/dashboard', workerController.dashboard);
router.get('/assigned-complaints', workerController.assignedComplaints);
router.post('/update-status', workerController.updateStatus);

module.exports = router;
