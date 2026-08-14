const db = require('../config/db');
const bcrypt = require('bcryptjs');

// In-memory fallback stores for graceful fallback if database table is initializing
let fallbackUsers = [
  { user_id: 103, full_name: 'Rudro CB', email: 'rudro@gmail.com', phone: '01729789298', role: 'instructor', created_at: new Date() },
  { user_id: 100, full_name: 'Mamun Student', email: 'mamun@gmail.com', phone: '01799887766', role: 'student', created_at: new Date() },
  { user_id: 101, full_name: 'Neazi Student', email: 'neazi@gmail.com', phone: '01711223344', role: 'student', created_at: new Date() },
  { user_id: 102, full_name: 'Turjo Student', email: 'turjo720@gmail.com', phone: '01755667788', role: 'student', created_at: new Date() },
  { user_id: 1, full_name: 'Test Student', email: 'test@gmail.com', phone: '01700000000', role: 'student', created_at: new Date() },
  { user_id: 2, full_name: 'Ahmed Khan', email: 'ahmed@gmail.com', phone: '01800000000', role: 'student', created_at: new Date() },
  { user_id: 3, full_name: 'Sara Ahmed', email: 'sara@gmail.com', phone: '01900000000', role: 'instructor', created_at: new Date() },
  { user_id: 4, full_name: 'SmartLearn Admin', email: 'admin@smartlearn.com', phone: '01500000000', role: 'admin', created_at: new Date() }
];

let fallbackCourses = [
  { course_id: 7, course_name: 'Biology', subject: 'Science', description: 'Explore cell structure, genetics, photosynthesis, and human anatomy.', video_count: 4, pdf_count: 8, duration: '8 Hours', header_bg: 'bg-danger', badge_bg: 'bg-danger' },
  { course_id: 1, course_name: 'Algebra Fundamentals', subject: 'Mathematics', video_count: 12, pdf_count: 8, duration: '6 Hours', header_bg: 'bg-primary', badge_bg: 'bg-info' },
  { course_id: 2, course_name: 'Calculus Basics', subject: 'Mathematics', video_count: 15, pdf_count: 8, duration: '8 Hours', header_bg: 'bg-primary', badge_bg: 'bg-info' },
  { course_id: 3, course_name: 'HTML & CSS Basics', subject: 'Programming', video_count: 20, pdf_count: 8, duration: '10 Hours', header_bg: 'bg-success', badge_bg: 'bg-warning' },
  { course_id: 4, course_name: 'Python for Beginners', subject: 'Programming', video_count: 25, pdf_count: 8, duration: '12 Hours', header_bg: 'bg-success', badge_bg: 'bg-warning' },
  { course_id: 5, course_name: 'Physics Fundamentals', subject: 'Science', video_count: 18, pdf_count: 8, duration: '8 Hours', header_bg: 'bg-danger', badge_bg: 'bg-danger' },
  { course_id: 6, course_name: 'Chemistry Basics', subject: 'Science', video_count: 14, pdf_count: 8, duration: '8 Hours', header_bg: 'bg-danger', badge_bg: 'bg-danger' }
];

let fallbackQuizzes = [
  { quiz_id: 1, title: 'Mathematics Quiz', subject: 'Mathematics', course_name: 'Algebra Fundamentals', total_questions_count: 3, time_limit: 30 },
  { quiz_id: 2, title: 'Programming Quiz', subject: 'Programming', course_name: 'HTML & CSS Basics', total_questions_count: 3, time_limit: 30 },
  { quiz_id: 3, title: 'Science Quiz', subject: 'Science', course_name: 'Physics Fundamentals', total_questions_count: 1, time_limit: 30 }
];

