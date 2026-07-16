const Student = require('../models/Student');
const User = require('../models/user');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getStudents = async (req, res) => {
  try {
    const { classId, search } = req.query;
    let query = {};

    if (classId) query.class = classId;

    let students = await Student.find(query)
      .populate('user', 'name email')
      .populate('class', 'name section');

    if (search) {
      const lower = search.toLowerCase();
      students = students.filter(s =>
        s.user?.name?.toLowerCase().includes(lower) ||
        s.rollNumber?.toLowerCase().includes(lower)
      );
    }

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'name email')
      .populate('class', 'name section');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, classId, parentName, parentPhone, address, dateOfBirth, gender } = req.body;

    // Create user account for student
    const user = await User.create({ name, email, password, role: 'student' });

    const student = await Student.create({
      user: user._id,
      rollNumber,
      class: classId,
      parentName,
      parentPhone,
      address,
      dateOfBirth,
      gender
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email')
      .populate('class', 'name section');

    res.status(201).json({ success: true, data: populatedStudent });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
  try {
    const { rollNumber, classId, parentName, parentPhone, address, dateOfBirth, gender } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { rollNumber, class: classId, parentName, parentPhone, address, dateOfBirth, gender },
      { new: true, runValidators: true }
    ).populate('user', 'name email').populate('class', 'name section');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    handleControllerError(error, res);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Also delete associated user
    await User.findByIdAndDelete(student.user);
    await student.deleteOne();

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    handleControllerError(error, res);
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };
