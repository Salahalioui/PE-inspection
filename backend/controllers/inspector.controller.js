const TeacherProfile = require('../models/TeacherProfile');
const WeeklySchedule = require('../models/WeeklySchedule');
const LessonPlan = require('../models/LessonPlan');
const Absence = require('../models/Absence');
const FieldVisitReport = require('../models/FieldVisitReport');
const User = require('../models/User'); // We'll need this to find teachers

// @desc    Get all teachers
// @route   GET /api/inspectors/teachers
// @access  Private (Inspector only)
exports.getAllTeachers = async (req, res) => {
  try {
    // Find all users with role 'teacher'
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher profile by ID
// @route   GET /api/inspectors/teachers/:id/profile
// @access  Private (Inspector only)
exports.getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Find the teacher profile
    const profile = await TeacherProfile.findOne({ user: teacherId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher schedule by ID
// @route   GET /api/inspectors/teachers/:id/schedule
// @access  Private (Inspector only)
exports.getTeacherSchedule = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Find all schedule entries for this teacher
    const scheduleEntries = await WeeklySchedule.find({ teacher: teacherId });
    
    res.json(scheduleEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher lesson plans by ID
// @route   GET /api/inspectors/teachers/:id/lesson-plans
// @access  Private (Inspector only)
exports.getTeacherLessonPlans = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Find all lesson plans for this teacher
    const lessonPlans = await LessonPlan.find({ teacher: teacherId });
    
    res.json(lessonPlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher absences by ID
// @route   GET /api/inspectors/teachers/:id/absences
// @access  Private (Inspector only)
exports.getTeacherAbsences = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Find all absences for this teacher
    const absences = await Absence.find({ teacher: teacherId }).populate('absence_motif');
    
    res.json(absences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher progress report by ID
// @route   GET /api/inspectors/teachers/:id/progress-report
// @access  Private (Inspector only)
exports.getTeacherProgressReport = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Get all lesson plans for this teacher
    const lessonPlans = await LessonPlan.find({ teacher: teacherId });
    
    // Calculate completion percentage
    const totalLessonPlans = lessonPlans.length;
    const completedLessonPlans = lessonPlans.filter(plan => plan.completion_status).length;
    const lessonCompletionPercentage = totalLessonPlans > 0 ? (completedLessonPlans / totalLessonPlans) * 100 : 0;
    
    // Get all absences for this teacher
    const absences = await Absence.find({ teacher: teacherId });
    const absenceCount = absences.length;
    
    // Create progress report
    const progressReport = {
      lesson_completion_percentage: lessonCompletionPercentage,
      absence_count: absenceCount,
      // You could add more metrics here as needed
    };
    
    res.json(progressReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all field visit reports for a teacher
// @route   GET /api/inspectors/teachers/:id/field-visit-reports
// @access  Private (Inspector only)
exports.getFieldVisitReports = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    // Find all field visit reports for this teacher
    const reports = await FieldVisitReport.find({ teacher: teacherId });
    
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create field visit report
// @route   POST /api/inspectors/teachers/:id/field-visit-reports
// @access  Private (Inspector only)
exports.createFieldVisitReport = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const inspectorId = req.user.id; // In a real implementation, we would get the inspector ID from the authenticated user
    
    // Create a new field visit report
    const newReport = await FieldVisitReport.create({
      teacher: teacherId,
      inspector: inspectorId,
      ...req.body
    });
    
    res.status(201).json(newReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update field visit report
// @route   PUT /api/inspectors/field-visit-reports/:id
// @access  Private (Inspector only)
exports.updateFieldVisitReport = async (req, res) => {
  try {
    const inspectorId = req.user.id; // In a real implementation, we would get the inspector ID from the authenticated user
    
    // Find and update the field visit report
    const report = await FieldVisitReport.findOneAndUpdate(
      { _id: req.params.id, inspector: inspectorId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!report) {
      return res.status(404).json({ message: 'Field visit report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete field visit report
// @route   DELETE /api/inspectors/field-visit-reports/:id
// @access  Private (Inspector only)
exports.deleteFieldVisitReport = async (req, res) => {
  try {
    const inspectorId = req.user.id; // In a real implementation, we would get the inspector ID from the authenticated user
    
    // Find and delete the field visit report
    const report = await FieldVisitReport.findOneAndDelete({
      _id: req.params.id,
      inspector: inspectorId
    });
    
    if (!report) {
      return res.status(404).json({ message: 'Field visit report not found' });
    }
    
    res.json({ message: 'Field visit report removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};