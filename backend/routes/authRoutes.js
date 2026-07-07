const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, adminRegisterValidation } = require('../validation/authValidation');
const { protect, authorize } = require('../middleware/authMiddleware');

// POST: /api/auth/register
router.post('/register', registerValidation, authController.registerUser);

// POST: /api/auth/register-admin
router.post('/register-admin', protect, authorize('Manager'), adminRegisterValidation, authController.registerUserByAdmin);

// POST: /api/auth/login
router.post('/login', loginValidation, authController.loginUser);

// GET: /api/auth/me
router.get('/me', protect, authController.getMe);

module.exports = router;