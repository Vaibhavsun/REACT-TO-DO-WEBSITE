const exp = require('express');
const db = require('sqlite3');
const cors = require('cors')
const app = exp();
const database = new db.Database('tasks.db');

app.use(cors());
app.use(exp.json());

// app.get('/tasks', (req, res) => {
//   const status = req.query.status;
//   let query = 'SELECT * FROM tasks';
// }
database.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, date TEXT, isCompleted BOOLEAN)");
app.post('/tasks', (req, res) => {
    const {description,date,isCompleted} = req.body;
    smt = database.prepare("INSERT INTO tasks (description, date,isCompleted) VALUES (?, ?, ?)");
    smt.run(description, date, isCompleted, function(err) {
        if (err) {
            res.status(500).json({error: err.message});
        }
        else{
            res.status(200).json({"message":"Task added successfully", "id": this.lastID} );
        }
    });
    

});

app.get('/tasks', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    database.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json(rows);
    });
});

app.get('/upcoming_tasks', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    database.all("SELECT * FROM tasks WHERE date > ?", [today], (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json(rows);
    });
});

app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id
    console.log(id);
    database.run("DELETE FROM tasks WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        else{
            res.status(200).json({"message":"Task deleted successfully"} );
        }
})
});

app.patch('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const {isCompleted} = req.body;
    database.run("UPDATE tasks SET isCompleted = ? WHERE id = ?", [isCompleted, id], function(err) {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        else{
            res.status(200).json({"message":"Task updated successfully"} );
        }
})});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

