const { json, readBody, readRegistrations, writeRegistrations } = require('./_lib');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { message: 'Method not allowed' });
  }

  const body = await readBody(req);
  const { squadName, captainUid, email, message = '' } = body || {};

  if (!squadName || !captainUid || !email) {
    return json(res, 400, { message: 'squadName, captainUid, and email are required' });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
  if (!emailOk) {
    return json(res, 400, { message: 'Email format is invalid' });
  }

  const registrations = readRegistrations();
  const row = {
    id: `REG-${Date.now()}`,
    squadName: String(squadName).trim(),
    captainUid: String(captainUid).trim(),
    email: String(email).trim().toLowerCase(),
    message: String(message).trim(),
    createdAt: new Date().toISOString()
  };

  registrations.push(row);
  writeRegistrations(registrations);

  return json(res, 201, { message: 'Registration saved', data: row });
};