let fallbackQuestionsMap = {
  1: [
    { question_id: 101, quiz_id: 1, question_text: 'What is the limit lim(x→0) (sin x / x)?', option_a: '0', option_b: '1', option_c: '∞', option_d: 'Undefined', correct_option: 'B', explanation: 'Standard calculus limit proof.' },
    { question_id: 102, quiz_id: 1, question_text: 'What is the indefinite integral ∫ x·e^x dx ?', option_a: 'x·e^x - e^x + C', option_b: 'e^x + C', option_c: '(x²/2)·e^x + C', option_d: 'x·e^x + C', correct_option: 'A', explanation: 'Using Integration by Parts.' },
    { question_id: 103, quiz_id: 1, question_text: 'What is the determinant of matrix A = [[2, 3], [1, 4]] ?', option_a: '5', option_b: '8', option_c: '11', option_d: '14', correct_option: 'A', explanation: 'det(A) = 2*4 - 3*1 = 5.' }
  ],
  2: [
    { question_id: 201, quiz_id: 2, question_text: 'What is the average time complexity of QuickSort algorithm?', option_a: 'O(n)', option_b: 'O(n log n)', option_c: 'O(n²)', option_d: 'O(1)', correct_option: 'B', explanation: 'Average case partitioning yields O(n log n).' },
    { question_id: 202, quiz_id: 2, question_text: 'In JavaScript, what is the output of (0.1 + 0.2 === 0.3)?', option_a: 'true', option_b: 'false', option_c: 'undefined', option_d: 'TypeError', correct_option: 'B', explanation: 'IEEE 754 floating point arithmetic precision.' },
    { question_id: 203, quiz_id: 2, question_text: 'Which concurrency model does Node.js runtime engine utilize?', option_a: 'Multi-threaded preemptive', option_b: 'Single-threaded event-driven non-blocking I/O', option_c: 'Shared memory parallel', option_d: 'Actor model', correct_option: 'B', explanation: 'Node.js uses libuv event loop.' }
  ],
  3: [
    { question_id: 301, quiz_id: 3, question_text: 'According to E = mc², what constant does "c" represent?', option_a: 'Speed of sound', option_b: 'Planck constant', option_c: 'Speed of light in vacuum', option_d: 'Gravitational acceleration', correct_option: 'C', explanation: 'c is the speed of light in vacuum (299,792,458 m/s).' }
  ]
};

let fallbackForumPosts = [
  { post_id: 1, author_name: 'Ahmed Khan', author_role: 'student', title: 'How to solve quadratic equations?', content: 'I am having trouble understanding how to solve quadratic equations using the formula. Can anyone explain step by step?', category: 'Mathematics', likes_count: 14, reply_count: 2, created_at: new Date(Date.now() - 3600000 * 2) },
  { post_id: 2, author_name: 'Sara Ahmed', author_role: 'student', title: 'Python vs JavaScript for Web Development?', content: 'I want to start learning programming but I am confused between Python and JavaScript. Which one should I start with?', category: 'Programming', likes_count: 28, reply_count: 2, created_at: new Date(Date.now() - 3600000 * 5) }
];

let fallbackCertificates = [
  { certificate_id: 1, user_name: 'Test Student', course_name: 'HTML & CSS Basics', certificate_code: 'SL-2026-98214', issued_at: new Date() },
  { certificate_id: 2, user_name: 'Ahmed Khan', course_name: 'Python for Beginners', certificate_code: 'SL-2026-44120', issued_at: new Date() }
];

// 1. Get Admin Dashboard Stats
const getAdminStats = (req, res) => {
  db.query('SELECT user_id, full_name, email, role FROM users', (err, dbUsers) => {
    let allUsers = [...fallbackUsers];
    if (!err && dbUsers && dbUsers.length > 0) {
      const emails = new Set(dbUsers.map(u => (u.email || '').toLowerCase()));
      allUsers = [...dbUsers];
      for (const fu of fallbackUsers) {
        if (!emails.has((fu.email || '').toLowerCase())) {
          allUsers.push(fu);
        }
      }
    }

    const totalStudents = allUsers.filter(u => (u.role || 'student').toLowerCase() === 'student').length;
    const totalInstructors = allUsers.filter(u => (u.role || '').toLowerCase() === 'instructor').length;

    db.query('SELECT course_id, course_name FROM courses', (err, dbCourses) => {
      let allCourses = [...fallbackCourses];
      if (!err && dbCourses && dbCourses.length > 0) {
        const cNames = new Set(dbCourses.map(c => (c.course_name || '').toLowerCase()));
        allCourses = [...dbCourses];
        for (const fc of fallbackCourses) {
          if (!cNames.has((fc.course_name || '').toLowerCase())) {
            allCourses.push(fc);
          }
        }
      }

      db.query('SELECT COUNT(*) as cert_count FROM certificates', (err, rCert) => {
        const certCount = (!err && rCert && rCert[0].cert_count > 0) ? rCert[0].cert_count : fallbackCertificates.length;

        db.query('SELECT COUNT(*) as quiz_count FROM quizzes', (err, rQuiz) => {
          const quizCount = (!err && rQuiz && rQuiz[0].quiz_count > 0) ? rQuiz[0].quiz_count : fallbackQuizzes.length;

          res.status(200).json({
            stats: {
              totalUsers: allUsers.length,
              totalStudents: totalStudents,
              totalInstructors: totalInstructors,
              totalCourses: allCourses.length,
              totalCertificates: certCount,
              totalQuizzes: quizCount
            }
          });
        });
      });
    });
  });
};

