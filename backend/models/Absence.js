const mongoose = require('mongoose');

const AbsenceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  absence_date: {
    type: Date,
    required: true
  },
  absence_motif: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AbsenceMotif',
    required: true
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

module.exports = mongoose.model('Absence', AbsenceSchema);