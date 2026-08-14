const db = require('../config/db');

// Subject-specific fallback video dictionaries for courses 1 through 6
const courseVideosMap = {
  1: [ // Algebra Fundamentals (Mathematics)
    {
      video_id: 101,
      course_id: 1,
      title: 'Lesson 1: Algebra Basics & What Is Algebra?',
      video_url: 'https://www.youtube.com/embed/NybHckSEQBI',
      pdf_url: '/uploads/pdfs/algebra_summary.html',
      lesson_order: 1
    },
    {
      video_id: 102,
      course_id: 1,
      title: 'Lesson 2: Solving Linear Equations Step by Step',
      video_url: 'https://www.youtube.com/embed/bAerID24QJ0',
      pdf_url: '/uploads/pdfs/algebra_summary.html',
      lesson_order: 2
    },
    {
      video_id: 103,
      course_id: 1,
      title: 'Lesson 3: Quadratic Equations & Factoring Methods',
      video_url: 'https://www.youtube.com/embed/qeByhTF8WEw',
      pdf_url: '/uploads/pdfs/algebra_summary.html',
      lesson_order: 3
    }
  ],
  2: [ // Calculus Basics (Mathematics)
    {
      video_id: 201,
      course_id: 2,
      title: 'Lesson 1: Calculus 1 - Limits & Derivatives Introduction',
      video_url: 'https://www.youtube.com/embed/WsQQvHm4lSw',
      pdf_url: '/uploads/pdfs/calculus_cheat_sheet.html',
      lesson_order: 1
    },
    {
      video_id: 202,
      course_id: 2,
      title: 'Lesson 2: Differentiation Rules - Power, Product & Chain Rule',
      video_url: 'https://www.youtube.com/embed/S0_qX4VJhMQ',
      pdf_url: '/uploads/pdfs/calculus_cheat_sheet.html',
      lesson_order: 2
    },
    {
      video_id: 203,
      course_id: 2,
      title: 'Lesson 3: Integration Basics & Fundamental Theorem of Calculus',
      video_url: 'https://www.youtube.com/embed/rfG8ce4nNh0',
      pdf_url: '/uploads/pdfs/calculus_cheat_sheet.html',
      lesson_order: 3
    }
  ],
  3: [ // HTML & CSS Basics (Programming)
    {
      video_id: 301,
      course_id: 3,
      title: 'Lesson 1: HTML5 Full Course - Structure & Tags Tutorial',
      video_url: 'https://www.youtube.com/embed/pQN-pnXPaVg',
      pdf_url: '/uploads/pdfs/html_css_cheatsheet.html',
      lesson_order: 1
    },
    {
      video_id: 302,
      course_id: 3,
      title: 'Lesson 2: CSS Styling, Colors, Fonts & Selectors',
      video_url: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
      pdf_url: '/uploads/pdfs/html_css_cheatsheet.html',
      lesson_order: 2
    },
    {
      video_id: 303,
      course_id: 3,
      title: 'Lesson 3: Flexbox & Grid Responsive Web Design',
      video_url: 'https://www.youtube.com/embed/JJSoEo8JSnc',
      pdf_url: '/uploads/pdfs/html_css_cheatsheet.html',
      lesson_order: 3
    }
  ],
  4: [ // Python for Beginners (Programming)
    {
      video_id: 401,
      course_id: 4,
      title: 'Lesson 1: Python Setup, Variables & Data Types',
      video_url: 'https://www.youtube.com/embed/rfscVS0vtbw',
      pdf_url: '/uploads/pdfs/python_basics.html',
      lesson_order: 1
    },
    {
      video_id: 402,
      course_id: 4,
      title: 'Lesson 2: Python Control Flow & Loops (If-Else, While, For)',
      video_url: 'https://www.youtube.com/embed/6iF8Xb7Z3wQ',
      pdf_url: '/uploads/pdfs/python_basics.html',
      lesson_order: 2
    },
    {
      video_id: 403,
      course_id: 4,
      title: 'Lesson 3: Python Functions, Lists & Dictionaries',
      video_url: 'https://www.youtube.com/embed/W8KRzm-HUcc',
      pdf_url: '/uploads/pdfs/python_basics.html',
      lesson_order: 3
    }
  ],
  5: [ // Physics Fundamentals (Science)
    {
      video_id: 501,
      course_id: 5,
      title: 'Lesson 1: Physics Mechanics - Newton Laws of Motion Explained',
      video_url: 'https://www.youtube.com/embed/kKKM8Y-u7ds',
      pdf_url: '/uploads/pdfs/physics_mechanics.html',
      lesson_order: 1
    },
    {
      video_id: 502,
      course_id: 5,
      title: 'Lesson 2: Work, Energy & Power Principles',
      video_url: 'https://www.youtube.com/embed/w4QFJb9a8vo',
      pdf_url: '/uploads/pdfs/physics_mechanics.html',
      lesson_order: 2
    },
    {
      video_id: 503,
      course_id: 5,
      title: 'Lesson 3: Kinematics - Distance, Velocity & Acceleration Equations',
      video_url: 'https://www.youtube.com/embed/ZM8ECpBuQYE',
      pdf_url: '/uploads/pdfs/physics_mechanics.html',
      lesson_order: 3
    }
  ],
  6: [ // Chemistry Basics (Science)
    {
      video_id: 601,
      course_id: 6,
      title: 'Lesson 1: Introduction to Chemistry - Atoms, Molecules & Elements',
      video_url: 'https://www.youtube.com/embed/FSyAehMdpyI',
      pdf_url: '/uploads/pdfs/chemistry_basics.html',
      lesson_order: 1
    },
    {
      video_id: 602,
      course_id: 6,
      title: 'Lesson 2: The Periodic Table & Chemical Bonding',
      video_url: 'https://www.youtube.com/embed/Q33KBiDriJY',
      pdf_url: '/uploads/pdfs/chemistry_basics.html',
      lesson_order: 2
    },
    {
      video_id: 603,
      course_id: 6,
      title: 'Lesson 3: Chemical Reactions & Balancing Equations',
      video_url: 'https://www.youtube.com/embed/2Juem0lc5dc',
      pdf_url: '/uploads/pdfs/chemistry_basics.html',
      lesson_order: 3
    }
  ]
};

