const User = require('../models/user');

/**
 * Ensures at least one admin account exists.
 * Runs once on every server start — idempotent (no-op if an admin already exists).
 * Credentials come from env vars so they aren't hardcoded in source.
 */
const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) return;

    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@sms.local';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';

    await User.create({
      name: 'Super Admin',
      email,
      password, // hashed automatically by the User pre('save') hook
      role: 'admin'
    });

    console.log('========================================');
    console.log(' Default Super Admin account created');
    console.log(` Email:    ${email}`);
    console.log(` Password: ${password}`);
    console.log(' >>> Log in and change this password immediately <<<');
    console.log('========================================');
  } catch (error) {
    console.error('Super admin seed failed:', error.message);
  }
};

module.exports = seedSuperAdmin;