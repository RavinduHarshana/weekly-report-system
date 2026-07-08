require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedManager() {
  const { MANAGER_NAME, MANAGER_EMAIL, MANAGER_PASSWORD } = process.env;

  if (!MANAGER_NAME || !MANAGER_EMAIL || !MANAGER_PASSWORD) {
    throw new Error('MANAGER_NAME, MANAGER_EMAIL, and MANAGER_PASSWORD are required');
  }

  await connectDB();

  const existingManager = await User.findOne({ email: MANAGER_EMAIL });
  if (existingManager) {
    console.log('Manager account already exists:', MANAGER_EMAIL);
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(MANAGER_PASSWORD, salt);

  await User.create({
    name: MANAGER_NAME,
    email: MANAGER_EMAIL,
    password: hashedPassword,
    role: 'Manager',
  });

  console.log('Manager account created successfully:', MANAGER_EMAIL);
  process.exit(0);
}

seedManager().catch((error) => {
  console.error('Failed to seed manager account:', error.message);
  process.exit(1);
});