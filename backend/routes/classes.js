const express = require('express');
const router = express.Router();

// FIX: import only once and use destructured controller functions
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass
} = require('../controllers/classController');

const auth = require('../middleware/auth');

// FIX: use the correct function name and middleware (auth.protect, not just auth)
router.get('/', auth.protect, getClasses);

// Additional RESTful routes
router.route('/')
  .get(auth.protect, getClasses)               // already covered above, but safe
  .post(auth.protect, auth.authorize('admin'), createClass);

router.route('/:id')
  .get(auth.protect, getClass)
  .put(auth.protect, auth.authorize('admin'), updateClass)
  .delete(auth.protect, auth.authorize('admin'), deleteClass);

module.exports = router;