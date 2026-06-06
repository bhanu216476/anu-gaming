const { json } = require('../_lib');

const fallback = [
  { name: 'LineDOTA2', team_name: 'TRIES', country_code: 'us' },
  { name: 'Newsham', team_name: 'Fart Studios', country_code: 'us' },
  { name: 'Shindaqq', team_name: 'SHADOW GOVERNMENT', country_code: 'gb' }
];

module.exports = async function handler(_req, res) {
  try {
    const response = await fetch('https://api.opendota.com/api/proPlayers');
    if (!response.ok) throw new Error(`OpenDota status ${response.status}`);
    const data = await response.json();
    json(res, 200, { source: 'OpenDota', data: Array.isArray(data) ? data.slice(0, 8) : fallback });
  } catch (error) {
    json(res, 200, { source: 'OpenDota', fallback: true, data: fallback, error: error.message });
  }
};