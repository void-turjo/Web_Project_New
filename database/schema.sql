-- SmartLearn V2 Database Schema
CREATE DATABASE IF NOT EXISTS smartlearn;
USE smartlearn;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'student',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(150) NOT NULL,
  description TEXT,
  subject VARCHAR(50) NOT NULL,
  instructor VARCHAR(100) DEFAULT 'SmartLearn Instructor',
  duration VARCHAR(50) DEFAULT '6 Hours',
  video_count INT DEFAULT 12,
  pdf_count INT DEFAULT 5,
  icon_class VARCHAR(50) DEFAULT 'fa-book',
  header_bg VARCHAR(50) DEFAULT 'bg-primary',
  badge_bg VARCHAR(50) DEFAULT 'bg-info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course Videos Table
CREATE TABLE IF NOT EXISTS course_videos (
  video_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  pdf_url VARCHAR(500),
  lesson_order INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  progress INT DEFAULT 0,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_course (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- 5. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  quiz_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  title VARCHAR(150) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  total_questions INT DEFAULT 5,
  time_limit INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);

-- 6. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option CHAR(1) NOT NULL,
  explanation TEXT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

-- 7. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  attempt_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed TINYINT(1) DEFAULT 1,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

-- 8. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  note_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  course_id INT,
  file_name VARCHAR(255) NOT NULL,
  file_size VARCHAR(20) DEFAULT '2.4 MB',
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);

-- 9. Forum Posts Table
CREATE TABLE IF NOT EXISTS forum_posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_role VARCHAR(50) DEFAULT 'student',
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'General Discussion',
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 10. Forum Comments Table
CREATE TABLE IF NOT EXISTS forum_comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  author_name VARCHAR(100) NOT NULL,
  author_role VARCHAR(50) DEFAULT 'student',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES forum_posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  certificate_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  course_id INT NOT NULL,
  course_name VARCHAR(150) NOT NULL,
  certificate_code VARCHAR(50) NOT NULL UNIQUE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- Seed Initial Courses
INSERT INTO courses (course_id, course_name, description, subject, instructor, duration, video_count, pdf_count, icon_class, header_bg, badge_bg)
VALUES
(1, 'Algebra Fundamentals', 'Master the basics of algebra including equations, inequalities, and functions.', 'Mathematics', 'Dr. Sarah Connor', '6 Hours', 12, 4, 'fa-square-root-variable', 'bg-primary', 'bg-info'),
(2, 'Calculus Basics', 'Learn differentiation, integration, and their real-world applications.', 'Mathematics', 'Prof. Alan Turing', '8 Hours', 15, 6, 'fa-calculator', 'bg-primary', 'bg-info'),
(3, 'HTML & CSS Basics', 'Build beautiful websites from scratch using HTML5 and CSS3.', 'Programming', 'John Doe', '10 Hours', 20, 12, 'fa-code', 'bg-success', 'bg-warning'),
(4, 'Python for Beginners', 'Start your programming journey with Python — the most beginner-friendly language.', 'Programming', 'Guido van Rossum', '12 Hours', 25, 15, 'fa-python', 'bg-success', 'bg-warning'),
(5, 'Physics Fundamentals', 'Understand motion, forces, energy, and fundamental laws of physics.', 'Science', 'Dr. Richard Feynman', '9 Hours', 18, 8, 'fa-atom', 'bg-danger', 'bg-danger'),
(6, 'Chemistry Basics', 'Explore atoms, molecules, reactions, and the periodic table of elements.', 'Science', 'Marie Curie', '7 Hours', 14, 5, 'fa-flask', 'bg-danger', 'bg-danger')
ON DUPLICATE KEY UPDATE course_name=VALUES(course_name);

-- Seed Subject-Specific Course Videos
INSERT INTO course_videos (course_id, title, video_url, pdf_url, lesson_order)
VALUES
-- Algebra (Course 1)
(1, 'Lesson 1: Algebra Basics & What Is Algebra?', 'https://www.youtube.com/embed/NybHckSEQBI', '/uploads/pdfs/algebra_summary.pdf', 1),
(1, 'Lesson 2: Solving Linear Equations Step by Step', 'https://www.youtube.com/embed/bAerID24QJ0', '/uploads/pdfs/algebra_summary.pdf', 2),
(1, 'Lesson 3: Quadratic Equations & Factoring Methods', 'https://www.youtube.com/embed/qeByhTF8WEw', '/uploads/pdfs/algebra_summary.pdf', 3),

