// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool - update with your credentials
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_db_name',
  waitForConnections: true,
  connectionLimit: 10
});

// Demo login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Implement real auth in production. This is demo-only.
  if(email === 'admin@example.com' && password === 'admin123') {
    return res.json({ token: 'demo-token-1' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

/* Students CRUD */

// GET all
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC LIMIT ?', [100]);
    res.json(rows);
  } catch (err) { res.status(500).json({error: err.message}); }
});

// POST create
app.post('/api/students', async (req, res) => {
  try {
    const { name, email, course } = req.body;
    const joined = new Date();
    const [r] = await pool.query('INSERT INTO students (name,email,course,joined) VALUES (?,?,?,?)',[name,email,course,joined]);
    const [row] = await pool.query('SELECT * FROM students WHERE id=?',[r.insertId]);
    res.json(row[0]);
  } catch (err){ res.status(500).json({error: err.message}); }
});

// PUT update
app.put('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, course } = req.body;
    await pool.query('UPDATE students SET name=?, email=?, course=? WHERE id=?',[name,email,course,id]);
    const [row] = await pool.query('SELECT * FROM students WHERE id=?',[id]);
    res.json(row[0]);
  } catch(e){ res.status(500).json({error: e.message}); }
});

// DELETE
app.delete('/api/students/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query('DELETE FROM students WHERE id=?',[id]);
    res.json({ success:true });
  } catch(e){ res.status(500).json({error: e.message}); }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('API listening on', port));

