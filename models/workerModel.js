const pool = require('../config/db');

module.exports = {
  addWorker: async (userId, department, phone) => {
    const sql = 'INSERT INTO workers (user_id, department, phone) VALUES (?, ?, ?)';
    const [result] = await pool.execute(sql, [userId, department, phone]);
    return result.insertId;
  },

  getWorkers: async () => {
    const sql = `SELECT w.id, w.department, w.phone, u.name, u.email
      FROM workers w
      INNER JOIN users u ON w.user_id = u.id
      ORDER BY w.id DESC`;
    const [rows] = await pool.execute(sql);
    return rows;
  },

  getWorkerById: async (id) => {
    const sql = 'SELECT * FROM workers WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  },

  getWorkerByUserId: async (userId) => {
    const sql = 'SELECT * FROM workers WHERE user_id = ?';
    const [rows] = await pool.execute(sql, [userId]);
    return rows[0];
  },

  getWorkerCount: async () => {
    const sql = 'SELECT COUNT(*) AS count FROM workers';
    const [rows] = await pool.execute(sql);
    return rows[0].count;
  },

  getWorkerDetailsById: async (id) => {
    const sql = `SELECT w.id, w.user_id, w.department, w.phone, u.name, u.email
      FROM workers w
      INNER JOIN users u ON w.user_id = u.id
      WHERE w.id = ?`;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  },

  updateWorker: async (id, department, phone) => {
    const sql = 'UPDATE workers SET department = ?, phone = ? WHERE id = ?';
    await pool.execute(sql, [department, phone, id]);
  }
};
