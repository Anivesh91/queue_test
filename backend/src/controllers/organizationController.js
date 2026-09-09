const organizationService = require('../services/organizationService');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const searchOrganizations = asyncHandler(async (req, res) => {
  const { search, category, city } = req.query;
  const organizations = await organizationService.searchOrganizations({ search, category, city });
  res.status(200).json(new ApiResponse(200, { organizations }, 'Organizations fetched successfully'));
});

const getOrganizationBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const organization = await organizationService.getOrganizationBySlug(slug);
  res.status(200).json(new ApiResponse(200, { organization }, 'Organization details fetched successfully'));
});

const createOrganization = asyncHandler(async (req, res) => {
  const org = await organizationService.createOrganization(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, { organization: org }, 'Organization created successfully'));
});

const getOwnerOrganization = asyncHandler(async (req, res) => {
  const organization = await organizationService.getOwnerOrganization(req.user._id);
  res.status(200).json(new ApiResponse(200, { organization }, 'Owner organization fetched successfully'));
});

const updateOrganization = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const organization = await organizationService.updateOrganization(req.user._id, organizationId, req.body);
  res.status(200).json(new ApiResponse(200, { organization }, 'Organization updated successfully'));
});

module.exports = {
  searchOrganizations,
  getOrganizationBySlug,
  createOrganization,
  getOwnerOrganization,
  updateOrganization,
};
