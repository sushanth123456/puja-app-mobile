const { OAuth2Client } = require('google-auth-library');
const appleSigninAuth = require('apple-signin-auth');
const config = require('../config');

const googleClient = config.googleClientId ? new OAuth2Client(config.googleClientId) : null;

async function verifyGoogleIdToken(idToken) {
  if (!googleClient || !config.googleClientId) {
    const error = new Error('Google OAuth is not configured.');
    error.statusCode = 500;
    throw error;
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: config.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    const error = new Error('Invalid Google token payload.');
    error.statusCode = 401;
    throw error;
  }
  return {
    email: payload.email.toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    subject: payload.sub,
  };
}

async function verifyAppleIdentityToken(identityToken) {
  const audience = config.appleServiceId || config.appleBundleId;
  if (!audience) {
    const error = new Error('Apple OAuth is not configured.');
    error.statusCode = 500;
    throw error;
  }

  const payload = await appleSigninAuth.verifyIdToken(identityToken, {
    audience,
    ignoreExpiration: false,
  });

  if (!payload || !payload.email) {
    const error = new Error('Invalid Apple token payload.');
    error.statusCode = 401;
    throw error;
  }

  return {
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
    subject: payload.sub,
  };
}

module.exports = { verifyGoogleIdToken, verifyAppleIdentityToken };
