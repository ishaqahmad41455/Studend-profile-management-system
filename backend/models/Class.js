const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  academicYear: {
    type: String,
    default: () => {
      const now = new Date();
      return `${now.getFullYear()}-${now.getFullYear() + 1}`;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
ClassSchema.index({ name: 1, section: 1 }, { unique: true });
module.exports = mongoose.model('Class', ClassSchema);