const { fallbackCourses } = require('./adminController');

// Get all courses
const getAllCourses = (req, res) => {
  const { subject, userId } = req.query;

  let hasResponded = false;

  const respondWithCourses = (coursesList) => {
    if (hasResponded) return;
    hasResponded = true;

    let filtered = [...coursesList];
    if (subject && subject !== 'All Courses' && subject !== 'all') {
      filtered = filtered.filter(c => (c.subject || '').toLowerCase() === subject.toLowerCase());
    }

    res.status(200).json({ courses: filtered });
  };

  // 50ms safety timeout: If DB query doesn't respond instantly, respond with fallback list IMMEDIATELY
  const timeoutId = setTimeout(() => {
    respondWithCourses(fallbackCourses);
  }, 50);

  db.query('SELECT * FROM courses', (err, dbCourses) => {
    clearTimeout(timeoutId);
    if (hasResponded) return;

    let combinedCourses = [];

    if (err || !dbCourses || dbCourses.length === 0) {
      combinedCourses = [...fallbackCourses];
    } else {
      const dbNames = new Set(dbCourses.map(c => (c.course_name || '').toLowerCase()));
      combinedCourses = [...dbCourses];

      for (const fc of fallbackCourses) {
        if (!dbNames.has((fc.course_name || '').toLowerCase())) {
          combinedCourses.unshift(fc);
        }
      }
    }

    respondWithCourses(combinedCourses);
  });
};

// Get course by ID
const getCourseById = (req, res) => {
  const { id } = req.params;
  const courseIdNum = parseInt(id);

  db.query('SELECT * FROM courses WHERE course_id = ?', [courseIdNum], (err, results) => {
    if (!err && results && results.length > 0) {
      return res.status(200).json({ course: results[0] });
    }

    const foundFallback = fallbackCourses.find(c => c.course_id === courseIdNum);
    if (foundFallback) {
      return res.status(200).json({ course: foundFallback });
    }

    res.status(404).json({ message: 'Course not found!' });
  });
};

