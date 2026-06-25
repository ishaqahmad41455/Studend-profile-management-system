const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAttendance)
  .post(protect, authorize('admin', 'teacher'), markAttendance);

router.get('/summary/:studentId', protect, getAttendanceSummary);

module.exports = router;
