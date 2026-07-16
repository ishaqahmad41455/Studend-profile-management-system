const Class = require('../models/Class');

const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'name email')
      .populate('subjects', 'name code');
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('subjects', 'name code');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const createClass = async (req, res) => {
  try {
    const cls = await Class.create(req.body);
    res.status(201).json({ success: true, data: cls });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: cls });
  } catch (error) {
    handleControllerError(error, res);
  }
};

const deleteClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    handleControllerError(error, res);
  }
};

module.exports = { getClasses, getClass, createClass, updateClass, deleteClass };
