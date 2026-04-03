document.addEventListener('DOMContentLoaded', function () {
  const building = document.getElementById('section2Building');
  const featureGraphic = document.getElementById('featureGraphic');
  const stickySection = document.getElementById('stickySection');
  const textViewport = document.getElementById('textViewport');
  const textTrack = document.getElementById('textTrack');

  if (!building || !featureGraphic || !stickySection) return;

  var isDesktop = function () {
    return window.matchMedia('(min-width: 992px)').matches;
  };

  function getSectionScrollProgress() {
    const sectionTop = stickySection.getBoundingClientRect().top + window.scrollY;
    const scrollRange = stickySection.offsetHeight - window.innerHeight;
    if (scrollRange <= 0) return 0;
    const raw = (window.scrollY - sectionTop) / scrollRange;
    return Math.max(0, Math.min(1, raw));
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function updateTextTrackScroll() {
    if (!textViewport || !textTrack) return;
    if (!isDesktop()) {
      textTrack.style.transform = '';
      return;
    }

    var p = getSectionScrollProgress();
    var swapStart = 0.18;
    var swapEnd = 0.82;
    var t = Math.max(0, Math.min(1, (p - swapStart) / (swapEnd - swapStart)));
    var eased = easeInOutCubic(t);

    var vpHeight = textViewport.offsetHeight;
    textTrack.style.transform = 'translate3d(0,' + (-eased * vpHeight) + 'px,0)';
  }

  function getClarityProgress() {
    const p = getSectionScrollProgress();
    const raw = Math.max(0, Math.min(1, (p - 0.06) / 0.55));
    return easeInOutCubic(raw);
  }

  var lastClarity = -1;

  function updateBuildingClarity() {
    const clarity = getClarityProgress();
    if (Math.abs(clarity - lastClarity) < 0.004) return;
    lastClarity = clarity;
    const blur = 3 * (1 - clarity);
    const tealStr = 1 - clarity;
    const orangeStr = clarity;
    building.style.filter =
      `blur(${blur}px) ` +
      `drop-shadow(0 0 ${60 * tealStr}px rgba(0,145,138,${0.7 * tealStr})) ` +
      `drop-shadow(0 0 ${100 * tealStr}px rgba(0,145,138,${0.4 * tealStr})) ` +
      `drop-shadow(0 0 ${4 * orangeStr}px rgba(244,121,45,${0.4 * orangeStr})) ` +
      `drop-shadow(0 0 1px rgba(244,121,45,${0.7 * orangeStr}))`;
    if (clarity >= 1) {
      featureGraphic.classList.add('is-converged');
    } else {
      featureGraphic.classList.remove('is-converged');
    }
  }

  function onScroll() {
    window.requestAnimationFrame(function () {
      updateBuildingClarity();
      updateTextTrackScroll();
    });
  }

  function onResize() {
    lastClarity = -1;
    updateBuildingClarity();
    window.requestAnimationFrame(updateTextTrackScroll);
  }

  updateBuildingClarity();
  updateTextTrackScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
});
