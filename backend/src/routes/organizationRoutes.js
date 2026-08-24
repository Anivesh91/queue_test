const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const serviceController = require('../controllers/serviceController');
const { protectOwner } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  createOrgValidator,
  updateOrgValidator,
  createServiceValidator,
  mongoIdParamValidator,
} = require('../validators/schemas');

// Public search
router.get('/', organizationController.searchOrganizations);

// Owner's organization
router.get('/me', protectOwner, organizationController.getOwnerOrganization);

// Public single org by slug
router.get('/:slug', organizationController.getOrganizationBySlug);

// Owner create organization
router.post('/', protectOwner, createOrgValidator, validate, organizationController.createOrganization);

// Owner update organization
router.patch('/:organizationId', protectOwner, updateOrgValidator, validate, organizationController.updateOrganization);

// Services under organization
router.get('/:organizationId/services', mongoIdParamValidator('organizationId'), validate, serviceController.getOrganizationServices);
router.post('/:organizationId/services', protectOwner, createServiceValidator, validate, serviceController.createService);

module.exports = router;
