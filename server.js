const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 4000;
const dbPath = path.join(__dirname, 'registrations.json');
const publicDir = path.join(__dirname, 'public');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(publicDir));

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

function readRegistrations() {
  try {
    if (!fs.existsSync(dbPath)) return [];
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRegistrations(items) {
  fs.writeFileSync(dbPath, JSON.stringify(items, null, 2), 'utf8');
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: '@nu gaming backend' });
});

app.get('/api/config', (_req, res) => {
  const nextTournamentAt = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();

  res.json({
    projectName: '@nu gaming',
    nextTournamentAt,
    stats: {
      players: '2500+',
      teams: '200+',
      tournaments: '75+',
      prizePool: '₹5L+'
    }
  });
});

app.post('/api/register', (req, res) => {
  const { squadName, captainUid, email, message = '' } = req.body || {};

  if (!squadName || !captainUid || !email) {
    return res.status(400).json({ message: 'squadName, captainUid, and email are required' });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ message: 'Email format is invalid' });
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

  return res.status(201).json({ message: 'Registration saved', data: row });
});

app.get('/api/registrations', (_req, res) => {
  const rows = readRegistrations();
  res.json({ count: rows.length, data: rows });
});

app.get('/api/public/pro-players', async (_req, res) => {
  try {
    // OpenDota is listed in public-apis and provides free esports player/team data.
    const data = await getJson('https://api.opendota.com/api/proPlayers');
    const top = Array.isArray(data) ? data.slice(0, 8) : [];
    res.json({ source: 'OpenDota', data: top });
  } catch (err) {
    res.status(502).json({ message: 'Failed to fetch pro players', error: err.message });
  }
});

app.get('/api/public/steam-news', async (_req, res) => {
  try {
    // Steam News API is public and returns update headlines for CS2 app id 730.
    const data = await getJson('https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=730&count=6&maxlength=120&format=json');
    const items = data?.appnews?.newsitems || [];
    res.json({ source: 'Steam', data: items });
  } catch (err) {
    res.status(502).json({ message: 'Failed to fetch Steam news', error: err.message });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`@nu gaming backend running on http://localhost:${PORT}`);
});
