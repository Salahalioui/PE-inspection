const express = require('express');
const router = express.Router();

// Import controllers
const inspectorController = require('../controllers/inspector.controller');

// Teacher data routes

// @route   GET /api/inspectors/teachers
// @desc    Get all teachers
// @access  Private (Inspector only)
router.get('/teachers', inspectorController.getAllTeachers);

// @route   GET /api/inspectors/teachers/:id/profile
// @desc    Get teacher profile by ID
// @access  Private (Inspector only)
router.get('/teachers/:id/profile', inspectorController.getTeacherProfile);

// @route   GET /api/inspectors/teachers/:id/schedule
// @desc    Get teacher schedule by ID
// @access  Private (Inspector only)
router.get('/teachers/:id/schedule', inspectorController.getTeacherSchedule);

// @route   GET /api/inspectors/teachers/:id/lesson-plans
// @desc    Get teacher lesson plans by ID
// @access  Private (Inspector only)
router.get('/teachers/:id/lesson-plans', inspectorController.getTeacherLessonPlans);

// @route   GET /api/inspectors/teachers/:id/absences
// @desc    Get teacher absences by ID
// @access  Private (Inspector only)
router.get('/teachers/:id/absences', inspectorController.getTeacherAbsences);

// @route   GET /api/inspectors/teachers/:id/progress-report
// @desc    Get teacher progress report by ID
// @access  Private (Inspector only)
router.get('/teachers/:id/progress-report', inspectorController.getTeacherProgressReport);

// Field visit report routes

// @route   GET /api/inspectors/teachers/:id/field-visit-reports
// @desc    Get all field visit reports for a teacher
// @access  Private (Inspector only)
router.get('/teachers/:id/field-visit-reports', inspectorController.getFieldVisitReports);

// @route   POST /api/inspectors/teachers/:id/field-visit-reports
// @desc    Create field visit report
// @access  Private (Inspector only)
router.post('/teachers/:id/field-visit-reports', inspectorController.createFieldVisitReport);

// @route   PUT /api/inspectors/field-visit-reports/:id
// @desc    Update field visit report
// @access  Private (Inspector only)
router.put('/field-visit-reports/:id', inspectorController.updateFieldVisitReport);

// @route   DELETE /api/inspectors/field-visit-reports/:id
// @desc    Delete field visit report
// @access  Private (Inspector only)
router.delete('/field-visit-reports/:id', inspectorController.deleteFieldVisitReport);

module.exports = router;