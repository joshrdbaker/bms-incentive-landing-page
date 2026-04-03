document.addEventListener('DOMContentLoaded', function () {
  const building = document.getElementById('section2Building');
  const stickySection = document.getElementById('stickySection');
  const textViewport = document.getElementById('textViewport');
  const textTrack = document.getElementById('textTrack');

  if (!building || !stickySection) return;

  /* Scroll through #stickySection is 0→1 over the section’s scroll range (CSS min-height sets how much wheel/track that is).
     Wider SWAP_END − SWAP_START = more wheel/track for the same slide (slower feel). */
  var SWAP_START = 0.66;
  var SWAP_END = 0.99;

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

  /** Softer than ease-in-out cubic — less “snap” at the start/end of the panel slide. */
  function easeInOutSine(t) {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  function updateTextTrackScroll() {
    if (!textViewport || !textTrack) return;
    if (!isDesktop()) {
      textTrack.style.transform = '';
      return;
    }

    var p = getSectionScrollProgress();
    var t = Math.max(0, Math.min(1, (p - SWAP_START) / (SWAP_END - SWAP_START)));
    var eased = easeInOutSine(t);

    var vpHeight = textViewport.offsetHeight;
    textTrack.style.transform = 'translate3d(0,' + (-eased * vpHeight) + 'px,0)';
  }

  function getClarityProgress() {
    const p = getSectionScrollProgress();
    /* Full blur while first headline is on screen; clarity reaches 1 only when the second headline is fully in view (same window as the text track slide). */
    const raw = Math.max(0, Math.min(1, (p - SWAP_START) / (SWAP_END - SWAP_START)));
    return easeInOutSine(raw);
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
