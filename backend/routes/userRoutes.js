const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/team-members', protect, authorize('Manager'), userController.getTeamMembers);

module.exports = router;