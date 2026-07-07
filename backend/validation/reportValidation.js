const { body } = require('express-validator');

exports.createReportValidation = [
  body('startDate', 'Start date is required').isISO8601(),
  body('endDate', 'End date is required').isISO8601(),
  body('weekDateRange', 'Week Date Range is required').not().isEmpty(),
  body('projectId', 'Project ID is required').not().isEmpty(),
  body('tasksCompleted', 'Tasks Completed is required').not().isEmpty(),
  body('tasksPlanned', 'Tasks Planned is required').not().isEmpty(),
  body('blockers', 'Blockers field is required').not().isEmpty(),
  body('status', 'Invalid status').optional().isIn(['late', 'pending', 'submitted']),
  body('hoursWorked', 'Hours worked must be a number').optional().isNumeric(),
  body('notes', 'Notes must be a string').optional().isString()
];

exports.updateReportValidation = [
  body('startDate', 'Start date must be valid').optional().isISO8601(),
  body('endDate', 'End date must be valid').optional().isISO8601(),
  body('weekDateRange', 'Week Date Range must be a string').optional().isString(),
  body('projectId', 'Project ID must be valid').optional().not().isEmpty(),
  body('tasksCompleted', 'Tasks Completed must be a string').optional().isString(),
  body('tasksPlanned', 'Tasks Planned must be a string').optional().isString(),
  body('blockers', 'Blockers must be a string').optional().isString(),
  body('status', 'Invalid status').optional().isIn(['late', 'pending', 'submitted']),
  body('hoursWorked', 'Hours worked must be a number').optional().isNumeric(),
  body('notes', 'Notes must be a string').optional().isString()
];