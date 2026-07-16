const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
const markAttendance = async (req, res) => {
  try {
    const { attendanceData, classId, subjectId, date } = req.body;
    // attendanceData: [{ studentId, status, remarks }]

    const results = [];
    const errors = [];

    for (const entry of attendanceData) {
      try {
        const existing = await Attendance.findOne({
          student: entry.studentId,
          date: new Date(date),
          subject: subjectId
        });

        if (existing) {
          existing.status = entry.status;
          existing.remarks = entry.remarks || '';
          await existing.save();
          results.push(existing);
        } else {
          const record = await Attendance.create({
            student: entry.studentId,
            class: classId,
            subject: subjectId,
            date: new Date(date),
            status: entry.status,
            markedBy: req.user._id,
            remarks: entry.remarks || ''
          });
          results.push(record);
        }
      } catch (err) {
        errors.push({ studentId: entry.studentId, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${results.length} students`,
      data: results,
      errors
    });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { studentId, classId, subjectId, date, startDate, endDate } = req.query;
    let query = {};

    if (studentId) query.student = studentId;
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;

    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // If student role, only show their own records
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) query.student = student._id;
    }

    const attendance = await Attendance.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('class', 'name section')
      .populate('subject', 'name code')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Get student attendance summary
// @route   GET /api/attendance/summary/:studentId
// @access  Private
const getAttendanceSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { subjectId } = req.query;

    let query = { student: studentId };
    if (subjectId) query.subject = subjectId;

    const records = await Attendance.find(query);
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const late = records.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: { total, present, absent, late, percentage }
    });
  } catch (error) {
    handleControllerError(error, res);
  }
};

module.exports = { markAttendance, getAttendance, getAttendanceSummary };
