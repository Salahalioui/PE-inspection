const mongoose = require('mongoose');

const LessonPlanSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson_number: {
    type: Number,
    required: true
  },
  objectives: {
    type: String,
    required: true
  },
  completion_status: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LessonPlan', LessonPlanSchema);