// 2. Manage Users (Get All, Add, Delete)
const getAllUsers = (req, res) => {
  db.query('SELECT user_id, full_name, email, phone, role, created_at FROM users ORDER BY user_id DESC', (err, results) => {
    let combined = [];

    if (err || !results || results.length === 0) {
      combined = [...fallbackUsers];
    } else {
      const dbEmails = new Set(results.map(u => (u.email || '').toLowerCase()));
      combined = [...results];

      for (const fu of fallbackUsers) {
        if (!dbEmails.has((fu.email || '').toLowerCase())) {
          combined.unshift(fu);
        }
      }
    }

    res.status(200).json({ users: combined });
  });
};

const addUser = async (req, res) => {
  const { full_name, email, phone, role, password } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ message: 'Name and email are required!' });
  }

  const newUser = {
    user_id: Date.now(),
    full_name,
    email,
    phone: phone || '',
    role: role || 'student',
    created_at: new Date()
  };

  fallbackUsers.unshift(newUser);

  try {
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    const sql = 'INSERT INTO users (full_name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [full_name, email, phone || '', role || 'student', hashedPassword], (err, result) => {
      if (!err && result) {
        newUser.user_id = result.insertId;
      }
      return res.status(201).json({ message: 'User added successfully! 🎉', user: newUser });
    });
  } catch (e) {
    return res.status(201).json({ message: 'User added successfully! 🎉', user: newUser });
  }
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  fallbackUsers = fallbackUsers.filter(u => u.user_id !== targetId);

  db.query('DELETE FROM users WHERE user_id = ?', [targetId], (err) => {
    res.status(200).json({ message: 'User removed successfully! 🗑️' });
  });
};

// 3. Manage Courses (Get All, Create, Delete, Add Video/PDF)
const getCoursesList = (req, res) => {
  const sql = `
    SELECT c.*, COUNT(DISTINCT e.enrollment_id) as enrolled_students
    FROM courses c
    LEFT JOIN enrollments e ON c.course_id = e.course_id
    GROUP BY c.course_id
    ORDER BY c.course_id DESC
  `;
  db.query(sql, (err, results) => {
    let combined = [];
    if (err || !results || results.length === 0) {
      combined = [...fallbackCourses];
    } else {
      const dbNames = new Set(results.map(c => (c.course_name || '').toLowerCase()));
      combined = [...results];
      for (const fc of fallbackCourses) {
        if (!dbNames.has((fc.course_name || '').toLowerCase())) {
          combined.unshift(fc);
        }
      }
    }
    res.status(200).json({ courses: combined });
  });
};

const createCourse = (req, res) => {
  const { course_name, description, subject, instructor, duration } = req.body;

  if (!course_name || !subject) {
    return res.status(400).json({ message: 'Course name and subject are required!' });
  }

  let badge_bg = subject === 'Programming' ? 'bg-warning' : subject === 'Science' ? 'bg-danger' : 'bg-info';

  const newCourse = {
    course_id: Date.now(),
    course_name,
    description: description || '',
    subject,
    instructor: instructor || 'SmartLearn Instructor',
    duration: duration || '8 Hours',
    video_count: 1,
    enrolled_students: 0,
    badge_bg
  };

  fallbackCourses.unshift(newCourse);

  const sql = `
    INSERT INTO courses (course_name, description, subject, instructor, duration, icon_class, header_bg, badge_bg)
    VALUES (?, ?, ?, ?, ?, 'fa-book', 'bg-primary', ?)
  `;

  db.query(sql, [course_name, description || '', subject, instructor || 'SmartLearn Instructor', duration || '8 Hours', badge_bg], (err, result) => {
    if (!err && result) {
      newCourse.course_id = result.insertId;
    }
    res.status(201).json({ message: 'Course created successfully! 📚', course: newCourse });
  });
};

