const express = require('express');
const router = express.Router();
const { getQuizzes, getQuizDetails, submitQuiz, getUserAttempts } = require('../controllers/quizController');

router.get('/', getQuizzes);
router.get('/:quizId', getQuizDetails);
router.post('/submit', submitQuiz);
router.get('/user/:userId', getUserAttempts);

module.exports = router;
