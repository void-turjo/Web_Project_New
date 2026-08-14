const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/instructorController');

router.get('/stats/:instructorId', getInstructorStats);
router.get('/courses/:instructorId', getInstructorCourses);
router.post('/courses', createInstructorCourse);
router.post('/videos', addInstructorVideo);
router.get('/quizzes/:instructorId', getInstructorQuizzes);
router.post('/quizzes', createInstructorQuiz);
router.post('/questions', addInstructorQuestion);
router.get('/forum/unanswered', getUnansweredForumQuestions);
router.post('/forum/answer', answerStudentQuestion);
router.get('/students/:instructorId', getEnrolledStudents);

module.exports = router;
