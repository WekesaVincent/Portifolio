/* ===== DISABLE RIGHT-CLICK & DEV TOOLS ===== */
document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
  // F12
  if (e.key === 'F12') { e.preventDefault(); return; }
  // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
  if (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); return; }
  // Ctrl+U (View Source)
  if (e.ctrlKey && ['U','u'].includes(e.key)) { e.preventDefault(); return; }
  // Ctrl+S (Save page)
  if (e.ctrlKey && ['S','s'].includes(e.key)) { e.preventDefault(); return; }
});

/* ===== NAVBAR SCROLL ===== */
const nav = document.getElementById('nav');
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
    scrollTopBtn.classList.add('visible');
  } else {
    nav.classList.remove('scrolled');
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

/* ===== MOBILE NAV TOGGLE ===== */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

/* ===== TYPING EFFECT ===== */
const roles = [
  'SOC Analyst',
  'Data Analyst',
  'Threat Detection Specialist',
  'Incident Responder',
];
const typedEl = document.getElementById('typed-text');
let roleIdx = 0, charIdx = 0, isDeleting = false;
function type() {
  const current = roles[roleIdx];
  typedEl.textContent = isDeleting
    ? current.slice(0, --charIdx)
    : current.slice(0, ++charIdx);

  let delay = isDeleting ? 45 : 85;
  if (!isDeleting && charIdx === current.length) { delay = 2000; isDeleting = true; }
  else if (isDeleting && charIdx === 0) { isDeleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 400; }
  setTimeout(type, delay);
}
type();

/* ===== MATRIX CANVAS ===== */
const matCanvas = document.getElementById('matrix-canvas');
const matCtx    = matCanvas.getContext('2d');
let mW, mH, mCols, mDrops;
const matChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ█▓▒░▄▀■□◆◇';
const matSize  = 13;

function initMatrix() {
  mW = matCanvas.width  = matCanvas.offsetWidth;
  mH = matCanvas.height = matCanvas.offsetHeight;
  mCols  = Math.floor(mW / matSize);
  mDrops = Array.from({ length: mCols }, () => Math.random() * -50);
}

function drawMatrix() {
  matCtx.fillStyle = 'rgba(10,13,19,0.06)';
  matCtx.fillRect(0, 0, mW, mH);

  for (let i = 0; i < mDrops.length; i++) {
    // Bright head
    const y = mDrops[i] * matSize;
    matCtx.fillStyle = '#ffffff';
    matCtx.font = `bold ${matSize}px JetBrains Mono, monospace`;
    matCtx.fillText(matChars[Math.floor(Math.random() * matChars.length)], i * matSize, y);

    // Dim trail
    matCtx.fillStyle = '#00e5a0';
    matCtx.font = `${matSize}px JetBrains Mono, monospace`;
    matCtx.fillText(matChars[Math.floor(Math.random() * matChars.length)], i * matSize, y - matSize);

    matCtx.fillStyle = 'rgba(0,229,160,0.5)';
    matCtx.fillText(matChars[Math.floor(Math.random() * matChars.length)], i * matSize, y - matSize * 2);

    if (y > mH && Math.random() > 0.97) mDrops[i] = 0;
    mDrops[i] += 0.4 + Math.random() * 0.3;
  }
}

initMatrix();
window.addEventListener('resize', () => { initMatrix(); initParticles(); });
setInterval(drawMatrix, 50);

/* ===== PARTICLE NETWORK ===== */
const pCanvas = document.getElementById('particle-canvas');
const pCtx    = pCanvas.getContext('2d');
let pW, pH, particles = [];

const PARTICLE_COUNT = 55;
const MAX_DIST       = 140;

class Particle {
  constructor() { this.reset(true); }
  reset(init = false) {
    this.x  = Math.random() * pW;
    this.y  = init ? Math.random() * pH : (Math.random() > 0.5 ? -4 : pH + 4);
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r  = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10 || this.x > pW + 10 || this.y < -10 || this.y > pH + 10) this.reset();
  }
}

function initParticles() {
  pW = pCanvas.width  = pCanvas.offsetWidth;
  pH = pCanvas.height = pCanvas.offsetHeight;
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
}

