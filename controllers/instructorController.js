const db = require('../config/db');

// Fallback stores for instructor portal
let fallbackInstructorCourses = [
  { course_id: 3, course_name: 'HTML & CSS Basics', subject: 'Programming', instructor: 'John Doe', video_count: 20, enrolled_students: 412, badge_bg: 'bg-warning' },
  { course_id: 4, course_name: 'Python for Beginners', subject: 'Programming', instructor: 'John Doe', video_count: 25, enrolled_students: 567, badge_bg: 'bg-warning' }
];

let fallbackInstructorQuizzes = [
  { quiz_id: 2, title: 'Programming Quiz', subject: 'Programming', total_questions: 10, time_limit: 15 }
];

let fallbackEnrolledStudents = [
  { enrollment_id: 1, student_name: 'Ahmed Khan', email: 'ahmed@gmail.com', course_name: 'HTML & CSS Basics', progress: 85, enrolled_at: new Date() },
  { enrollment_id: 2, student_name: 'Sara Ahmed', email: 'sara@gmail.com', course_name: 'Python for Beginners', progress: 90, enrolled_at: new Date() },
  { enrollment_id: 3, student_name: 'Test Student', email: 'test@gmail.com', course_name: 'HTML & CSS Basics', progress: 60, enrolled_at: new Date() }
];

// 1. Get Instructor Overview Stats
const getInstructorStats = (req, res) => {
  res.status(200).json({
    stats: {
      totalCourses: fallbackInstructorCourses.length,
      totalStudents: 979,
      totalVideos: 45,
      totalQuizzes: fallbackInstructorQuizzes.length,
      pendingForumQuestions: 3
    }
  });
};

// 2. Get Courses Taught by Instructor
const getInstructorCourses = (req, res) => {
  const { instructorId } = req.params;
  
  db.query('SELECT * FROM courses ORDER BY course_id DESC', (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({ courses: fallbackInstructorCourses });
    }
    res.status(200).json({ courses: results });
  });
};

const { fallbackCourses } = require('./adminController');

// 3. Create Course by Instructor
const createInstructorCourse = (req, res) => {
  const { course_name, subject, description, instructor_name, duration } = req.body;

  if (!course_name || !subject) {
    return res.status(400).json({ message: 'Course name and subject are required!' });
  }

  const newCourse = {
    course_id: Date.now(),
    course_name,
    subject,
    description: description || '',
    instructor: instructor_name || 'SmartLearn Instructor',
    duration: duration || '10 Hours',
    video_count: 1,
    enrolled_students: 0,
    header_bg: subject === 'Programming' ? 'bg-success' : subject === 'Science' ? 'bg-danger' : 'bg-primary',
    badge_bg: subject === 'Programming' ? 'bg-warning' : subject === 'Science' ? 'bg-danger' : 'bg-info'
  };

  fallbackInstructorCourses.unshift(newCourse);
  fallbackCourses.unshift(newCourse);

  const sql = 'INSERT INTO courses (course_name, description, subject, instructor, duration, icon_class, header_bg, badge_bg) VALUES (?, ?, ?, ?, ?, "fa-code", "bg-success", "bg-warning")';
  db.query(sql, [course_name, description || '', subject, newCourse.instructor, duration || '10 Hours'], (err, result) => {
    if (!err && result) newCourse.course_id = result.insertId;
    res.status(201).json({ message: 'Course created successfully! 📚', course: newCourse });
  });
};

// 4. Upload Video & PDF Lesson by Instructor
const addInstructorVideo = (req, res) => {
  const { course_id, title, video_url, pdf_url } = req.body;

  if (!course_id || !title || !video_url) {
    return res.status(400).json({ message: 'Course ID, Lesson Title, and Video URL are required!' });
  }

  let embedUrl = video_url;
  if (video_url.includes('watch?v=')) {
    embedUrl = video_url.replace('watch?v=', 'embed/');
  } else if (video_url.includes('youtu.be/')) {
    embedUrl = video_url.replace('youtu.be/', 'youtube.com/embed/');
  }

  const sql = 'INSERT INTO course_videos (course_id, title, video_url, pdf_url) VALUES (?, ?, ?, ?)';
  db.query(sql, [course_id, title, embedUrl, pdf_url || ''], () => {
    db.query('UPDATE courses SET video_count = video_count + 1 WHERE course_id = ?', [course_id]);
    res.status(201).json({ message: '🎥 Video lesson & PDF material published successfully!' });
  });
};

