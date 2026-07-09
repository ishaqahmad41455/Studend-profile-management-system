const express = require('express');
const router = express.Router();
const { createUser, getTeachers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), createUser);
router.get('/teachers', protect, authorize('admin'), getTeachers);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;