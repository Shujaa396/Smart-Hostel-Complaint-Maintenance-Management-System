const pool = require('../config/db');

module.exports = {
  createUser: async (name, email, password, role) => {
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(sql, [name, email, password, role]);
    return result.insertId;
  },

  getUserByEmail: async (email) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(sql, [email]);
    return rows[0];
  },

  getUserById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    return rows[0];
  },

  updateUser: async (id, name, email, role) => {
    const sql = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
    await pool.execute(sql, [name, email, role, id]);
  }
};
