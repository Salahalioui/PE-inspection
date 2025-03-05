const mongoose = require('mongoose');

const FieldVisitReportSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visit_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  report_content: {
    type: String,
    required: true
  },
  additional_comments: {
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

module.exports = mongoose.model('FieldVisitReport', FieldVisitReportSchema);