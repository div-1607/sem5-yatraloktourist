const getSafeProviderMessage = (message, secrets = []) => {
  let safeMessage = String(message || '').slice(0, 500);
  for (const secret of secrets) {
    if (secret) safeMessage = safeMessage.split(String(secret)).join('[REDACTED]');
  }
  return safeMessage.replace(/\b\d{6}\b/g, '[REDACTED]');
};

const sendBrevoEmail = async ({ to, subject, html, text, privateValues = [] }) => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'YatraLok';

  if (!apiKey || !senderEmail) {
    console.error('[Brevo Email] Configuration missing.', {
      apiKeyConfigured: Boolean(apiKey),
      senderConfigured: Boolean(senderEmail),
    });
    throw new Error('Brevo email configuration is incomplete.');
  }

  let response;
  try {
    response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });
  } catch (error) {
    console.error('[Brevo Email] Request failed before receiving a response.', {
      name: error.name,
      code: error.code || null,
    });
    throw new Error('Brevo email request failed.');
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.messageId) {
    console.error('[Brevo Email] Provider rejected delivery.', {
      statusCode: response.status,
      code: result?.code || null,
      message: getSafeProviderMessage(result?.message, [apiKey, to, ...privateValues]),
    });
    throw new Error('Brevo rejected the email request.');
  }

  console.info('[Brevo Email] Provider accepted delivery.', { statusCode: response.status });
  return { id: result.messageId };
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
 * @throws {Error} when no provider accepts the OTP email
 */
