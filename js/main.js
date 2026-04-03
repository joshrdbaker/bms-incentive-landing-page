document.addEventListener('DOMContentLoaded', function () {
  const scene = document.getElementById('particleScene');
  const targetLogo = document.getElementById('heroTargetLogo');
  const artboard = document.getElementById('heroArtboard');
  const heroTitle1 = document.getElementById('heroTitle1');
  const heroTitle2 = document.getElementById('heroTitle2');

  if (!scene || !targetLogo || !artboard) return;

  const svg = targetLogo.querySelector('svg');
  const paths = Array.from(targetLogo.querySelectorAll('#targetPaths path'));
  if (!svg || !paths.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particleCount = 510;
  /** Two parallel rails along each trace (side-by-side doubling). */
  const rowOffsets = [-1, 1];
  const rowSpacing = 2.35;
  /** Extra Y in scene px; keep 0 — layout uses .circuit-traces svg rect so nodes match painted tracers */
  const formationYOffset = 0;
  const chaosDuration = prefersReducedMotion ? 100 : 1500;
  const formDuration = prefersReducedMotion ? 100 : 800;
  const teal = '#00918A';
  const orangeLeft = '#f4792d';
  const orangeRight = '#f8951d';

  let particles = [];
  let animationFrame = null;
  let startTime = null;

  targetLogo.style.opacity = '0.001';
  targetLogo.style.pointerEvents = 'none';

  function createTargets() {
    const sceneRect = scene.getBoundingClientRect();
    /* Same geometry as #targetPaths, but measure the *visible* tracer SVG so sx/sy and offsets match the artboard */
    const layoutSvg = scene.querySelector('.circuit-traces svg') || svg;
    const svgRect = layoutSvg.getBoundingClientRect();
    const svgViewBox = layoutSvg.viewBox.baseVal;
    const sx = svgRect.width / svgViewBox.width;
    const sy = svgRect.height / svgViewBox.height;
    const pathLengths = paths.map(function (path) {
      return path.getTotalLength();
    });
    const totalLength = pathLengths.reduce(function (sum, len) {
      return sum + len;
    }, 0);
    const stationsTotal = Math.max(1, Math.floor(particleCount / rowOffsets.length));
    const targets = [];
    const delta = 2;

    /** Integer counts per path (sum === stationsTotal) so every branch is evenly filled. */
    const rawCounts = pathLengths.map(function (len) {
      return totalLength > 0 ? (len / totalLength) * stationsTotal : 0;
    });
    const samplesPerPath = rawCounts.map(function (r) {
      return Math.floor(r);
    });
    let deficit = stationsTotal - samplesPerPath.reduce(function (a, b) {
      return a + b;
    }, 0);
    const fracIdx = rawCounts.map(function (r, i) {
      return { i: i, f: r - Math.floor(r) };
    }).sort(function (a, b) {
      return b.f - a.f;
    });
    let fi = 0;
    while (deficit > 0) {
      samplesPerPath[fracIdx[fi % fracIdx.length].i] += 1;
      deficit -= 1;
      fi += 1;
    }

    paths.forEach(function (path, pathIndex) {
      const pathLength = pathLengths[pathIndex];
      const samples = samplesPerPath[pathIndex];
      if (samples < 1 || pathLength < 1e-6) return;

      for (let i = 0; i < samples; i += 1) {
        const t = ((i + 0.5) / samples) * pathLength;
        const point = path.getPointAtLength(t);
        const tNext = Math.min(t + delta, pathLength);
        const tPrev = Math.max(t - delta, 0);
        const nextPoint = path.getPointAtLength(tNext);
        const prevPoint = path.getPointAtLength(tPrev);
        const dx = nextPoint.x - prevPoint.x;
        const dy = nextPoint.y - prevPoint.y;
        const len = Math.hypot(dx, dy) || 1;
        const perpX = -dy / len;
        const perpY = dx / len;

        const localX = point.x * sx;
        const baseColor = localX < (svgRect.width * 0.56) ? orangeLeft : orangeRight;

        rowOffsets.forEach(function (mult) {
          const offsetX = perpX * mult * rowSpacing * sx;
          const offsetY = perpY * mult * rowSpacing * sy;
          const x = (svgRect.left - sceneRect.left) + localX + offsetX;
          const y = (svgRect.top - sceneRect.top) + (point.y * sy) + offsetY + formationYOffset;
          targets.push({
            x: x,
            y: y,
            finalColor: baseColor
          });
        });
      }
    });

    return targets.slice(0, particleCount);
  }

  function buildParticles() {
    scene.querySelectorAll('.particle-node').forEach(function (node) {
      node.remove();
    });

    particles = [];

    const width = scene.clientWidth;
    const height = scene.clientHeight;
    const targets = createTargets();

    targets.forEach(function (target, i) {
      const roll = Math.random();
      const isRoam = roll < 0.08;
      const isOverlay = roll < 0.08 ? Math.random() < 0.6 : Math.random() < 0.1;
      const el = document.createElement('span');
      el.className = 'particle-node' + (isOverlay ? ' is-overlay' : '');

      const startX = width * (0.08 + Math.random() * 0.84);
      const startY = height * (0.04 + Math.random() * 0.90);

      let driftX, driftY;
      if (isOverlay) {
        driftX = -(300 + Math.random() * 400);
        driftY = (Math.random() - 0.5) * 300;
      } else if (isRoam) {
        driftX = (Math.random() - 0.5) * 500;
        driftY = (Math.random() - 0.5) * 320;
      } else if (Math.random() < 0.2) {
        driftX = (Math.random() - 0.5) * 180;
        driftY = (Math.random() - 0.5) * 180;
      } else {
        driftX = (Math.random() - 0.5) * 55;
        driftY = (Math.random() - 0.5) * 55;
      }

      // each particle gets its own oscillation period for disorder
      const freqX = 600 + Math.random() * 1800;
      const freqY = 600 + Math.random() * 1800;

      const phase = Math.random() * Math.PI * 2;
      const baseColor = Math.random() > 0.5 ? teal : (Math.random() > 0.5 ? orangeLeft : orangeRight);

      el.style.color = baseColor;
      el.style.backgroundColor = baseColor;
      scene.appendChild(el);

      particles.push({
        el: el,
        startX: startX,
        startY: startY,
        targetX: target.x,
        targetY: target.y,
        finalColor: target.finalColor,
        driftX: driftX,
        driftY: driftY,
        freqX: freqX,
        freqY: freqY,
        phase: phase,
        delay: Math.random() * 360,
        baseScale: 1
      });
    });
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animate(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;

    if (heroTitle2 && elapsed > chaosDuration && !heroTitle2.classList.contains('is-visible')) {
      heroTitle2.classList.add('is-visible');
    }

    particles.forEach(function (particle) {
      let x = particle.startX + Math.sin((elapsed / particle.freqX) + particle.phase) * particle.driftX;
      let y = particle.startY + Math.cos((elapsed / particle.freqY) + particle.phase) * particle.driftY;
      let scale = particle.baseScale;
      let color = particle.el.style.backgroundColor;
      let opacity = 0.7 + Math.sin((elapsed / 250) + particle.phase) * 0.16;

      if (elapsed > chaosDuration + particle.delay) {
        const progress = Math.min(1, (elapsed - chaosDuration - particle.delay) / formDuration);
        const eased = easeInOutCubic(progress);
        x = x + ((particle.targetX - x) * eased);
        y = y + ((particle.targetY - y) * eased);
        color = particle.finalColor;
        opacity = 0.84 + (progress * 0.16);
        scale = particle.baseScale + (progress * 0.08);
      }

      particle.el.style.left = x + 'px';
      particle.el.style.top = y + 'px';
      particle.el.style.opacity = opacity;
      particle.el.style.color = color;
      particle.el.style.backgroundColor = color;
      particle.el.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    });

    if (elapsed < chaosDuration + formDuration + 1400) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      particles.forEach(function (particle) {
        particle.el.style.left = particle.targetX + 'px';
        particle.el.style.top = particle.targetY + 'px';
        particle.el.style.color = particle.finalColor;
        particle.el.style.backgroundColor = particle.finalColor;
        particle.el.style.opacity = '1';
        particle.el.style.transform = 'translate(-50%, -50%) scale(1)';
      });

      artboard.classList.add('is-formed');

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    }
  }

  function init() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    artboard.classList.remove('is-formed');
    if (heroTitle2) heroTitle2.classList.remove('is-visible');
    buildParticles();
    startTime = null;
    animationFrame = requestAnimationFrame(animate);
  }

  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 140);
  });

  setTimeout(init, 120);
});

