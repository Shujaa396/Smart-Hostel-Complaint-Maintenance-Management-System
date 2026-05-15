const complaintModel = require('../models/complaintModel');

const categories = ['Electricity', 'Water', 'Internet', 'Furniture', 'Cleaning', 'Other'];
const priorities = ['Low', 'Medium', 'High'];
const statuses = ['All', 'Pending', 'Assigned', 'In Progress', 'Completed'];

module.exports = {
  dashboard: async (req, res) => {
    const studentId = req.session.user.id;
    try {
      const complaints = await complaintModel.getComplaintsByStudent(studentId);
      const pending = complaints.filter((c) => c.status === 'Pending').length;
      const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
      const completed = complaints.filter((c) => c.status === 'Completed').length;
      res.render('student/dashboard', {
        title: 'Student Dashboard',
        complaints,
        pending,
        inProgress,
        completed
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load dashboard.');
      res.redirect('/login');
    }
  },

  showCreateComplaint: (req, res) => {
    res.render('student/create-complaint', {
      title: 'Create Complaint',
      categories,
      priorities
    });
  },

  createComplaint: async (req, res) => {
    const { title, category, description, room_number, priority } = req.body;
    const errors = [];

    if (!title || !category || !description || !room_number || !priority) {
      errors.push('All fields are required.');
    }
    if (errors.length) {
      req.flash('errors', errors);
      return res.redirect('/student/create-complaint');
    }

    try {
      await complaintModel.createComplaint(req.session.user.id, title, category, description, room_number, priority);
      req.flash('success_msg', 'Complaint submitted successfully.');
      res.redirect('/student/my-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to create complaint.');
      res.redirect('/student/create-complaint');
    }
  },

  myComplaints: async (req, res) => {
    const studentId = req.session.user.id;
    const { search, status } = req.query;
    try {
      const complaints = await complaintModel.getComplaintsByStudent(studentId, search, status);
      res.render('student/my-complaints', {
        title: 'My Complaints',
        complaints,
        search: search || '',
        status: status || 'All',
        statuses
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load your complaints.');
      res.redirect('/student/dashboard');
    }
  },

  showEditComplaint: async (req, res) => {
    try {
      const complaint = await complaintModel.getComplaintById(req.params.id);
      if (!complaint || complaint.student_id !== req.session.user.id) {
        req.flash('error_msg', 'Complaint not found or unauthorized.');
        return res.redirect('/student/my-complaints');
      }
      res.render('student/edit-complaint', {
        title: 'Edit Complaint',
        complaint,
        categories,
        priorities
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load complaint details.');
      res.redirect('/student/my-complaints');
    }
  },

  updateComplaint: async (req, res) => {
    const { title, category, description, room_number, priority } = req.body;
    try {
      const complaint = await complaintModel.getComplaintById(req.params.id);
      if (!complaint || complaint.student_id !== req.session.user.id) {
        req.flash('error_msg', 'Complaint not found or unauthorized.');
        return res.redirect('/student/my-complaints');
      }
      await complaintModel.updateComplaint(req.params.id, title, category, description, room_number, priority);
      req.flash('success_msg', 'Complaint updated successfully.');
      res.redirect('/student/my-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to update complaint.');
      res.redirect(`/student/edit-complaint/${req.params.id}`);
    }
  },

  deleteComplaint: async (req, res) => {
    try {
      const complaint = await complaintModel.getComplaintById(req.params.id);
      if (!complaint || complaint.student_id !== req.session.user.id) {
        req.flash('error_msg', 'Complaint not found or unauthorized.');
        return res.redirect('/student/my-complaints');
      }
      await complaintModel.deleteComplaint(req.params.id);
      req.flash('success_msg', 'Complaint deleted successfully.');
      res.redirect('/student/my-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to delete complaint.');
      res.redirect('/student/my-complaints');
    }
  }
};
