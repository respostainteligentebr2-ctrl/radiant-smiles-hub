const { google } = require('googleapis');

const KEYFILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const hasKeyFile = typeof KEYFILE === 'string' && KEYFILE.length > 0;
const hasEnvKey = typeof SERVICE_ACCOUNT_EMAIL === 'string' && SERVICE_ACCOUNT_EMAIL.length > 0 && typeof PRIVATE_KEY === 'string' && PRIVATE_KEY.length > 0;

function getScopes(defaultScopes) {
  if (typeof process.env.GOOGLE_AUTH_SCOPES === 'string' && process.env.GOOGLE_AUTH_SCOPES.trim().length > 0) {
    return process.env.GOOGLE_AUTH_SCOPES.split(',').map((scope) => scope.trim()).filter(Boolean);
  }
  return defaultScopes;
}

function isConfigured() {
  return hasKeyFile || hasEnvKey;
}

async function getAuthClient(defaultScopes) {
  const scopes = getScopes(defaultScopes);

  if (hasKeyFile) {
    return new google.auth.GoogleAuth({
      keyFile: KEYFILE,
      scopes,
    });
  }

  if (hasEnvKey) {
    return new google.auth.JWT(
      SERVICE_ACCOUNT_EMAIL,
      undefined,
      PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes,
    );
  }

  throw new Error('Google auth is not configured. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY.');
}

module.exports = {
  getAuthClient,
  isConfigured,
};
