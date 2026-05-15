const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

router.use(ensureAuthenticated, ensureRole('admin'));
router.get('/dashboard', adminController.dashboard);
router.get('/manage-complaints', adminController.manageComplaints);
router.get('/manage-workers', adminController.manageWorkers);
router.post('/add-worker', adminController.addWorker);
router.get('/assign-workers/:complaintId', adminController.assignWorkerForm);
router.get('/edit-worker/:id', adminController.editWorkerForm); // New route for edit form
router.post('/edit-worker/:id', adminController.updateWorker); // New route for update submission
router.post('/assign-worker', adminController.assignWorker);
router.post('/update-status/:complaintId', adminController.updateComplaintStatus);
router.post('/delete-complaint/:id', adminController.deleteComplaint);

module.exports = router;
