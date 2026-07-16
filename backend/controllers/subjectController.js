const Subject = require('../models/Subject');

const getSubjects = async (req, res) => {
  try {
    const { classId } = req.query;
    const query = classId ? { class: classId } : {};
    const subjects = await Subject.find(query)
      .populate('class', 'name section')
      .populate('teacher', 'name email');
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, classId } = req.body;
    const subject = await Subject.create({ name, code, class: classId });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const updateSubject = async (req, res) => {
  try {
    const { name, code, classId } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, code, class: classId },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ success: false, message: 'Subject not found' });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    handleControllerError(error, res);
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
