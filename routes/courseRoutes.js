const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  getCourseVideos,
  enrollCourse,
  getEnrolledCourses,
  getEnrollmentCount
} = require('../controllers/courseController');

// Get all courses
router.get('/', getAllCourses);

// Get course by ID
router.get('/details/:id', getCourseById);

// Get video lessons for course
router.get('/:id/videos', getCourseVideos);

// Enroll in course
router.post('/enroll', enrollCourse);

// Get enrolled courses for a user
router.get('/enrolled/:userId', getEnrolledCourses);

// Get enrollment count for a user
router.get('/count/:userId', getEnrollmentCount);

module.exports = router;