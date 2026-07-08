const express = require('express');
const router = express.Router();
const { getMonthlyReport, getClassReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/monthly', protect, authorize('admin', 'teacher'), getMonthlyReport);
router.get('/class/:classId', protect, authorize('admin', 'teacher'), getClassReport);

module.exports = router;
