const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminController = require('./admin.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

// Admin Login
router.post('/login',
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    adminController.loginAdmin
);

// Get Admin Profile
router.get('/profile',
    authMiddleware.authAdmin,
    adminController.getAdminProfile
);

// Dashboard Statistics
router.get('/dashboard/stats',
    authMiddleware.authAdmin,
    adminController.getDashboardStats
);

// User Management
router.get('/users',
    authMiddleware.authAdmin,
    adminController.getAllUsers
);

router.delete('/users/:userId',
    authMiddleware.authAdmin,
    adminController.deleteUser
);

// Captain Management
router.get('/captains',
    authMiddleware.authAdmin,
    adminController.getAllCaptains
);

router.delete('/captains/:captainId',
    authMiddleware.authAdmin,
    adminController.deleteCaptain
);

router.patch('/captains/:captainId/status',
    authMiddleware.authAdmin,
    body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
    adminController.updateCaptainStatus
);

// Ride Management
router.get('/rides',
    authMiddleware.authAdmin,
    adminController.getAllRides
);

module.exports = router;
