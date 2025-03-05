const mongoose = require('mongoose');

const TeacherProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Personal Info
  full_name: {
    type: String,
    required: true
  },
  date_of_birth: {
    type: Date
  },
  // Professional Info
  job_title: {
    type: String,
    required: true
  },
  level: {
    type: String
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  work_institution: {
    type: String,
    required: true
  },
  position: {
    type: String
  },
  grade: {
    type: String
  },
  appointment_date: {
    type: Date
  },
  confirmation_date: {
    type: Date
  },
  marital_status: {
    type: String
  },
  certificate_obtained: {
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

module.exports = mongoose.model('TeacherProfile', TeacherProfileSchema);