const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createReportValidation, updateReportValidation } = require('../validation/reportValidation');

// Create Report Route - Only logged-in users
router.post('/create', protect, createReportValidation, reportController.createReport);

// Get All Reports Route - ONLY Managers can view all reports
router.get('/all', protect, authorize('Manager'), reportController.getAllReports);

// Manager dashboard summary
router.get('/summary/dashboard', protect, authorize('Manager'), reportController.getDashboardSummary);

// Team member own history
router.get('/mine', protect, reportController.getMyReports);

// Single report view for owner or manager
router.get('/:id', protect, reportController.getReportById);

// Edit report
router.put('/:id', protect, updateReportValidation, reportController.editReport);

// Submit report
router.post('/:id/submit', protect, reportController.submitReport);

module.exports = router;