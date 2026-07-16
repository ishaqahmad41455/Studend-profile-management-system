const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Get monthly attendance report
// @route   GET /api/reports/monthly
// @access  Private (Admin, Teacher)
const getMonthlyReport = async (req, res) => {
  try {
    const { month, year, classId, subjectId } = req.query;

    const m = parseInt(month) - 1;
    const y = parseInt(year);
    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59);

    let query = { date: { $gte: startDate, $lte: endDate } };
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;

    const records = await Attendance.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate('subject', 'name code')
      .sort({ date: 1 });

    // Group by student
    const studentMap = {};
    for (const rec of records) {
      const sid = rec.student?._id?.toString();
      if (!sid) continue;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student: {
            _id: rec.student._id,
            name: rec.student.user?.name,
            rollNumber: rec.student.rollNumber
          },
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      studentMap[sid].total++;
      if (rec.status === 'present') studentMap[sid].present++;
      else if (rec.status === 'absent') studentMap[sid].absent++;
      else if (rec.status === 'late') studentMap[sid].late++;
    }

    const report = Object.values(studentMap).map(s => ({
      ...s,
      percentage: s.total > 0 ? (((s.present + s.late) / s.total) * 100).toFixed(2) : '0.00'
    }));

    res.json({
      success: true,
      month: month,
      year: year,
      totalRecords: records.length,
      data: report
    });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Get class-wise report
// @route   GET /api/reports/class/:classId
// @access  Private (Admin, Teacher)
const getClassReport = async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    let query = { class: classId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    handleControllerError(error, res);
  }
};

module.exports = { getMonthlyReport, getClassReport };