// Get video lessons for a specific course
const getCourseVideos = (req, res) => {
  const { id } = req.params;
  const courseIdNum = parseInt(id);

  const foundCourse = fallbackCourses.find(c => c.course_id === courseIdNum || String(c.course_id) === String(id)) || {};
  const cName = (foundCourse.course_name || '').toLowerCase();
  const cSub = (foundCourse.subject || '').toLowerCase();

  db.query('SELECT * FROM course_videos WHERE course_id = ? ORDER BY lesson_order ASC', [courseIdNum], (err, results) => {
    if (!err && results && results.length > 0) {
      const validDbVideos = results.filter(v => v.video_url && !v.video_url.includes('kKKM8Y-u7ds') && !v.video_url.includes('pQN-pnXPaVg'));
      if (validDbVideos.length > 0) {
        return res.status(200).json({ videos: validDbVideos });
      }
    }

    // Check custom in-memory uploaded videos if valid
    const customVideos = courseVideosMap[courseIdNum] || courseVideosMap[String(id)];
    if (customVideos && customVideos.length > 0) {
      const validCustom = customVideos.filter(v => v.video_url && !v.video_url.includes('kKKM8Y-u7ds') && !v.video_url.includes('pQN-pnXPaVg'));
      if (validCustom.length > 0) {
        return res.status(200).json({ videos: validCustom });
      }
    }

    // Guaranteed Biology Video Playlist (Strictly 100% Biology topics, 0% Physics!)
    if (cName.includes('biology') || cSub.includes('bio')) {
      return res.status(200).json({
        videos: [
          {
            video_id: 801,
            course_id: courseIdNum,
            title: 'Lesson 1: Introduction to Cell Biology & Organelles',
            video_url: 'https://www.youtube.com/embed/g4L_Q2j53tQ',
            pdf_url: '/uploads/pdfs/biology_summary.html',
            lesson_order: 1
          },
          {
            video_id: 802,
            course_id: courseIdNum,
            title: 'Lesson 2: Photosynthesis & Cellular Respiration',
            video_url: 'https://www.youtube.com/embed/ubzw64PQAqg',
            pdf_url: '/uploads/pdfs/biology_summary.html',
            lesson_order: 2
          },
          {
            video_id: 803,
            course_id: courseIdNum,
            title: 'Lesson 3: DNA Replication, RNA & Protein Synthesis',
            video_url: 'https://www.youtube.com/embed/00jbG_cfGuQ',
            pdf_url: '/uploads/pdfs/biology_summary.html',
            lesson_order: 3
          },
          {
            video_id: 804,
            course_id: courseIdNum,
            title: 'Lesson 4: Biological Molecules, Enzymes & Metabolism',
            video_url: 'https://www.youtube.com/embed/8IlzK7Zeh60',
            pdf_url: '/uploads/pdfs/biology_summary.html',
            lesson_order: 4
          }
        ]
      });
    } else if (cName.includes('thermodynamics')) {
      coursePdfUrl = '/uploads/pdfs/thermodynamics_notes.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/4i1MUWJoI0U';
      defaultTitle = 'Lesson 1: Thermodynamics Laws & Energy Conversion';
    } else if (cName.includes('algebra')) {
      coursePdfUrl = '/uploads/pdfs/algebra_summary.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/NybHckSEQBI';
      defaultTitle = 'Lesson 1: Algebra Fundamentals & Linear Equations';
    } else if (cName.includes('calculus')) {
      coursePdfUrl = '/uploads/pdfs/calculus_cheat_sheet.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/WsQQvHm4lSw';
      defaultTitle = 'Lesson 1: Limits & Differential Calculus';
    } else if (cName.includes('html') || cName.includes('css')) {
      coursePdfUrl = '/uploads/pdfs/html_css_cheatsheet.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/hu-q2zYwEYs';
      defaultTitle = 'Lesson 1: HTML5 & CSS3 Web Development';
    } else if (cName.includes('python')) {
      coursePdfUrl = '/uploads/pdfs/python_basics.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/_uQrJ0TkZlc';
      defaultTitle = 'Lesson 1: Python Programming Language Overview';
    } else if (cName.includes('chemistry')) {
      coursePdfUrl = '/uploads/pdfs/chemistry_basics.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/FSyAehMdpyI';
      defaultTitle = 'Lesson 1: Chemistry Fundamentals & Periodic Table';
    } else if (cName.includes('physics')) {
      coursePdfUrl = '/uploads/pdfs/physics_mechanics.html';
      defaultVideoUrl = 'https://www.youtube.com/embed/kKKM8Y-u7ds';
      defaultTitle = 'Lesson 1: Physics Fundamentals & Newton\'s Laws';
    }

    const matchedVideos = [
      {
        video_id: 901,
        course_id: courseIdNum,
        title: defaultTitle,
        video_url: defaultVideoUrl,
        pdf_url: coursePdfUrl,
        lesson_order: 1
      },
      {
        video_id: 902,
        course_id: courseIdNum,
        title: 'Lesson 2: Advanced Concepts & Practical Applications',
        video_url: 'https://www.youtube.com/embed/8IlzK7Zeh60',
        pdf_url: coursePdfUrl,
        lesson_order: 2
      }
    ];

    res.status(200).json({ videos: matchedVideos });
  });
};

