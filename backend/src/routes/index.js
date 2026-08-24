const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const organizationRoutes = require('./organizationRoutes');
const serviceRoutes = require('./serviceRoutes');
const ticketRoutes = require('./ticketRoutes');
const ownerRoutes = require('./ownerRoutes');
const ApiResponse = require('../utils/apiResponse');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'UP',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      'QueueLess API is healthy and operational'
    )
  );
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/services', serviceRoutes);
router.use('/tickets', ticketRoutes);
router.use('/owner', ownerRoutes);

module.exports = router;
