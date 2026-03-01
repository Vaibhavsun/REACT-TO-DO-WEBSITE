import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();

// SQLite
const database = new sqlite3.Database("tasks.db");



// Middleware
app.use(cors());
app.use(express.json());

// Create table
database.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    date TEXT,
    isCompleted BOOLEAN
  )
`);

// Routes
app.post("/tasks", (req, res) => {
  const { description, date, isCompleted } = req.body;

  const smt = database.prepare(
    "INSERT INTO tasks (description, date, isCompleted) VALUES (?, ?, ?)"
  );

  smt.run(description, date, isCompleted, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({
      message: "Task added successfully",
      id: this.lastID,
    });
  });

  smt.finalize();
});

app.get("/tasks", (req, res) => {
  database.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get("/upcoming_tasks", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  database.all(
    "SELECT * FROM tasks WHERE date > ?",
    [today],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;

  database.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  });
});

app.patch("/tasks/:id", (req, res) => {
  const id = req.params.id;
  const { isCompleted } = req.body;

  database.run(
    "UPDATE tasks SET isCompleted = ? WHERE id = ?",
    [isCompleted, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json({ message: "Task updated successfully" });
    }
  );
});

// Correct port for local + Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});