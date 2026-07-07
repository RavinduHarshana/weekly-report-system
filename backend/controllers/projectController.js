const Project = require('../models/Project');
const User = require('../models/User');
const { validationResult } = require('express-validator');

async function resolveAssignedMembers(memberIds = []) {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return [];
  }

  const validMembers = await User.find({ _id: { $in: memberIds }, role: 'Team Member' }).select('_id');
  return validMembers.map((member) => member._id);
}

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('assignedMembers', 'name email role').sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('assignedMembers', 'name email role');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const assignedMembers = await resolveAssignedMembers(req.body.assignedMembers);

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      assignedMembers,
    });

    const populated = await project.populate('assignedMembers', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const assignedMembers = await resolveAssignedMembers(req.body.assignedMembers);

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        assignedMembers,
      },
      { new: true },
    ).populate('assignedMembers', 'name email role');

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignMembers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { memberIds } = req.body;
    const validMembers = await User.find({ _id: { $in: memberIds }, role: 'Team Member' }).select('_id');

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { assignedMembers: validMembers.map((member) => member._id) },
      { new: true },
    ).populate('assignedMembers', 'name email role');

    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};