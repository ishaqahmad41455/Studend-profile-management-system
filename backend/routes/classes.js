const express = require('express');
const router = express.Router();
const { getClasses, getClass, createClass, updateClass, deleteClass } = require('../controllers/classController');
const auth = require('../middleware/auth');

router.route('/')
  .get(auth.protect, getClasses)
  .post(auth.protect, auth.authorize('admin'), createClass);

router.route('/:id')
  .get(auth.protect, getClass)
  .put(auth.protect, auth.authorize('admin'), updateClass)
  .delete(auth.protect, auth.authorize('admin'), deleteClass);

module.exports = router;