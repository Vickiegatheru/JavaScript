const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./project_management.db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// API endpoints
app.get('/api/tasks', (req, res) => {
  db.all(`
    SELECT t.id, t.title, t.column_id, c.name as column_name 
    FROM tasks t JOIN columns c ON t.column_id = c.id 
    ORDER BY t.position
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/tasks', (req, res) => {
  const { title, column_id = 'todo' } = req.body;
  db.get(
    'SELECT COALESCE(MAX(position), 0) + 1 as nextPos FROM tasks WHERE column_id = ?',
    [column_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.run(
        'INSERT INTO tasks (title, column_id, position) VALUES (?, ?, ?)',
        [title, column_id, row.nextPos],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: this.lastID });
        }
      );
    }
  );
});

app.put('/api/tasks/:id/move', (req, res) => {
  const { id } = req.params;
  const { newColumnId } = req.body;
  
  db.get(
    'SELECT COALESCE(MAX(position), 0) + 1 as nextPos FROM tasks WHERE column_id = ?',
    [newColumnId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.run(
        'UPDATE tasks SET column_id = ?, position = ? WHERE id = ?',
        [newColumnId, row.nextPos, id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  );
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});