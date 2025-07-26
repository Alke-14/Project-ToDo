import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Task, Subtask } from './types';

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(cors());
app.use(express.json());

// Helper: Read tasks from JSON
const readTasks = (): Task[] => {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
};

// Helper: Write tasks to JSON
const writeTasks = (tasks: Task[]) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};

// GET /api/tasks
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const tasks = readTasks();
  const newTask: Task = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
    title: req.body.title,
    completed: false,
    subtasks: []
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === +req.params.id);
  if (!task) return res.status(404).send('Task not found');

  task.title = req.body.title;
  writeTasks(tasks);
  res.json(task);
});

app.put('/api/tasks/:id/complete', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === +req.params.id);
  if (!task) return res.status(404).send('Task not found');

  task.completed = true;
  writeTasks(tasks);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  let tasks = readTasks();
  tasks = tasks.filter(t => t.id !== +req.params.id);
  writeTasks(tasks);
  res.sendStatus(204);
});

app.post('/api/tasks/:id/subtasks', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === +req.params.id);
  if (!task) return res.status(404).send('Task not found');

  const newSubtask: Subtask = {
    id: task.subtasks.length ? task.subtasks[task.subtasks.length - 1].id + 1 : 1,
    title: req.body.title,
    completed: false,
  };

  task.subtasks.push(newSubtask);
  writeTasks(tasks);
  res.status(201).json(newSubtask);
});

app.put('/api/tasks/:id/subtasks/:subId', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === +req.params.id);
  if (!task) return res.status(404).send('Task not found');

  const subtask = task.subtasks.find(s => s.id === +req.params.subId);
  if (!subtask) return res.status(404).send('Subtask not found');

  subtask.title = req.body.title;
  writeTasks(tasks);
  res.json(subtask);
});

app.put('/api/tasks/:id/subtasks/:subId/complete', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === +req.params.id);
  if (!task) return res.status(404).send('Task not found');

  const subtask = task.subtasks.find(s => s.id === +req.params.subId);
  if (!subtask) return res.status(404).send('Subtask not found');

  subtask.completed = true;
  writeTasks(tasks);
  res.json(subtask);
});

app.delete('/api/tasks/:id/subtasks/:subId', (req, res) => {
  const tasks = readTasks();
  const task = tasks.find(t => t.id === +req.params.id);
  if (!task) return res.status(404).send('Task not found');

  task.subtasks = task.subtasks.filter(s => s.id !== +req.params.subId);
  writeTasks(tasks);
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});