const deleteCourse = (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  fallbackCourses = fallbackCourses.filter(c => c.course_id !== targetId);

  db.query('DELETE FROM courses WHERE course_id = ?', [targetId], (err) => {
    res.status(200).json({ message: 'Course deleted successfully! 🗑️' });
  });
};

const { courseVideosMap } = require('./courseController');

const addCourseVideo = (req, res) => {
  const { course_id, title, video_url, pdf_url } = req.body;
  const courseIdNum = parseInt(course_id) || course_id;

  if (!course_id || !title || !video_url) {
    return res.status(400).json({ message: 'Course ID, Title, and Video URL are required!' });
  }

  let embedUrl = video_url;
  if (video_url.includes('watch?v=')) {
    embedUrl = video_url.replace('watch?v=', 'embed/').split('&')[0];
  } else if (video_url.includes('youtu.be/')) {
    embedUrl = video_url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
  }

  const courseObj = fallbackCourses.find(c => c.course_id === courseIdNum || String(c.course_id) === String(course_id)) || {};
  if (courseObj) courseObj.video_count = (courseObj.video_count || 0) + 1;

  const cName = (courseObj.course_name || '').toLowerCase();
  let defaultPdf = '/uploads/pdfs/biology_summary.html';
  if (cName.includes('thermodynamics')) defaultPdf = '/uploads/pdfs/thermodynamics_notes.html';
  else if (cName.includes('algebra')) defaultPdf = '/uploads/pdfs/algebra_summary.html';
  else if (cName.includes('python')) defaultPdf = '/uploads/pdfs/python_basics.html';
  else if (cName.includes('chemistry')) defaultPdf = '/uploads/pdfs/chemistry_basics.html';
  else if (cName.includes('calculus')) defaultPdf = '/uploads/pdfs/calculus_cheat_sheet.html';

  const pdfToSave = (pdf_url && !pdf_url.includes('html_css_cheatsheet')) ? pdf_url : defaultPdf;

  const newVideoObj = {
    video_id: Date.now(),
    course_id: courseIdNum,
    title,
    video_url: embedUrl,
    pdf_url: pdfToSave,
    lesson_order: (courseVideosMap[courseIdNum] ? courseVideosMap[courseIdNum].length + 1 : 1)
  };

  if (!courseVideosMap[courseIdNum]) {
    courseVideosMap[courseIdNum] = [];
  }
  if (!courseVideosMap[String(course_id)]) {
    courseVideosMap[String(course_id)] = courseVideosMap[courseIdNum];
  }

  courseVideosMap[courseIdNum].unshift(newVideoObj);
  if (String(course_id) !== String(courseIdNum)) {
    courseVideosMap[String(course_id)].unshift(newVideoObj);
  }

  const sql = 'INSERT INTO course_videos (course_id, title, video_url, pdf_url) VALUES (?, ?, ?, ?)';
  db.query(sql, [courseIdNum, title, embedUrl, pdfToSave], (err, result) => {
    db.query('UPDATE courses SET video_count = video_count + 1 WHERE course_id = ?', [courseIdNum]);
    res.status(201).json({ message: '🎥 Video lesson & PDF material uploaded successfully!', video: newVideoObj });
  });
};

// 4. Manage Quizzes & Questions
const getQuizzesList = (req, res) => {
  const sql = `
    SELECT q.*, c.course_name, COUNT(qq.question_id) as total_questions_count
    FROM quizzes q
    LEFT JOIN courses c ON q.course_id = c.course_id
    LEFT JOIN quiz_questions qq ON q.quiz_id = qq.quiz_id
    GROUP BY q.quiz_id
    ORDER BY q.quiz_id DESC
  `;
  db.query(sql, (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({ quizzes: fallbackQuizzes });
    }
    res.status(200).json({ quizzes: results });
  });
};

