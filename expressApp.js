import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' }
];

const requiredFields = ['taskName', 'assignedTo', 'status', 'priority'];

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

app.post('/tasks', (req, res) => {
  const { id, taskName, assignedTo, status, priority } = req.body || {};

  if (id === undefined || requiredFields.some(f => !req.body[f])) {
    return res.status(400).json({ message: 'id, taskName, assignedTo, status and priority are required' });
  }
  if (tasks.some(t => t.id === Number(id))) {
    return res.status(409).json({ message: 'Task with this id already exists' });
  }

  const newTask = { id: Number(id), taskName, assignedTo, status, priority };
  tasks.push(newTask);
  res.status(201).json({ message: 'Task added successfully', task: newTask });
});

app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ message: 'Task not found' });

  const body = req.body || {};
  if (requiredFields.some(f => body[f] !== undefined && body[f] === '')) {
    return res.status(400).json({ message: 'Fields cannot be empty' });
  }

  requiredFields.forEach(f => {
    if (body[f] !== undefined) task[f] = body[f];
  });
  res.json({ message: 'Task updated successfully', task });
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Task not found' });

  const [deleted] = tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully', task: deleted });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  res.status(400).json({ message: 'Invalid request', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
