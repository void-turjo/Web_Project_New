const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');

// Overview Stats
router.get('/stats', getAdminStats);

// Manage Users
router.get('/users', getAllUsers);
router.post('/users', addUser);
router.delete('/users/:id', deleteUser);

// Manage Courses
router.get('/courses/list', getCoursesList);
router.post('/courses', createCourse);
router.delete('/courses/:id', deleteCourse);
router.post('/videos', addCourseVideo);

// Manage Quizzes & Questions
router.get('/quizzes/list', getQuizzesList);
router.post('/quizzes', createQuiz);
router.get('/quizzes/:quizId/questions', getQuizQuestions);
router.post('/questions', addQuizQuestion);
router.put('/questions/:questionId', updateQuizQuestion);
router.delete('/questions/:questionId', deleteQuizQuestion);
router.delete('/quizzes/:id', deleteQuiz);

// Manage Forum
router.get('/forum/posts', getForumPostsAdmin);
router.post('/forum/posts', createAdminForumPost);
router.delete('/forum/:id', deleteForumPost);

// Manage Certificates
router.get('/certificates', getAllCertificates);
router.post('/certificates/issue', issueCertificate);
router.delete('/certificates/:id', deleteCertificate);

module.exports = router;
