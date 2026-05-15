const pool = require('../config/db');

module.exports = {
  assignWorker: async (complaintId, workerId) => {
    const sql = 'INSERT INTO assignments (complaint_id, worker_id, assigned_at) VALUES (?, ?, NOW())';
    await pool.execute(sql, [complaintId, workerId]);
  },

  getAssignmentByComplaintId: async (complaintId) => {
    const sql = 'SELECT * FROM assignments WHERE complaint_id = ? ORDER BY assigned_at DESC LIMIT 1';
    const [rows] = await pool.execute(sql, [complaintId]);
    return rows[0];
  },

  getAssignmentsByWorker: async (workerId) => {
    const sql = `SELECT a.id AS assignment_id, c.*, u.name AS student_name, u.email AS student_email, a.assigned_at, a.completion_date
      FROM assignments a
      INNER JOIN complaints c ON a.complaint_id = c.id
      INNER JOIN users u ON c.student_id = u.id
      WHERE a.worker_id = ?
      ORDER BY a.assigned_at DESC`;
    const [rows] = await pool.execute(sql, [workerId]);
    return rows;
  },

  completeAssignment: async (assignmentId) => {
    const sql = 'UPDATE assignments SET completion_date = NOW() WHERE id = ?';
    await pool.execute(sql, [assignmentId]);
  }
};
