const { json } = require('../_lib');

const fallback = [
  { title: 'Counter-Strike 2 Update', date: Math.floor(Date.now() / 1000) },
  { title: 'IEM Cologne 2026', date: Math.floor((Date.now() - 86400000) / 1000) }
];

module.exports = async function handler(_req, res) {
  try {
    const response = await fetch('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=6&maxlength=120&format=json');
    if (!response.ok) throw new Error(`Steam status ${response.status}`);
    const data = await response.json();
    const items = data?.appnews?.newsitems || fallback;
    json(res, 200, { source: 'Steam', data: items });
  } catch (error) {
    json(res, 200, { source: 'Steam', fallback: true, data: fallback, error: error.message });
  }
};