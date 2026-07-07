const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createProjectValidation,
  updateProjectValidation,
  assignProjectMembersValidation,
} = require('../validation/projectValidation');

router.get('/', protect, projectController.getProjects);
router.get('/:id', protect, projectController.getProjectById);
router.post('/', protect, authorize('Manager'), createProjectValidation, projectController.createProject);
router.put('/:id', protect, authorize('Manager'), updateProjectValidation, projectController.updateProject);
router.delete('/:id', protect, authorize('Manager'), projectController.deleteProject);
router.post('/:id/members', protect, authorize('Manager'), assignProjectMembersValidation, projectController.assignMembers);

module.exports = router;