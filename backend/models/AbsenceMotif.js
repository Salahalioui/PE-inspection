const mongoose = require('mongoose');

const AbsenceMotifSchema = new mongoose.Schema({
  motif_label_ar: {
    type: String,
    required: true
  },
  motif_label_fr: {
    type: String,
    required: true
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

module.exports = mongoose.model('AbsenceMotif', AbsenceMotifSchema);