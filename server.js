// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db', 'climate.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  }
  console.log('Connected to SQLite DB');
});

// Ensure table exists
const initSQL = `
CREATE TABLE IF NOT EXISTS climate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  location TEXT,
  temperature REAL,
  co2 REAL,
  description TEXT
);
`;
db.exec(initSQL);

// REST API endpoints
app.get('/api/records', (req, res) => {
  db.all('SELECT * FROM climate ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

app.get('/api/records/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM climate WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({error: err.message});
    if (!row) return res.status(404).json({error: 'Not found'});
    res.json(row);
  });
});

app.post('/api/records', (req, res) => {
  const {date, location, temperature, co2, description} = req.body;
  const stmt = db.prepare(`INSERT INTO climate (date, location, temperature, co2, description) VALUES (?,?,?,?,?)`);
  stmt.run([date, location, temperature, co2, description], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({id: this.lastID});
  });
  stmt.finalize();
});

app.get('/api/stats', (req, res) => {
  const sql = `SELECT AVG(temperature) AS avgTemp, AVG(co2) AS avgCo2 FROM climate`;
  db.get(sql, [], (err, row) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(row);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
