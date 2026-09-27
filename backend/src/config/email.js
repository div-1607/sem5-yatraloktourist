const nodemailer = require('nodemailer');

/**
 * Build nodemailer transporter
 * Priority: Gmail App Password > Custom SMTP > Console-only fallback
 */
const getTransporter = async () => {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpService = process.env.SMTP_SERVICE?.trim()?.toLowerCase();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 587;

  // ─── 1. Gmail via App Password ─────────────────────────────────────────────
  if (smtpUser && smtpPass && (smtpService === 'gmail' || smtpUser.endsWith('@gmail.com'))) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
    });

    // Verify credentials once
    try {
      await transporter.verify();
      console.log(`[Email] ✅ Gmail SMTP ready — sending from: ${smtpUser}`);
      return transporter;
    } catch (err) {
      console.error(`[Email] ❌ Gmail SMTP verification FAILED: ${err.message}`);
      console.error(`[Email]    → Check that SMTP_PASS is your 16-char App Password, NOT your Google account password.`);
      console.error(`[Email]    → Generate App Password at: https://myaccount.google.com/apppasswords`);
      // Fall through to custom SMTP / console fallback
    }
  }

  // ─── 2. Custom SMTP host ────────────────────────────────────────────────────
  if (smtpUser && smtpPass && smtpHost) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.verify();
      console.log(`[Email] ✅ Custom SMTP ready — host: ${smtpHost}:${smtpPort}`);
      return transporter;
    } catch (err) {
      console.error(`[Email] ❌ Custom SMTP verification FAILED: ${err.message}`);
    }
  }

  // ─── 3. No SMTP configured ─────────────────────────────────────────────────
  console.warn('[Email] ⚠️  No SMTP credentials configured. OTPs will be printed to server console only.');
  console.warn('[Email]    → To receive OTPs in your inbox, add SMTP_USER and SMTP_PASS to backend/.env');
  return null;
};

// Singleton transporter (initialised once, reused)
let _transporter = null;
let _transporterReady = false;

const initTransporter = async () => {
  if (_transporterReady) return _transporter;
  _transporter = await getTransporter();
  _transporterReady = true;
  return _transporter;
};

/**
 * Generate the HTML body for OTP emails
 */
const buildOtpHtml = (otp, purpose) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              background-color: #030B1A; color: #FFFFFF; padding: 40px 20px;
              border-radius: 16px; max-width: 540px; margin: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; padding: 12px 28px;
                  background: linear-gradient(135deg, #0A1F44 0%, #0E2A5C 100%);
                  border-radius: 12px; border: 1px solid rgba(245,158,11,0.4);">
        <h1 style="color: #F59E0B; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px;">YATRA LOK</h1>
      </div>
      <p style="color: #94A3B8; margin-top: 8px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
        Smart &amp; Safe Tourism Platform
      </p>
    </div>

    <!-- Body -->
    <div style="background-color: rgba(10,31,68,0.7); padding: 32px; border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.12); text-align: center;">
      <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0; font-weight: 700;">
        ${purpose === 'signup' ? '🎉 Welcome to Yatra Lok!' : '🔐 Password Reset Request'}
      </h2>
      <p style="color: #CBD5E1; font-size: 14px; line-height: 1.65; margin-bottom: 28px;">
        ${
          purpose === 'signup'
            ? 'Use the verification code below to activate your tourist account. This code is valid for <strong>10 minutes</strong>.'
            : 'Use the code below to reset your password. This code expires in <strong>10 minutes</strong>.'
        }
      </p>

      <!-- OTP Box -->
      <div style="display: inline-block; font-size: 42px; font-family: 'Courier New', monospace;
                  font-weight: 900; letter-spacing: 12px; color: #F59E0B;
                  padding: 16px 32px; background: rgba(245,158,11,0.10);
                  border-radius: 14px; border: 2px dashed #F59E0B; margin: 8px 0 28px 0;">
        ${otp}
      </div>

      <p style="color: #64748B; font-size: 12px; margin: 0;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 11px; line-height: 1.6;">
      <p style="margin: 0;">Tourist Helpline: <strong>1363</strong> &bull; Emergency: <strong>112</strong></p>
      <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} Yatra Lok. All rights reserved.</p>
    </div>
  </div>
`;

/**
 * Send OTP Email
 * @param {string} to        - Recipient email address
 * @param {string} otp       - 6-digit OTP code
 * @param {string} purpose   - 'signup' | 'forgot-password'
 * @returns {Promise<boolean>}
 */
const sendOTPEmail = async (to, otp, purpose = 'signup') => {
  const subject =
    purpose === 'signup'
      ? '🗺️ Yatra Lok — Verify Your Tourist Account'
      : '🔑 Yatra Lok — Password Reset OTP';

  // Always log to console (useful as backup if SMTP fails)
  console.log(`\n${'='.repeat(56)}`);
  console.log(`📧 [EMAIL SERVICE]  OTP for: ${to}`);
  console.log(`   Purpose : ${purpose}`);
  console.log(`   OTP Code: >>> ${otp} <<<  (valid 10 min)`);
  console.log(`${'='.repeat(56)}\n`);

  try {
    const transporter = await initTransporter();

    if (!transporter) {
      // No SMTP — OTP is visible in server logs only
      return true;
    }

    const fromAddress =
      process.env.EMAIL_FROM || `"Yatra Lok" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html: buildOtpHtml(otp, purpose),
    });

    console.log(`[Email] ✅ OTP email sent to ${to}  (MessageId: ${info.messageId})`);
    return true;
  } catch (err) {
    console.error(`[Email] ❌ Failed to send email to ${to}: ${err.message}`);
    console.error(`[Email]    OTP is available in the console log above — you can still test manually.`);
    // Non-fatal: registration still succeeds; user reads OTP from server logs
    return false;
  }
};

module.exports = { sendOTPEmail };
