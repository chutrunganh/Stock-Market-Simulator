const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middlewares/authMiddleware');

// Routes accessible by all authenticated users
// The request from client must first pass through the verifyToken middleware 
// before reaching the route handler
// See these middleware functions in app/backend/src/middlewares/authMiddleware.js
router.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User profile retrieved',
        data: req.user
    });
});

// Routes for managers and above
// The request from client must first pass through the verifyToken, authorize middleware 
// before reaching the route handler
router.get('/manager-dashboard', verifyToken, authorize(['manager', 'admin']), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Manager dashboard accessed successfully'
    });
});

// Routes for admins only
router.get('/admin-dashboard', verifyToken, authorize('admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin dashboard accessed successfully'
    });
});

module.exports = router;