const sendOTPEmail = async (to, otp, purpose = 'signup') => {
  const subject =
    purpose === 'signup'
      ? '🗺️ Yatra Lok — Verify Your Tourist Account'
      : '🔑 Yatra Lok — Password Reset OTP';
  await sendBrevoEmail({
    to,
    subject,
    html: buildOtpHtml(otp, purpose),
    privateValues: [otp],
  });
  return true;
};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const sendJourneyEmail = async (to, trip, recipientName) => {
  const dateLabel = (value) => value
    ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not scheduled';

  let nextDay = 1;
  const stops = (trip.waypoints || []).map((waypoint, index) => {
    const destination = waypoint.destination && typeof waypoint.destination === 'object' ? waypoint.destination : null;
    const arrivalDate = waypoint.arrivalTime ? new Date(waypoint.arrivalTime) : null;
    const tripStart = trip.startDate ? new Date(trip.startDate) : null;
    const calculatedDay = arrivalDate && tripStart
      ? Math.max(1, Math.floor((arrivalDate - tripStart) / 86400000) + 1)
      : nextDay;
    const stayDays = Math.max(1, Number(waypoint.stayDurationDays || 1));
    const lastDay = calculatedDay + stayDays - 1;
    nextDay = lastDay + 1;
    const dayLabel = calculatedDay === lastDay ? `Day ${calculatedDay}` : `Days ${calculatedDay}–${lastDay}`;
    const name = escapeHtml(destination?.title || waypoint.name || `Stop ${index + 1}`);
    const location = escapeHtml([destination?.city, destination?.state].filter(Boolean).join(', '));
    const activities = (waypoint.activities || []).map(escapeHtml).join(', ') || 'No activities added';
    const tags = (destination?.tags || []).slice(0, 4).map(escapeHtml).join(' · ');
    const crowd = destination?.crowdStatus
      ? `${escapeHtml(destination.crowdStatus)} · ${Number(destination.crowdPercentage || 0)}% YatraLok estimate`
      : 'Not available';
    const bestTime = escapeHtml(destination?.bestTimeToVisit || 'Not available');
    const timings = escapeHtml(destination?.timings || 'Not available');
    const safeStatus = escapeHtml(waypoint.status || 'pending');
    const html = `<tr><td style="padding:0 0 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1d32;border:1px solid #203955;border-radius:12px"><tr><td style="padding:20px"><p style="margin:0 0 8px;color:#8bbfe8;font-size:12px;letter-spacing:1px;text-transform:uppercase">${dayLabel} · Stop ${index + 1}</p><h2 style="margin:0;color:#f4f8fc;font-size:20px;line-height:1.3">${name}</h2><p style="margin:5px 0 16px;color:#a9bbcd;font-size:14px">${location || 'Location not specified'}</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:13px"><strong style="color:#f4f8fc">Arrival:</strong> ${escapeHtml(dateLabel(waypoint.arrivalTime))}</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:13px"><strong style="color:#f4f8fc">Departure:</strong> ${escapeHtml(dateLabel(waypoint.departureTime))}</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:13px"><strong style="color:#f4f8fc">Stay:</strong> ${stayDays} day(s) · <strong style="color:#f4f8fc">Status:</strong> ${safeStatus}</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:13px"><strong style="color:#f4f8fc">Planned activities:</strong> ${activities}</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:13px"><strong style="color:#f4f8fc">Best time:</strong> ${bestTime} · <strong style="color:#f4f8fc">Hours:</strong> ${timings}</p><p style="margin:0;color:#d8e2ed;font-size:13px"><strong style="color:#f4f8fc">Crowd:</strong> ${crowd}</p>${tags ? `<p style="margin:10px 0 0;color:#8bbfe8;font-size:12px">Recommended: ${tags}</p>` : ''}</td></tr></table></td></tr>`;
    const text = `${dayLabel} · Stop ${index + 1}: ${destination?.title || waypoint.name || `Stop ${index + 1}`} ${location}\nArrival: ${dateLabel(waypoint.arrivalTime)}\nDeparture: ${dateLabel(waypoint.departureTime)}\nStay: ${stayDays} day(s)\nStatus: ${waypoint.status || 'pending'}\nPlanned activities: ${(waypoint.activities || []).join(', ') || 'No activities added'}\nBest time: ${destination?.bestTimeToVisit || 'Not available'}\nOpening hours: ${destination?.timings || 'Not available'}\nCrowd: ${destination?.crowdStatus ? `${destination.crowdStatus} (${destination.crowdPercentage ?? 0}% YatraLok estimate)` : 'Not available'}${tags ? `\nRecommendations: ${(destination.tags || []).slice(0, 4).join(', ')}` : ''}`;
    return { html, text };
  });

  const totalDays = trip.startDate && trip.endDate
    ? Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000))
    : 0;
  const safeTitle = escapeHtml(trip.title || 'Your journey');
  const safeName = escapeHtml(recipientName || 'Traveler');
  const safeStart = escapeHtml(dateLabel(trip.startDate));
  const safeEnd = escapeHtml(dateLabel(trip.endDate));
  const safeOrigin = escapeHtml(trip.startingLocation || 'Not specified');
  const safeStyle = escapeHtml(trip.tripType || 'solo');
  const subject = `YatraLok journey plan: ${String(trip.title || 'Your journey').replace(/[\r\n]/g, ' ').slice(0, 100)}`;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark"></head><body style="margin:0;background:#050d18;color:#e6edf5;font-family:Arial,Helvetica,sans-serif"><div style="display:none;max-height:0;overflow:hidden;opacity:0">Your ${escapeHtml(trip.title || 'YatraLok')} itinerary is ready.</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050d18;padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#091526;border:1px solid #1e3550;border-radius:18px;overflow:hidden"><tr><td style="padding:28px 28px 24px;background:linear-gradient(135deg,#102846,#0a1728);border-bottom:1px solid #28445f"><p style="margin:0;color:#8bc9ef;font-size:12px;font-weight:700;letter-spacing:2px">YATRALOK <span style="color:#e5bc7a">· JOURNEY PLANNER</span></p><h1 style="margin:16px 0 6px;color:#f7fafc;font-size:28px;line-height:1.2">${safeTitle}</h1><p style="margin:0;color:#afc0d1;font-size:14px">Prepared for ${safeName} (${escapeHtml(to)})</p></td></tr><tr><td style="padding:24px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d1d32;border:1px solid #203955;border-radius:12px"><tr><td style="padding:18px 20px"><p style="margin:0 0 8px;color:#8bbfe8;font-size:12px;text-transform:uppercase;letter-spacing:1px">Journey overview</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:14px"><strong style="color:#f4f8fc">Dates:</strong> ${safeStart} – ${safeEnd} · ${totalDays} day(s)</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:14px"><strong style="color:#f4f8fc">Starting point:</strong> ${safeOrigin}</p><p style="margin:0 0 7px;color:#d8e2ed;font-size:14px"><strong style="color:#f4f8fc">Travel style:</strong> ${safeStyle} · <strong style="color:#f4f8fc">Travelers:</strong> ${Number(trip.travelerCount || 1)}</p>${trip.description ? `<p style="margin:0;color:#d8e2ed;font-size:14px"><strong style="color:#f4f8fc">Trip notes:</strong> ${escapeHtml(trip.description)}</p>` : ''}</td></tr></table><h2 style="margin:28px 0 14px;color:#f4f8fc;font-size:18px">Your itinerary <span style="color:#91a8bf;font-size:14px;font-weight:400">· ${stops.length} destination(s)</span></h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${stops.map((stop) => stop.html).join('')}</table><p style="margin:14px 0 0;padding:14px 16px;background:#10233a;border-left:3px solid #d7ad70;border-radius:8px;color:#b9c8d7;font-size:12px;line-height:1.6">Crowd details are YatraLok platform estimates, not verified real-world headcounts. Weather, road conditions and transit-time information may not be available; confirm local conditions before departure.</p></td></tr><tr><td style="padding:18px 28px;border-top:1px solid #1e3550;color:#7f94aa;font-size:12px;line-height:1.6">This journey plan was requested from your YatraLok account for ${escapeHtml(to)}.<br>Travel thoughtfully. Explore safely.</td></tr></table></td></tr></table></body></html>`;
  const text = `${trip.title || 'Your YatraLok journey'}\nPrepared for ${recipientName || 'Traveler'} (${to})\n\nJourney overview\nDates: ${dateLabel(trip.startDate)} – ${dateLabel(trip.endDate)} (${totalDays} days)\nStarting point: ${trip.startingLocation || 'Not specified'}\nTravel style: ${trip.tripType || 'solo'} · Travelers: ${Number(trip.travelerCount || 1)}\n${trip.description ? `Trip notes: ${trip.description}\n` : ''}\n${stops.map((stop) => stop.text).join('\n\n')}\n\nCrowd details are YatraLok platform estimates, not verified real-world headcounts. Confirm local weather, road and transit information before departure.`;

  const result = await sendBrevoEmail({ to, subject, text, html });
  return { id: result.id, deliveredTo: to };
};

module.exports = { sendOTPEmail, sendJourneyEmail };
