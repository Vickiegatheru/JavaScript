const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

const db = new sqlite3.Database(
  path.join(__dirname, 'project_management.db'),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => err && console.error('Database error:', err.message)
);

app.use(express.json(), cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(`CREATE TABLE IF NOT EXISTS columns (id TEXT PRIMARY KEY, name TEXT NOT NULL, position INTEGER NOT NULL)`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, 
      column_id TEXT NOT NULL, position INTEGER NOT NULL, 
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      FOREIGN KEY (column_id) REFERENCES columns(id)
    )`);

  const stmt = db.prepare('INSERT OR IGNORE INTO columns VALUES (?, ?, ?)');
  [['todo', 'To Do', 1], ['in-progress', 'In Progress', 2], ['blocked', 'Blocked', 3], ['done', 'Done', 4]].forEach(col => stmt.run(...col));
  stmt.finalize();
});

app.get('/api/tasks', (req, res) => {
  db.all(
    `SELECT t.id, t.title, t.column_id, c.name as column_name 
     FROM tasks t JOIN columns c ON t.column_id = c.id 
     ORDER BY t.position`,
    (err, rows) => (err ? res.status(500).json({ error: 'Failed to fetch tasks' }) : res.json(rows))
  );
});

app.post('/api/tasks', (req, res) => {
  const { title, column_id = 'todo' } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Invalid task title' });

  db.get(
    'SELECT COALESCE(MAX(position), 0) + 1 as nextPos FROM tasks WHERE column_id = ?',
    [column_id],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to create task' });

      db.run(
        'INSERT INTO tasks (title, column_id, position) VALUES (?, ?, ?)',
        [title, column_id, row.nextPos],
        function (err) {
          err
            ? res.status(500).json({ error: 'Failed to create task' })
            : res.status(201).json({ id: this.lastID, title, column_id, position: row.nextPos });
        }
      );
    }
  );
});

app.put('/api/tasks/:id/move', (req, res) => {
  const { id } = req.params, { newColumnId } = req.body;
  if (!['todo', 'in-progress', 'blocked', 'done'].includes(newColumnId))
    return res.status(400).json({ error: 'Invalid column' });

  db.get(
    'SELECT COALESCE(MAX(position), 0) + 1 as nextPos FROM tasks WHERE column_id = ?',
    [newColumnId],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to move task' });

      db.run(
        'UPDATE tasks SET column_id = ?, position = ? WHERE id = ?',
        [newColumnId, row.nextPos, id],
        function (err) {
          this.changes
            ? res.json({ success: true })
            : res.status(404).json({ error: 'Task not found' });
        }
      );
    }
  );
});

app.delete('/api/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function (err) {
    this.changes
      ? res.json({ success: true })
      : res.status(404).json({ error: 'Task not found' });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
