const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} id - User ID
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'yatralok_super_secret_jwt_key_2026_987654321',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = { generateToken };