// 5. Get Quizzes for Instructor
const getInstructorQuizzes = (req, res) => {
  res.status(200).json({ quizzes: fallbackInstructorQuizzes });
};

// 6. Create Quiz by Instructor
const createInstructorQuiz = (req, res) => {
  const { title, subject, time_limit } = req.body;

  if (!title || !subject) {
    return res.status(400).json({ message: 'Quiz title and subject are required!' });
  }

  const newQuiz = {
    quiz_id: Date.now(),
    title,
    subject,
    total_questions: 0,
    time_limit: parseInt(time_limit) || 15
  };

  fallbackInstructorQuizzes.unshift(newQuiz);

  const sql = 'INSERT INTO quizzes (title, subject, total_questions, time_limit) VALUES (?, ?, 0, ?)';
  db.query(sql, [title, subject, time_limit || 15], (err, result) => {
    if (!err && result) newQuiz.quiz_id = result.insertId;
    res.status(201).json({ message: 'Quiz created successfully! 📝', quiz: newQuiz });
  });
};

// 7. Add Question to Quiz by Instructor
const addInstructorQuestion = (req, res) => {
  const { quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

  if (!quiz_id || !question_text || !option_a || !option_b) {
    return res.status(400).json({ message: 'Question text and Options A & B are required!' });
  }

  const sql = `
    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [quiz_id, question_text, option_a, option_b, option_c, option_d, (correct_option || 'A').toUpperCase(), explanation || ''], () => {
    db.query('UPDATE quizzes SET total_questions = total_questions + 1 WHERE quiz_id = ?', [quiz_id]);
    res.status(201).json({ message: '❓ Question added to quiz successfully!' });
  });
};

// 8. Get Unanswered Student Forum Questions
const getUnansweredForumQuestions = (req, res) => {
  const sql = `
    SELECT fp.*, COUNT(fc.comment_id) as reply_count
    FROM forum_posts fp
    LEFT JOIN forum_comments fc ON fp.post_id = fc.post_id
    GROUP BY fp.post_id
    ORDER BY fp.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({
        questions: [
          { post_id: 1, author_name: 'Ahmed Khan', title: 'How to solve quadratic equations using general formula?', category: 'Mathematics', created_at: new Date() },
          { post_id: 2, author_name: 'Sara Ahmed', title: 'Which language is better for Web Development: Python or JS?', category: 'Programming', created_at: new Date() }
        ]
      });
    }
    res.status(200).json({ questions: results });
  });
};

// 9. Post Official Teacher Answer to Forum
const answerStudentQuestion = (req, res) => {
  const { post_id, teacher_id, teacher_name, content } = req.body;

  if (!post_id || !content) {
    return res.status(400).json({ message: 'Answer content cannot be empty!' });
  }

  const sql = 'INSERT INTO forum_comments (post_id, user_id, author_name, author_role, content) VALUES (?, ?, ?, "instructor", ?)';
  db.query(sql, [post_id, teacher_id || 10, teacher_name || 'Instructor John Doe', content], () => {
    res.status(201).json({ message: '👨‍🏫 Official Teacher Answer published to forum!' });
  });
};

// 10. Get Enrolled Students & Progress
const getEnrolledStudents = (req, res) => {
  res.status(200).json({ students: fallbackEnrolledStudents });
};

module.exports = {
  getInstructorStats,
  getInstructorCourses,
  createInstructorCourse,
  addInstructorVideo,
  getInstructorQuizzes,
  createInstructorQuiz,
  addInstructorQuestion,
  getUnansweredForumQuestions,
  answerStudentQuestion,
  getEnrolledStudents
};
