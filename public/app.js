const API_BASE = window.location.origin;

const els = {
  players: document.getElementById('players'),
  teams: document.getElementById('teams'),
  tournaments: document.getElementById('tournaments'),
  prizePool: document.getElementById('prizePool'),
  countdownText: document.getElementById('countdownText'),
  proPlayers: document.getElementById('proPlayers'),
  steamNews: document.getElementById('steamNews'),
  registerForm: document.getElementById('registerForm'),
  formStatus: document.getElementById('formStatus'),
  refreshData: document.getElementById('refreshData'),
  ambientParticles: document.getElementById('ambientParticles'),
  ambientStreaks: document.getElementById('ambientStreaks'),
  ambientGradient: document.querySelector('.ambient-gradient'),
  ambientBeams: document.querySelector('.ambient-beams'),
  orbA: document.querySelector('.orb-a'),
  orbB: document.querySelector('.orb-b'),
  orbC: document.querySelector('.orb-c'),
  sections: [...document.querySelectorAll('.hero, .panel')]
};

let nextTournamentAt = null;

function initAmbientParticles() {
  if (!els.ambientParticles) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const count = window.innerWidth < 820 ? 18 : 34;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('span');
    dot.className = 'ambient-particle';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.setProperty('--dur', `${14 + Math.random() * 14}s`);
    dot.style.setProperty('--delay', `${Math.random() * -24}s`);
    fragment.appendChild(dot);
  }
  els.ambientParticles.appendChild(fragment);
}

function initAmbientStreaks() {
  if (!els.ambientStreaks) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const count = window.innerWidth < 820 ? 7 : 12;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const streak = document.createElement('span');
    streak.className = 'ambient-streak';
    streak.style.top = `${Math.random() * 85}%`;
    streak.style.left = `${-20 - Math.random() * 40}%`;
    streak.style.width = `${180 + Math.random() * 280}px`;
    streak.style.setProperty('--dur', `${8 + Math.random() * 10}s`);
    streak.style.setProperty('--delay', `${Math.random() * -18}s`);
    fragment.appendChild(streak);
  }
  els.ambientStreaks.appendChild(fragment);
}

function initSectionBursts() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !els.sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('sweep-live', 'pulse-live');
      setTimeout(() => {
        el.classList.remove('pulse-live');
      }, 700);
      setTimeout(() => {
        el.classList.remove('sweep-live');
      }, 1600);
      observer.unobserve(el);
    });
  }, { threshold: 0.28 });

  els.sections.forEach((section) => observer.observe(section));
}

function initAmbientParallax() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (els.ambientGradient) {
        els.ambientGradient.style.transform = `translate3d(0, ${Math.min(42, y * 0.04)}px, 0) rotate(${y * 0.01}deg)`;
      }
      if (els.ambientBeams) {
        els.ambientBeams.style.transform = `translate3d(0, ${Math.min(24, y * 0.03)}px, 0)`;
      }
      if (els.orbA) {
        els.orbA.style.transform = `translate3d(${Math.min(38, y * 0.02)}px, ${Math.min(28, y * 0.018)}px, 0)`;
      }
      if (els.orbB) {
        els.orbB.style.transform = `translate3d(${Math.max(-34, -y * 0.018)}px, ${Math.min(32, y * 0.02)}px, 0)`;
      }
      if (els.orbC) {
        els.orbC.style.transform = `translate3d(${Math.min(22, y * 0.012)}px, ${Math.max(-34, -y * 0.018)}px, 0)`;
      }
      ticking = false;
    });
  };

  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('mousemove', (e) => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const onFrame = () => {
    if (els.ambientBeams) {
      els.ambientBeams.style.filter = `blur(2px) hue-rotate(${pointerX * 6}deg)`;
    }
    if (els.orbA) {
      els.orbA.style.marginLeft = `${pointerX * 8}px`;
    }
    if (els.orbB) {
      els.orbB.style.marginTop = `${pointerY * 10}px`;
    }
    if (els.orbC) {
      els.orbC.style.marginLeft = `${pointerX * -6}px`;
    }
    requestAnimationFrame(onFrame);
  };

  requestAnimationFrame(onFrame);
}

function formatCountdown(targetIso) {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const d = Math.max(0, target - now);

  const days = Math.floor(d / (1000 * 60 * 60 * 24));
  const hours = Math.floor((d % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((d % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${mins}m ${secs}s`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function renderProPlayers(items) {
  els.proPlayers.innerHTML = '';
  if (!items.length) {
    els.proPlayers.innerHTML = '<li>No player data available.</li>';
    return;
  }

  items.forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.name || 'Unknown'}</strong><small>Team: ${p.team_name || 'N/A'} | Country: ${p.country_code || 'N/A'}</small>`;
    els.proPlayers.appendChild(li);
  });
}

function renderSteamNews(items) {
  els.steamNews.innerHTML = '';
  if (!items.length) {
    els.steamNews.innerHTML = '<li>No news data available.</li>';
    return;
  }

  items.forEach((n) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${n.title}</strong><small>${new Date(n.date * 1000).toLocaleDateString()}</small>`;
    els.steamNews.appendChild(li);
  });
}

async function loadAll() {
  const [config, proPlayers, steamNews] = await Promise.all([
    fetchJson(`${API_BASE}/api/config`),
    fetchJson(`${API_BASE}/api/public/pro-players`),
    fetchJson(`${API_BASE}/api/public/steam-news`)
  ]);

  els.players.textContent = config.stats.players;
  els.teams.textContent = config.stats.teams;
  els.tournaments.textContent = config.stats.tournaments;
  els.prizePool.textContent = config.stats.prizePool;
  nextTournamentAt = config.nextTournamentAt;

  renderProPlayers(proPlayers.data || []);
  renderSteamNews(steamNews.data || []);
}

function startCountdown() {
  setInterval(() => {
    if (!nextTournamentAt) return;
    els.countdownText.textContent = formatCountdown(nextTournamentAt);
  }, 1000);
}

els.registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.formStatus.className = 'status';
  els.formStatus.textContent = 'Submitting...';

  const formData = new FormData(els.registerForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    els.formStatus.classList.add('ok');
    els.formStatus.textContent = 'Registration submitted successfully.';
    els.registerForm.reset();
  } catch (err) {
    els.formStatus.classList.add('err');
    els.formStatus.textContent = err.message;
  }
});

els.refreshData.addEventListener('click', async () => {
  els.refreshData.disabled = true;
  els.refreshData.textContent = 'Refreshing...';
  try {
    await loadAll();
  } catch (err) {
    els.formStatus.className = 'status err';
    els.formStatus.textContent = `Data refresh failed: ${err.message}`;
  } finally {
    els.refreshData.disabled = false;
    els.refreshData.textContent = 'Refresh Live Data';
  }
});

(async function init() {
  try {
    initAmbientParticles();
    initAmbientStreaks();
    initSectionBursts();
    initAmbientParallax();
    await loadAll();
    startCountdown();
  } catch (err) {
    els.formStatus.className = 'status err';
    els.formStatus.textContent = `Startup error: ${err.message}`;
  }
})();
