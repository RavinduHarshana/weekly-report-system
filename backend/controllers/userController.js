const User = require('../models/User');

exports.getTeamMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'Team Member' })
      .select('name email role createdAt')
      .sort({ name: 1 });

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};