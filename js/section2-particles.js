document.addEventListener('DOMContentLoaded', function () {
  const building = document.getElementById('section2Building');
  const stickySection = document.getElementById('stickySection');
  const textViewport = document.getElementById('textViewport');
  const textTrack = document.getElementById('textTrack');

  if (!building || !stickySection) return;

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
    const blur = 8 * (1 - clarity);
    building.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
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
