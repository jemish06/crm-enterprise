const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTUtil {
  // Generate access token
  generateAccessToken(userId, tenantId) {
    return jwt.sign(
      { userId, tenantId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  // Generate refresh token
  generateRefreshToken(userId, tenantId) {
    return jwt.sign(
      { userId, tenantId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Generate password reset token
  generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    return { resetToken, hashedToken };
  }

  // Hash token for comparison
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = new JWTUtil();
