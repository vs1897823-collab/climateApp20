const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, '..', 'db', 'climate.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err.message);
    process.exit(1);
  }
  db.get('SELECT COUNT(*) as cnt FROM measurements', (err, row) => {
    if (err) {
      console.error('Query error:', err.message);
    } else {
      console.log('Row count:', row.cnt);
    }
    db.all('SELECT * FROM measurements LIMIT 5', (err, rows) => {
      if (err) {
        console.error('Fetch error:', err.message);
      } else {
        console.log('First rows:', rows);
      }
      db.close();
    });
  });
});
