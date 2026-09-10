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

router.get('/', organizationController.searchOrganizations);
router.get('/me', protectOwner, organizationController.getOwnerOrganization);
router.get('/:slug', organizationController.getOrganizationBySlug);
router.post('/', protectOwner, createOrgValidator, validate, organizationController.createOrganization);
router.patch('/:organizationId', protectOwner, updateOrgValidator, validate, organizationController.updateOrganization);

router.get('/:organizationId/services', mongoIdParamValidator('organizationId'), validate, serviceController.getOrganizationServices);
router.post('/:organizationId/services', protectOwner, createServiceValidator, validate, serviceController.createService);

module.exports = router;