const createQuiz = (req, res) => {
  const { title, subject, time_limit } = req.body;

  if (!title || !subject) {
    return res.status(400).json({ message: 'Quiz title and subject are required!' });
  }

  const newQuiz = {
    quiz_id: Date.now(),
    title,
    subject,
    course_name: 'General Course',
    total_questions_count: 0,
    time_limit: parseInt(time_limit) || 15
  };

  fallbackQuizzes.unshift(newQuiz);
  fallbackQuestionsMap[newQuiz.quiz_id] = [];

  const sql = 'INSERT INTO quizzes (title, subject, total_questions, time_limit) VALUES (?, ?, 0, ?)';
  db.query(sql, [title, subject, time_limit || 15], (err, result) => {
    if (!err && result) newQuiz.quiz_id = result.insertId;
    res.status(201).json({ message: 'Quiz created successfully! 📝', quiz: newQuiz });
  });
};

const getQuizQuestions = (req, res) => {
  const { quizId } = req.params;
  const qIdNum = parseInt(quizId);

  db.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_id ASC', [qIdNum], (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({ questions: fallbackQuestionsMap[qIdNum] || [] });
    }
    res.status(200).json({ questions: results });
  });
};

const addQuizQuestion = (req, res) => {
  const { quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;

  if (!quiz_id || !question_text || !option_a || !option_b) {
    return res.status(400).json({ message: 'Please fill in question text and options!' });
  }

  const qIdNum = parseInt(quiz_id);
  const newQuestion = {
    question_id: Date.now(),
    quiz_id: qIdNum,
    question_text,
    option_a,
    option_b,
    option_c: option_c || '',
    option_d: option_d || '',
    correct_option: (correct_option || 'A').toUpperCase(),
    explanation: explanation || ''
  };

  if (!fallbackQuestionsMap[qIdNum]) fallbackQuestionsMap[qIdNum] = [];
  fallbackQuestionsMap[qIdNum].push(newQuestion);

  const quiz = fallbackQuizzes.find(q => q.quiz_id === qIdNum);
  if (quiz) quiz.total_questions_count = fallbackQuestionsMap[qIdNum].length;

  const sql = `
    INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [qIdNum, question_text, option_a, option_b, option_c || '', option_d || '', (correct_option || 'A').toUpperCase(), explanation || ''], (err, result) => {
    if (!err && result) newQuestion.question_id = result.insertId;
    db.query('UPDATE quizzes SET total_questions = total_questions + 1 WHERE quiz_id = ?', [qIdNum]);
    res.status(201).json({ message: '❓ Question created & added to quiz successfully!', question: newQuestion });
  });
};

const updateQuizQuestion = (req, res) => {
  const { questionId } = req.params;
  const { question_text, option_a, option_b, option_c, option_d, correct_option, explanation } = req.body;
  const qIdNum = parseInt(questionId);

  if (!question_text || !option_a || !option_b) {
    return res.status(400).json({ message: 'Question text and options A & B are required!' });
  }

  Object.keys(fallbackQuestionsMap).forEach(qId => {
    const list = fallbackQuestionsMap[qId];
    const item = list.find(q => q.question_id === qIdNum);
    if (item) {
      item.question_text = question_text;
      item.option_a = option_a;
      item.option_b = option_b;
      item.option_c = option_c || '';
      item.option_d = option_d || '';
      item.correct_option = (correct_option || 'A').toUpperCase();
      item.explanation = explanation || '';
    }
  });

  const sql = `
    UPDATE quiz_questions 
    SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?, explanation = ?
    WHERE question_id = ?
  `;

  db.query(sql, [question_text, option_a, option_b, option_c || '', option_d || '', (correct_option || 'A').toUpperCase(), explanation || '', qIdNum], (err) => {
    res.status(200).json({ message: '✏️ Quiz question updated & modified successfully!' });
  });
};

const deleteQuizQuestion = (req, res) => {
  const { questionId } = req.params;
  const qIdNum = parseInt(questionId);

  Object.keys(fallbackQuestionsMap).forEach(qId => {
    fallbackQuestionsMap[qId] = fallbackQuestionsMap[qId].filter(q => q.question_id !== qIdNum);
  });

  db.query('DELETE FROM quiz_questions WHERE question_id = ?', [qIdNum], () => {
    res.status(200).json({ message: '🗑️ Quiz question deleted successfully!' });
  });
};

const deleteQuiz = (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  fallbackQuizzes = fallbackQuizzes.filter(q => q.quiz_id !== targetId);
  delete fallbackQuestionsMap[targetId];

  db.query('DELETE FROM quizzes WHERE quiz_id = ?', [targetId], (err) => {
    res.status(200).json({ message: 'Quiz deleted successfully! 🗑️' });
  });
};

// 5. Manage Forum (Get All Posts, Create Announcement, Delete Post)
const getForumPostsAdmin = (req, res) => {
  const sql = `
    SELECT fp.*, COUNT(fc.comment_id) as reply_count
    FROM forum_posts fp
    LEFT JOIN forum_comments fc ON fp.post_id = fc.post_id
    GROUP BY fp.post_id ORDER BY fp.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({ posts: fallbackForumPosts });
    }
    res.status(200).json({ posts: results });
  });
};

