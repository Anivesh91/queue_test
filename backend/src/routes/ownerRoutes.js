const express = require('express');
const router = express.Router();
const ownerDashboardController = require('../controllers/ownerDashboardController');
const { protectOwner } = require('../middlewares/authMiddleware');

router.get('/dashboard', protectOwner, ownerDashboardController.getOwnerDashboard);

module.exports = router;
