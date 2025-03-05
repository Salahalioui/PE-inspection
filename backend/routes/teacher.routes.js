const express = require('express');
const router = express.Router();

// Import controllers
const teacherController = require('../controllers/teacher.controller');

// Profile routes

// @route   GET /api/teachers/profile
// @desc    Get teacher profile
// @access  Private (Teacher only)
router.get('/profile', teacherController.getProfile);

// @route   PUT /api/teachers/profile
// @desc    Update teacher profile
// @access  Private (Teacher only)
router.put('/profile', teacherController.updateProfile);

// Schedule routes

// @route   GET /api/teachers/schedule
// @desc    Get teacher schedule
// @access  Private (Teacher only)
router.get('/schedule', teacherController.getSchedule);

// @route   POST /api/teachers/schedule
// @desc    Add schedule entry
// @access  Private (Teacher only)
router.post('/schedule', teacherController.addScheduleEntry);

// @route   PUT /api/teachers/schedule/:id
// @desc    Update schedule entry
// @access  Private (Teacher only)
router.put('/schedule/:id', teacherController.updateScheduleEntry);

// @route   DELETE /api/teachers/schedule/:id
// @desc    Delete schedule entry
// @access  Private (Teacher only)
router.delete('/schedule/:id', teacherController.deleteScheduleEntry);

// Lesson plan routes

// @route   GET /api/teachers/lesson-plans
// @desc    Get all lesson plans
// @access  Private (Teacher only)
router.get('/lesson-plans', teacherController.getLessonPlans);

// @route   POST /api/teachers/lesson-plans
// @desc    Create lesson plan
// @access  Private (Teacher only)
router.post('/lesson-plans', teacherController.createLessonPlan);

// @route   PUT /api/teachers/lesson-plans/:id
// @desc    Update lesson plan
// @access  Private (Teacher only)
router.put('/lesson-plans/:id', teacherController.updateLessonPlan);

// @route   PUT /api/teachers/lesson-plans/:id/toggle-completion
// @desc    Toggle lesson plan completion status
// @access  Private (Teacher only)
router.put('/lesson-plans/:id/toggle-completion', teacherController.toggleLessonPlanCompletion);

// Absence routes

// @route   GET /api/teachers/absences
// @desc    Get all absences
// @access  Private (Teacher only)
router.get('/absences', teacherController.getAbsences);

// @route   POST /api/teachers/absences
// @desc    Record absence
// @access  Private (Teacher only)
router.post('/absences', teacherController.recordAbsence);

// @route   GET /api/teachers/absence-motifs
// @desc    Get all absence motifs
// @access  Private (Teacher only)
router.get('/absence-motifs', teacherController.getAbsenceMotifs);

// Progress report routes

// @route   GET /api/teachers/progress-report
// @desc    Get progress report
// @access  Private (Teacher only)
router.get('/progress-report', teacherController.getProgressReport);

module.exports = router;