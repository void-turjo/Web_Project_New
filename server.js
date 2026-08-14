const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

// Global crash protection handlers to keep server running 24/7 without stopping
process.on('uncaughtException', (err) => {
  console.log('🛡️ Prevented server crash (Uncaught Exception):', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.log('🛡️ Prevented server crash (Unhandled Rejection):', reason);
});

const db = require('./config/db');

const app = express();

const fs = require('fs');

// Custom PDF document route handler
app.get('/uploads/pdfs/:filename.pdf', (req, res) => {
  const baseName = req.params.filename;
  const htmlPath = path.join(__dirname, 'public', 'uploads', 'pdfs', `${baseName}.html`);
  if (fs.existsSync(htmlPath)) {
    res.setHeader('Content-Type', 'text/html');
    return res.sendFile(htmlPath);
  }
  res.redirect('/notes.html');
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quiz', quizRoutes);

const notesRoutes = require('./routes/notesRoutes');
app.use('/api/notes', notesRoutes);

const forumRoutes = require('./routes/forumRoutes');
app.use('/api/forum', forumRoutes);

const certificateRoutes = require('./routes/certificateRoutes');
app.use('/api/certificates', certificateRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const instructorRoutes = require('./routes/instructorRoutes');
app.use('/api/instructor', instructorRoutes);

// HTML Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});
app.get('/courses.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'courses.html'));
});
app.get('/quiz.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'quiz.html'));
});
app.get('/notes.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'notes.html'));
});
app.get('/ai-assistant.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ai-assistant.html'));
});
app.get('/forum.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forum.html'));
});
app.get('/certificates.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'certificates.html'));
});
app.get('/admin/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});
app.get('/instructor/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'instructor', 'dashboard.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ SmartLearn server started on port ${PORT}`);
  console.log(`👉 Open browser and go to: http://localhost:${PORT}`);
});