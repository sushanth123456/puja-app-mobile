const twilio = require('twilio');
const config = require('../config');

const twilioReady =
  Boolean(config.twilioAccountSid) &&
  Boolean(config.twilioAuthToken) &&
  Boolean(config.twilioVerifyServiceSid);

const client = twilioReady ? twilio(config.twilioAccountSid, config.twilioAuthToken) : null;

async function sendOtpSms(phone, otpCode) {
  if (twilioReady && client) {
    await client.messages.create({
      body: `Your PujaConnect OTP is ${otpCode}. Valid for ${config.otpTtlMinutes} minutes.`,
      to: `+91${phone}`,
      messagingServiceSid: config.twilioVerifyServiceSid,
    });
    return;
  }
  if (config.nodeEnv === 'production') {
    const error = new Error('SMS provider not configured.');
    error.statusCode = 500;
    throw error;
  }
  // Development fallback for local testing.
  // eslint-disable-next-line no-console
  console.log(`[DEV OTP] phone=${phone} code=${otpCode}`);
}

module.exports = { sendOtpSms };
