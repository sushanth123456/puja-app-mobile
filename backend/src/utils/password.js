const bcrypt = require('bcryptjs');

const ROUNDS = 12;

async function hashSecret(value) {
  return bcrypt.hash(value, ROUNDS);
}

async function compareSecret(value, hash) {
  return bcrypt.compare(value, hash);
}

module.exports = { hashSecret, compareSecret };
