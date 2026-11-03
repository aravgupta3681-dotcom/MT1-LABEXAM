import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed' }
];

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

const sendHTML = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method } = req;
  const url = req.url.split('?')[0];

  if (url === '/' && method === 'GET') {
    return sendHTML(res, 200, '<h1>Welcome to Employee Task Management</h1><p>Try <a href="/tasks">/tasks</a>, <a href="/about">/about</a> or <a href="/home">/home</a></p>');
  }

  if (url === '/tasks' && method === 'GET') {
    return sendJSON(res, 200, tasks);
  }

  if (url === '/about' && method === 'GET') {
    return sendHTML(res, 200,
      '<h1>About</h1><p>Employee Task Management Application built with the Node.js HTTP module. ' +
      'It lets you view and add employee tasks.</p>');
  }

  if (url === '/home' && method === 'GET') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    return fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error('File read error:', err.message);
        return sendHTML(res, 500, '<h1>500 - Unable to read the file</h1>');
      }
      sendHTML(res, 200, content);
    });
  }

  if (url === '/add-task' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON format' });
      }

      const { id, taskName, assignedTo, status } = data;
      if (id === undefined || !taskName || !assignedTo || !status) {
        return sendJSON(res, 400, { error: 'id, taskName, assignedTo and status are required' });
      }
      if (tasks.some(t => t.id === id)) {
        return sendJSON(res, 409, { error: 'Task with this id already exists' });
      }

      const newTask = { id, taskName, assignedTo, status };
      tasks.push(newTask);
      sendJSON(res, 201, { message: 'Task added successfully', task: newTask });
    });
    return;
  }

  if (['/', '/tasks', '/about', '/home', '/add-task'].includes(url)) {
    return sendJSON(res, 405, { error: 'Method not allowed' });
  }

  sendHTML(res, 404, '<h1>404 - Page Not Found</h1>');
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});