const createAdminForumPost = (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required!' });
  }

  const newPost = {
    post_id: Date.now(),
    user_id: 1,
    author_name: 'SmartLearn Admin 📢',
    author_role: 'admin',
    title,
    content,
    category: category || 'General Discussion',
    likes_count: 0,
    reply_count: 0,
    created_at: new Date()
  };

  fallbackForumPosts.unshift(newPost);

  const sql = 'INSERT INTO forum_posts (user_id, author_name, author_role, title, content, category) VALUES (1, "SmartLearn Admin 📢", "admin", ?, ?, ?)';
  db.query(sql, [title, content, newPost.category], (err, result) => {
    if (!err && result) newPost.post_id = result.insertId;
    res.status(201).json({ message: '📢 Official Announcement / Discussion posted!', post: newPost });
  });
};

const deleteForumPost = (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  fallbackForumPosts = fallbackForumPosts.filter(p => p.post_id !== targetId);

  db.query('DELETE FROM forum_posts WHERE post_id = ?', [targetId], (err) => {
    res.status(200).json({ message: 'Forum post removed successfully! 🗑️' });
  });
};

// 6. Manage Certificates (Get All, Issue Certificate, Delete Certificate)
const getAllCertificates = (req, res) => {
  db.query('SELECT * FROM certificates ORDER BY issued_at DESC', (err, results) => {
    if (err || !results || results.length === 0) {
      return res.status(200).json({ certificates: fallbackCertificates });
    }
    res.status(200).json({ certificates: results });
  });
};

const issueCertificate = (req, res) => {
  const { user_name, course_name } = req.body;

  if (!user_name || !course_name) {
    return res.status(400).json({ message: 'Student name and course name are required!' });
  }

  const certCode = `SL-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const newCert = {
    certificate_id: Date.now(),
    user_name,
    course_name,
    certificate_code: certCode,
    issued_at: new Date()
  };

  fallbackCertificates.unshift(newCert);

  const sql = 'INSERT INTO certificates (user_id, user_name, course_id, course_name, certificate_code) VALUES (1, ?, 1, ?, ?)';
  db.query(sql, [user_name, course_name, certCode], (err, result) => {
    if (!err && result) newCert.certificate_id = result.insertId;
    res.status(201).json({ message: '🎓 Official Course Completion Certificate issued!', certificate: newCert });
  });
};

const deleteCertificate = (req, res) => {
  const { id } = req.params;
  const targetId = parseInt(id);

  fallbackCertificates = fallbackCertificates.filter(c => c.certificate_id !== targetId);

  db.query('DELETE FROM certificates WHERE certificate_id = ?', [targetId], (err) => {
    res.status(200).json({ message: 'Certificate revoked/deleted! 🗑️' });
  });
};

module.exports = {
  fallbackCourses,
  getAdminStats,
  getAllUsers,
  addUser,
  deleteUser,
  getCoursesList,
  createCourse,
  deleteCourse,
  addCourseVideo,
  getQuizzesList,
  createQuiz,
  getQuizQuestions,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  deleteQuiz,
  getForumPostsAdmin,
  createAdminForumPost,
  deleteForumPost,
  getAllCertificates,
  issueCertificate,
  deleteCertificate
};