-- Calculus (Course 2)
(2, 'Lesson 1: Calculus 1 - Limits & Derivatives Introduction', 'https://www.youtube.com/embed/WsQQvHm4lSw', '/uploads/pdfs/calculus_cheat_sheet.pdf', 1),
(2, 'Lesson 2: Differentiation Rules - Power, Product & Chain Rule', 'https://www.youtube.com/embed/S0_qX4VJhMQ', '/uploads/pdfs/calculus_cheat_sheet.pdf', 2),
(2, 'Lesson 3: Integration Basics & Fundamental Theorem of Calculus', 'https://www.youtube.com/embed/rfG8ce4nNh0', '/uploads/pdfs/calculus_cheat_sheet.pdf', 3),

-- HTML & CSS (Course 3)
(3, 'Lesson 1: HTML5 Full Course - Structure & Tags Tutorial', 'https://www.youtube.com/embed/pQN-pnXPaVg', '/uploads/pdfs/html_css_cheatsheet.pdf', 1),
(3, 'Lesson 2: CSS Styling, Colors, Fonts & Selectors', 'https://www.youtube.com/embed/1Rs2ND1ryYc', '/uploads/pdfs/html_css_cheatsheet.pdf', 2),
(3, 'Lesson 3: Flexbox & Grid Responsive Web Design', 'https://www.youtube.com/embed/JJSoEo8JSnc', '/uploads/pdfs/html_css_cheatsheet.pdf', 3),

-- Python (Course 4)
(4, 'Lesson 1: Python Setup, Variables & Data Types', 'https://www.youtube.com/embed/rfscVS0vtbw', '/uploads/pdfs/python_basics.pdf', 1),
(4, 'Lesson 2: Python Control Flow & Loops (If-Else, While, For)', 'https://www.youtube.com/embed/6iF8Xb7Z3wQ', '/uploads/pdfs/python_basics.pdf', 2),
(4, 'Lesson 3: Python Functions, Lists & Dictionaries', 'https://www.youtube.com/embed/W8KRzm-HUcc', '/uploads/pdfs/python_basics.pdf', 3),

-- Physics (Course 5)
(5, 'Lesson 1: Physics Mechanics - Newton Laws of Motion Explained', 'https://www.youtube.com/embed/kKKM8Y-u7ds', '/uploads/pdfs/physics_mechanics.pdf', 1),
(5, 'Lesson 2: Work, Energy & Power Principles', 'https://www.youtube.com/embed/w4QFJb9a8vo', '/uploads/pdfs/physics_mechanics.pdf', 2),
(5, 'Lesson 3: Kinematics - Distance, Velocity & Acceleration Equations', 'https://www.youtube.com/embed/ZM8ECpBuQYE', '/uploads/pdfs/physics_mechanics.pdf', 3),

-- Chemistry (Course 6)
(6, 'Lesson 1: Introduction to Chemistry - Atoms, Molecules & Elements', 'https://www.youtube.com/embed/FSyAehMdpyI', '/uploads/pdfs/chemistry_basics.pdf', 1),
(6, 'Lesson 2: The Periodic Table & Chemical Bonding', 'https://www.youtube.com/embed/Q33KBiDriJY', '/uploads/pdfs/chemistry_basics.pdf', 2),
(6, 'Lesson 3: Chemical Reactions & Balancing Equations', 'https://www.youtube.com/embed/2Juem0lc5dc', '/uploads/pdfs/chemistry_basics.pdf', 3)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed Quizzes
INSERT INTO quizzes (quiz_id, course_id, title, subject, total_questions, time_limit)
VALUES
(1, 1, 'Mathematics Quiz', 'Mathematics', 10, 30),
(2, 3, 'Programming Quiz', 'Programming', 10, 30),
(3, 5, 'Science Quiz', 'Science', 10, 30)
ON DUPLICATE KEY UPDATE title=VALUES(title);
