const TeacherProfile = require('../models/TeacherProfile');
const WeeklySchedule = require('../models/WeeklySchedule');
const LessonPlan = require('../models/LessonPlan');
const Absence = require('../models/Absence');
const AbsenceMotif = require('../models/AbsenceMotif');

// @desc    Get teacher profile
// @route   GET /api/teachers/profile
// @access  Private (Teacher only)
exports.getProfile = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find the teacher profile
    const profile = await TeacherProfile.findOne({ user: teacherId });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update teacher profile
// @route   PUT /api/teachers/profile
// @access  Private (Teacher only)
exports.updateProfile = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find and update the teacher profile
    const profile = await TeacherProfile.findOneAndUpdate(
      { user: teacherId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!profile) {
      // If profile doesn't exist, create it
      const newProfile = await TeacherProfile.create({
        user: teacherId,
        ...req.body
      });
      
      return res.json(newProfile);
    }
    
    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get teacher schedule
// @route   GET /api/teachers/schedule
// @access  Private (Teacher only)
exports.getSchedule = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find all schedule entries for this teacher
    const scheduleEntries = await WeeklySchedule.find({ teacher: teacherId });
    
    res.json(scheduleEntries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add schedule entry
// @route   POST /api/teachers/schedule
// @access  Private (Teacher only)
exports.addScheduleEntry = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Create a new schedule entry
    const newScheduleEntry = await WeeklySchedule.create({
      teacher: teacherId,
      ...req.body
    });
    
    res.status(201).json(newScheduleEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update schedule entry
// @route   PUT /api/teachers/schedule/:id
// @access  Private (Teacher only)
exports.updateScheduleEntry = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find and update the schedule entry
    const scheduleEntry = await WeeklySchedule.findOneAndUpdate(
      { _id: req.params.id, teacher: teacherId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!scheduleEntry) {
      return res.status(404).json({ message: 'Schedule entry not found' });
    }
    
    res.json(scheduleEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete schedule entry
// @route   DELETE /api/teachers/schedule/:id
// @access  Private (Teacher only)
exports.deleteScheduleEntry = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find and delete the schedule entry
    const scheduleEntry = await WeeklySchedule.findOneAndDelete({
      _id: req.params.id,
      teacher: teacherId
    });
    
    if (!scheduleEntry) {
      return res.status(404).json({ message: 'Schedule entry not found' });
    }
    
    res.json({ message: 'Schedule entry removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all lesson plans
// @route   GET /api/teachers/lesson-plans
// @access  Private (Teacher only)
exports.getLessonPlans = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find all lesson plans for this teacher
    const lessonPlans = await LessonPlan.find({ teacher: teacherId });
    
    res.json(lessonPlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create lesson plan
// @route   POST /api/teachers/lesson-plans
// @access  Private (Teacher only)
exports.createLessonPlan = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Create a new lesson plan
    const newLessonPlan = await LessonPlan.create({
      teacher: teacherId,
      ...req.body
    });
    
    res.status(201).json(newLessonPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update lesson plan
// @route   PUT /api/teachers/lesson-plans/:id
// @access  Private (Teacher only)
exports.updateLessonPlan = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find and update the lesson plan
    const lessonPlan = await LessonPlan.findOneAndUpdate(
      { _id: req.params.id, teacher: teacherId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    
    res.json(lessonPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle lesson plan completion status
// @route   PUT /api/teachers/lesson-plans/:id/toggle-completion
// @access  Private (Teacher only)
exports.toggleLessonPlanCompletion = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find the lesson plan
    const lessonPlan = await LessonPlan.findOne({
      _id: req.params.id,
      teacher: teacherId
    });
    
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Lesson plan not found' });
    }
    
    // Toggle the completion status
    lessonPlan.completion_status = !lessonPlan.completion_status;
    await lessonPlan.save();
    
    res.json(lessonPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all absences
// @route   GET /api/teachers/absences
// @access  Private (Teacher only)
exports.getAbsences = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Find all absences for this teacher
    const absences = await Absence.find({ teacher: teacherId }).populate('absence_motif');
    
    res.json(absences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Record absence
// @route   POST /api/teachers/absences
// @access  Private (Teacher only)
exports.recordAbsence = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
    // Create a new absence record
    const newAbsence = await Absence.create({
      teacher: teacherId,
      ...req.body
    });
    
    res.status(201).json(newAbsence);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all absence motifs
// @route   GET /api/teachers/absence-motifs
// @access  Private (Teacher only)
exports.getAbsenceMotifs = async (req, res) => {
  try {
    // Find all absence motifs
    const absenceMotifs = await AbsenceMotif.find();
    
    res.json(absenceMotifs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get progress report
// @route   GET /api/teachers/progress-report
// @access  Private (Teacher only)
exports.getProgressReport = async (req, res) => {
  try {
    // In a real implementation, we would get the teacher ID from the authenticated user
    const teacherId = req.user.id;
    
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