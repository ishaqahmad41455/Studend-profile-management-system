const Profile = require('../models/Profile');
const User = require('../models/user');

// @desc    Get all profiles
// @route   GET /api/profiles
// @access  Private (Admin)
const getProfiles = async (req, res) => {
  try {
    const { search } = req.query;

    let profiles = await Profile.find().populate('user', 'name email role');

    if (search) {
      const lower = search.toLowerCase();
      profiles = profiles.filter(p =>
        p.user?.name?.toLowerCase().includes(lower) ||
        p.rollNumber?.toLowerCase().includes(lower) ||
        p.class?.toLowerCase().includes(lower)
      );
    }

    res.json({ success: true, count: profiles.length, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my profile
// @route   GET /api/profiles/my
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', 'name email role');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create one.' });
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create profile
// @route   POST /api/profiles
// @access  Private (Student)
const createProfile = async (req, res) => {
  try {
    const existing = await Profile.findOne({ user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Profile already exists. Use PUT to update.' });
    }

    const profile = await Profile.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/profiles/:id
// @access  Private
const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Students can only update their own profile
    if (req.user.role === 'student' && profile.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email role');

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete profile
// @route   DELETE /api/profiles/:id
// @access  Private (Admin)
const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfiles, getMyProfile, createProfile, updateProfile, deleteProfile };
