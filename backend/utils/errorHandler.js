const handleControllerError = (error, res) => {
  // Duplicate key (unique index violation)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `A record with that ${field} already exists.`
    });
  }
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
};

module.exports = handleControllerError;