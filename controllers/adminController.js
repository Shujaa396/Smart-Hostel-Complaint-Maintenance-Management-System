const bcrypt = require('bcryptjs');
const complaintModel = require('../models/complaintModel');
const userModel = require('../models/userModel');
const workerModel = require('../models/workerModel');
const assignmentModel = require('../models/assignmentModel');

const statuses = ['Pending', 'Assigned', 'In Progress', 'Completed'];

module.exports = {
  dashboard: async (req, res) => {
    try {
      const stats = await complaintModel.getStatistics();
      const workerCount = await workerModel.getWorkerCount();
      res.render('admin/dashboard', {
        title: 'Admin Dashboard',
        stats,
        workerCount
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load admin dashboard.');
      res.redirect('/login');
    }
  },

  manageComplaints: async (req, res) => {
    const { search, status } = req.query;
    try {
      const complaints = await complaintModel.getAllComplaints(search, status);
      res.render('admin/manage-complaints', {
        title: 'Manage Complaints',
        complaints,
        search: search || '',
        status: status || 'All',
        statuses: ['All', ...statuses]
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load complaints.');
      res.redirect('/admin/dashboard');
    }
  },

  manageWorkers: async (req, res) => {
    try {
      const workers = await workerModel.getWorkers();
      res.render('admin/manage-workers', {
        title: 'Manage Workers',
        workers
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load worker list.');
      res.redirect('/admin/dashboard');
    }
  },

  addWorker: async (req, res) => {
    const { name, email, department, phone } = req.body;
    const errors = [];
    const defaultPassword = process.env.DEFAULT_WORKER_PASSWORD || 'Worker@123';

    if (!name || !email || !department || !phone) {
      errors.push('All fields are required.');
    }
    if (errors.length) {
      req.flash('errors', errors);
      return res.redirect('/admin/manage-workers');
    }

    try {
      const existingUser = await userModel.getUserByEmail(email);
      if (existingUser) {
        req.flash('error_msg', 'Email already exists for another account.');
        return res.redirect('/admin/manage-workers');
      }
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      const userId = await userModel.createUser(name, email, hashedPassword, 'worker');
      await workerModel.addWorker(userId, department, phone);
      req.flash('success_msg', `Worker added successfully. Default password is ${defaultPassword}`);
      res.redirect('/admin/manage-workers');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to add worker.');
      res.redirect('/admin/manage-workers');
    }
  },

  // Render form to edit worker details
  editWorkerForm: async (req, res) => {
    try {
      const workerId = req.params.id;
      // getWorkerDetailsById is a conceptual function that would join users and workers tables
      const worker = await workerModel.getWorkerDetailsById(workerId); 
      if (!worker) {
        req.flash('error_msg', 'Worker not found.');
        return res.redirect('/admin/manage-workers');
      }
      res.render('admin/edit-worker', {
        title: 'Edit Worker',
        worker,
        errors: req.flash('errors') // Pass errors from previous redirect if any
      });
    } catch (error) {
      console.error('Error loading edit worker form:', error);
      req.flash('error_msg', 'Unable to load worker details for editing.');
      res.redirect('/admin/manage-workers');
    }
  },

  // Handle submission for updating worker details
  updateWorker: async (req, res) => {
    const workerId = req.params.id;
    const { name, email, department, phone } = req.body;
    const errors = [];

    if (!name || !email || !department || !phone) {
      errors.push('All fields are required.');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Please enter a valid email address.');
    }

    if (errors.length) {
      req.flash('errors', errors);
      return res.redirect(`/admin/edit-worker/${workerId}`);
    }

    try {
      const existingWorker = await workerModel.getWorkerDetailsById(workerId);
      if (!existingWorker) {
        req.flash('error_msg', 'Worker not found.');
        return res.redirect('/admin/manage-workers');
      }

      // Check if email is being changed to an existing email by another user
      if (email !== existingWorker.email) {
        const existingUserWithNewEmail = await userModel.getUserByEmail(email);
        if (existingUserWithNewEmail && existingUserWithNewEmail.id !== existingWorker.user_id) {
          req.flash('error_msg', 'Email already exists for another user.');
          return res.redirect(`/admin/edit-worker/${workerId}`);
        }
      }

      await userModel.updateUser(existingWorker.user_id, name, email, 'worker');
      await workerModel.updateWorker(workerId, department, phone);

      req.flash('success_msg', 'Worker details updated successfully.');
      res.redirect('/admin/manage-workers');
    } catch (error) {
      console.error('Error updating worker:', error);
      req.flash('error_msg', 'Unable to update worker details.');
      res.redirect(`/admin/edit-worker/${workerId}`);
    }
  },

  assignWorkerForm: async (req, res) => {
    try {
      const complaintId = req.params.complaintId;
      const complaint = await complaintModel.getComplaintById(complaintId);
      const workers = await workerModel.getWorkers();
      if (!complaint) {
        req.flash('error_msg', 'Complaint not found.');
        return res.redirect('/admin/manage-complaints');
      }
      res.render('admin/assign-workers', {
        title: 'Assign Worker',
        complaint,
        workers
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load assignment page.');
      res.redirect('/admin/manage-complaints');
    }
  },

  assignWorker: async (req, res) => {
    const { complaint_id, worker_id } = req.body;
    if (!complaint_id || !worker_id) {
      req.flash('error_msg', 'Please select a worker to assign.');
      return res.redirect(`/admin/assign-workers/${complaint_id}`);
    }
    try {
      await assignmentModel.assignWorker(complaint_id, worker_id);
      await complaintModel.updateComplaintStatus(complaint_id, 'Assigned');
      req.flash('success_msg', 'Worker assigned successfully.');
      res.redirect('/admin/manage-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to assign worker.');
      res.redirect('/admin/manage-complaints');
    }
  },

  updateComplaintStatus: async (req, res) => {
    const { status } = req.body;
    const complaintId = req.params.complaintId;
    if (!status) {
      req.flash('error_msg', 'Please select a valid status.');
      return res.redirect('/admin/manage-complaints');
    }
    try {
      await complaintModel.updateComplaintStatus(complaintId, status);
      req.flash('success_msg', 'Complaint status updated successfully.');
      res.redirect('/admin/manage-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to update status.');
      res.redirect('/admin/manage-complaints');
    }
  },

  deleteComplaint: async (req, res) => {
    try {
      await complaintModel.deleteComplaint(req.params.id);
      req.flash('success_msg', 'Complaint deleted successfully.');
      res.redirect('/admin/manage-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to delete complaint.');
      res.redirect('/admin/manage-complaints');
    }
  }
};
