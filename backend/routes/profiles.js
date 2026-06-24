const express = require('express');
const router = express.Router();
const { getProfiles, getMyProfile, createProfile, updateProfile, deleteProfile } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, getMyProfile);

router.route('/')
  .get(protect, authorize('admin'), getProfiles)
  .post(protect, createProfile);

router.route('/:id')
  .put(protect, updateProfile)
  .delete(protect, authorize('admin'), deleteProfile);

module.exports = router;
