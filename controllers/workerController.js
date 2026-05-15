const workerModel = require('../models/workerModel');
const assignmentModel = require('../models/assignmentModel');
const complaintModel = require('../models/complaintModel');

module.exports = {
  dashboard: async (req, res) => {
    try {
      const worker = await workerModel.getWorkerByUserId(req.session.user.id);
      if (!worker) {
        req.flash('error_msg', 'Worker profile not found.');
        return res.redirect('/login');
      }
      const assignments = await assignmentModel.getAssignmentsByWorker(worker.id);
      const assigned = assignments.filter((item) => item.status === 'Assigned').length;
      const inProgress = assignments.filter((item) => item.status === 'In Progress').length;
      const completed = assignments.filter((item) => item.status === 'Completed').length;
      res.render('worker/dashboard', {
        title: 'Worker Dashboard',
        assigned,
        inProgress,
        completed,
        assignments
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load worker dashboard.');
      res.redirect('/login');
    }
  },

  assignedComplaints: async (req, res) => {
    try {
      const worker = await workerModel.getWorkerByUserId(req.session.user.id);
      if (!worker) {
        req.flash('error_msg', 'Worker profile not found.');
        return res.redirect('/login');
      }
      const assignments = await assignmentModel.getAssignmentsByWorker(worker.id);
      res.render('worker/assigned-complaints', {
        title: 'Assigned Complaints',
        assignments
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to load assigned complaints.');
      res.redirect('/worker/dashboard');
    }
  },

  updateStatus: async (req, res) => {
    const { status, assignment_id } = req.body;
    if (!status) {
      req.flash('error_msg', 'Please select a status.');
      return res.redirect('/worker/assigned-complaints');
    }
    try {
      const assignments = await assignmentModel.getAssignmentsByWorker((await workerModel.getWorkerByUserId(req.session.user.id)).id);
      const assignment = assignments.find((item) => item.assignment_id === parseInt(assignment_id, 10));
      if (!assignment) {
        req.flash('error_msg', 'Assignment not found.');
        return res.redirect('/worker/assigned-complaints');
      }
      await complaintModel.updateComplaintStatus(assignment.complaint_id, status);
      if (status === 'Completed') {
        await assignmentModel.completeAssignment(assignment_id);
      }
      req.flash('success_msg', 'Complaint status updated.');
      res.redirect('/worker/assigned-complaints');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Unable to update complaint status.');
      res.redirect('/worker/assigned-complaints');
    }
  }
};