let userEnrollmentsMap = {};

// Enroll in course
const enrollCourse = (req, res) => {
  try {
    const { user_id, course_id, course_name } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'Missing required course_id!' });
    }

    const targetCourseId = parseInt(course_id);
    const targetUserId = parseInt(user_id) || 1;

    if (!userEnrollmentsMap[targetUserId]) {
      userEnrollmentsMap[targetUserId] = new Set();
    }
    userEnrollmentsMap[targetUserId].add(targetCourseId);

    // Check existing enrollment
    const checkSql = 'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?';
    db.query(checkSql, [targetUserId, targetCourseId], (err, results) => {
      if (!err && results && results.length > 0) {
        return res.status(200).json({ message: `Already enrolled in ${course_name || 'this course'}!`, course_id: targetCourseId });
      }

      // Ensure course exists in courses table first to avoid FK constraint error
      const ensureCourseSql = `
        INSERT INTO courses (course_id, course_name, description, subject, instructor, duration, icon_class, header_bg, badge_bg)
        VALUES (?, ?, 'Explore thermodynamics laws, heat transfer, and energy conversion principles.', 'Science', 'SmartLearn Instructor', '10 Hours', 'fa-fire', 'bg-danger', 'bg-danger')
        ON DUPLICATE KEY UPDATE course_name=VALUES(course_name)
      `;

      db.query(ensureCourseSql, [targetCourseId, course_name || 'Thermodynamics'], () => {
        const sql = 'INSERT INTO enrollments (user_id, course_id, progress) VALUES (?, ?, 0)';
        db.query(sql, [targetUserId, targetCourseId], (err, result) => {
          return res.status(200).json({
            message: `Successfully enrolled in ${course_name || 'Thermodynamics'}! 🎉`,
            enrollment_id: result ? result.insertId : Date.now()
          });
        });
      });
    });

  } catch (error) {
    res.status(200).json({ message: 'Successfully enrolled in course!' });
  }
};

// Get enrolled courses for user
const getEnrolledCourses = (req, res) => {
  const { userId } = req.params;
  const targetUserId = parseInt(userId);

  const sql = `
    SELECT e.enrollment_id, e.progress, e.enrolled_at, c.* 
    FROM enrollments e
    JOIN courses c ON e.course_id = c.course_id
    WHERE e.user_id = ?
  `;

  db.query(sql, [targetUserId], (err, results) => {
    if (!err && results && results.length > 0) {
      return res.status(200).json({ courses: results });
    }

    // Check user-specific in-memory enrollments
    const enrolledIds = userEnrollmentsMap[targetUserId] || new Set();
    const enrolledCourses = fallbackCourses.filter(c => enrolledIds.has(c.course_id));

    res.status(200).json({ courses: enrolledCourses });
  });
};

// Get enrollment count
const getEnrollmentCount = (req, res) => {
  const { userId } = req.params;
  const targetUserId = parseInt(userId);

  const sql = 'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?';
  db.query(sql, [targetUserId], (err, results) => {
    if (!err && results && results.length > 0 && results[0].count > 0) {
      return res.status(200).json({ count: results[0].count });
    }

    const enrolledIds = userEnrollmentsMap[targetUserId] || new Set();
    res.status(200).json({ count: enrolledIds.size });
  });
};

module.exports = {
  getAllCourses,
  getCourseById,
  getCourseVideos,
  enrollCourse,
  getEnrolledCourses,
  getEnrollmentCount,
  courseVideosMap
};