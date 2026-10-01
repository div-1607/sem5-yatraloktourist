const User = require('../models/User');

const ADMIN_EMAIL = 'div160706@gmail.com';

const ensureAdminAccount = async () => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('[Admin Setup] ADMIN_PASSWORD is not configured; administrator provisioning skipped.');
    return false;
  }

  if (password.length < 6) {
    throw new Error('ADMIN_PASSWORD must be at least 6 characters.');
  }

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = new User({
      name: 'YatraLok Administrator',
      email: ADMIN_EMAIL,
      age: 18,
      gender: 'Other',
      mobile: '0000000000',
      city: 'New Delhi',
      address: 'YatraLok Administration',
    });
  }

  admin.password = password;
  admin.role = 'admin';
  admin.isVerified = true;
  admin.isActive = true;
  admin.otp = { code: null, expiresAt: null };
  await admin.save();

  console.info('[Admin Setup] Administrator account provisioned.', { email: ADMIN_EMAIL });
  return true;
};

module.exports = { ensureAdminAccount };