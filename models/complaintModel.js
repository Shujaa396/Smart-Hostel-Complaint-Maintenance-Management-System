const pool = require('../config/db');

module.exports = {
  createComplaint: async (studentId, title, category, description, roomNumber, priority) => {
    const sql = `INSERT INTO complaints
      (student_id, title, category, description, room_number, status, priority)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?)`;
    const [result] = await pool.execute(sql, [studentId, title, category, description, roomNumber, priority]);
    return result.insertId;
  },

  getComplaintsByStudent: async (studentId, search, status) => {
    let sql = 'SELECT * FROM complaints WHERE student_id = ?';
    const params = [studentId];

    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR category LIKE ? OR description LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  getComplaintById: async (id) => {
    const sql = 'SELECT * FROM complaints WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  },

  updateComplaint: async (id, title, category, description, roomNumber, priority) => {
    const sql = `UPDATE complaints SET title = ?, category = ?, description = ?, room_number = ?, priority = ? WHERE id = ?`;
    await pool.execute(sql, [title, category, description, roomNumber, priority, id]);
  },

  deleteComplaint: async (id) => {
    const sql = 'DELETE FROM complaints WHERE id = ?';
    await pool.execute(sql, [id]);
  },

  getAllComplaints: async (search, status) => {
    let sql = `SELECT c.*, u.name AS student_name, w.user_id AS worker_user_id
      FROM complaints c
      LEFT JOIN assignments a ON c.id = a.complaint_id
      LEFT JOIN workers w ON a.worker_id = w.id
      LEFT JOIN users u ON c.student_id = u.id`;
    const params = [];

    sql += ' WHERE 1=1';
    if (status && status !== 'All') {
      sql += ' AND c.status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (c.title LIKE ? OR c.category LIKE ? OR c.description LIKE ? OR u.name LIKE ? OR c.room_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }
    sql += ' ORDER BY c.created_at DESC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  updateComplaintStatus: async (id, status) => {
    const sql = 'UPDATE complaints SET status = ? WHERE id = ?';
    await pool.execute(sql, [status, id]);
  },

  getStatistics: async () => {
    const sql = `SELECT
      COUNT(*) AS total,
      SUM(status = 'Pending') AS pending,
      SUM(status = 'Completed') AS completed
      FROM complaints`;
    const [rows] = await pool.execute(sql);
    return rows[0];
  }
};