function drawParticles() {
  pCtx.clearRect(0, 0, pW, pH);

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST) * 0.18;
        pCtx.beginPath();
        pCtx.strokeStyle = `rgba(0,229,160,${alpha})`;
        pCtx.lineWidth = 0.8;
        pCtx.moveTo(particles[i].x, particles[i].y);
        pCtx.lineTo(particles[j].x, particles[j].y);
        pCtx.stroke();
      }
    }
  }

  // Draw nodes
  particles.forEach(p => {
    p.update();
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(0,229,160,${p.alpha})`;
    pCtx.fill();
    // Glow
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2);
    pCtx.fillStyle = `rgba(0,229,160,${p.alpha * 0.2})`;
    pCtx.fill();
  });
}

initParticles();
function particleLoop() { drawParticles(); requestAnimationFrame(particleLoop); }
particleLoop();

/* ===== ANIMATED TERMINAL ===== */
const terminalBody = document.getElementById('terminal-body');
const lines = [
  { text: '$ soc-monitor --siem elastic --alert-level HIGH', cls: 'prompt', delay: 400 },
  { text: '[*] Querying Elastic SIEM telemetry: last 24h...', cls: 'dim', delay: 900 },
  { text: '[*] Connecting: EDR · Suricata · Sysmon · Zeek', cls: 'dim', delay: 1300 },
  { text: '', cls: 'dim', delay: 1600 },
  { text: '[+] Sysmon Log Ingestion: 48,210 events parsed', cls: 'ok', delay: 2000 },
  { text: '[+] Suricata IDS       : 12 high-severity alerts flagged', cls: 'warn', delay: 2400 },
  { text: '[!] T1078 Alert: Unusual login from suspicious subnet', cls: 'err', delay: 2800 },
  { text: '', cls: 'dim', delay: 3100 },
  { text: '$ python3 model_predict.py --data car_prices.csv', cls: 'prompt', delay: 3500 },
  { text: '[+] XGBoost R²: 0.94 | Accuracy: 96.2%', cls: 'ok', delay: 4100 },
  { text: '    Confidence: HIGH  |  Optimization: Complete', cls: 'high', delay: 4400 },
  { text: '    Features: 26 parameters analyzed', cls: 'dim', delay: 4700 },
  { text: '', cls: 'dim', delay: 5000 },
  { text: '$ ir-playbook trigger --containment host-isolate', cls: 'prompt', delay: 5400 },
  { text: '[*] Executing automated containment playbook...', cls: 'dim', delay: 5900 },
  { text: '[+] Endpoint isolated from production network', cls: 'ok', delay: 6400 },
  { text: '[+] Incident report dispatched to SOC Lead', cls: 'ok', delay: 6700 },
  { text: '', cls: 'dim', delay: 7000 },
  { text: '$ whoami', cls: 'prompt', delay: 7400 },
  { text: 'vincent: SOC Analyst | Data Analyst', cls: 'high', delay: 7800 },
  { text: '$ echo "Securing Data & Digital Infrastructure: Vincent Wekesa"', cls: 'prompt', delay: 8200 },
  { text: 'Securing Data & Digital Infrastructure: Vincent Wekesa', cls: 'ok', delay: 8600 },
];

function renderTerminalLine(line) {
  const span = document.createElement('span');
  span.className = `t-line t-${line.cls}`;
  span.textContent = line.text || '\u00A0';
  terminalBody.appendChild(span);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function runTerminal(idx = 0) {
  if (idx >= lines.length) {
    // Loop: clear and restart
    setTimeout(() => {
      terminalBody.innerHTML = '';
      runTerminal(0);
    }, 4000);
    return;
  }
  const line = lines[idx];
  setTimeout(() => {
    renderTerminalLine(line);
    runTerminal(idx + 1);
  }, idx === 0 ? line.delay : lines[idx].delay - lines[idx - 1].delay);
}
runTerminal();

/* ===== THREAT LEVEL ROTATOR ===== */
const levels  = ['HIGH', 'CRITICAL', 'HIGH', 'ELEVATED'];
const lvlEl   = document.getElementById('threat-level');
let lvlIdx    = 0;
setInterval(() => {
  lvlIdx = (lvlIdx + 1) % levels.length;
  if (lvlEl) lvlEl.textContent = levels[lvlIdx];
}, 5000);

/* ===== COUNTER ANIMATION ===== */
function animateCount(el, target, suffix, duration = 1800) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ===== INTERSECTION OBSERVERS ===== */
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.stats__card').forEach((card, i) => {
      const el = document.getElementById(`stat-${i}`);
      setTimeout(() => animateCount(el, +card.dataset.count, card.dataset.suffix || ''), i * 150);
    });
    statsObserver.disconnect();
  });
}, { threshold: 0.3 });
const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

const fadeEls = document.querySelectorAll(
  '.about__grid, .skill-card, .timeline__item, .contact__inner, .stats__card, .project-card'
);
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
fadeEls.forEach(el => { el.classList.add('fade-in'); fadeObserver.observe(el); });

/* ===== ACTIVE NAV HIGHLIGHT ===== */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === `#${entry.target.id}` && !a.classList.contains('nav__cta'))
          a.style.color = '#e2e8f0';
      });
    }
  });
}, { threshold: 0.45 });
sections.forEach(s => sectionObs.observe(s));
