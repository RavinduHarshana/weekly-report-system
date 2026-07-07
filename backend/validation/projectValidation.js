const { body } = require('express-validator');

exports.createProjectValidation = [
  body('name', 'Project name is required').not().isEmpty(),
  body('description', 'Description must be a string').optional().isString(),
  body('assignedMembers', 'Assigned members must be an array').optional().isArray(),
];

exports.updateProjectValidation = [
  body('name', 'Project name must be a string').optional().isString(),
  body('description', 'Description must be a string').optional().isString(),
];

exports.assignProjectMembersValidation = [
  body('memberIds', 'memberIds must be an array').isArray({ min: 1 }),
];