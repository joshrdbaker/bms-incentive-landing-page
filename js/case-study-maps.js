/**
 * Case study location maps (OpenStreetMap tiles via Leaflet — pin at building coordinates).
 * invalidateSize + setView after layout/visibility: avoids tiles offset when the container
 * size was wrong at init (common when maps are below the fold or in flex/aspect-ratio boxes).
 */
document.addEventListener('DOMContentLoaded', function () {
  if (typeof L === 'undefined') return;

  /** Matches --tc-orange-left in css/styles.css */
  var TC_ORANGE = '#f4792d';

  function tcOrangePinIcon() {
    var html =
      '<div class="case-study-marker-inner">' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48" aria-hidden="true">' +
      '<path fill="' +
      TC_ORANGE +
      '" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" d="M10 6L30 6A4 4 0 0 1 34 10L34 24Q27 35 20 39Q13 35 6 24L6 10A4 4 0 0 1 10 6Z"/>' +
      '<circle cx="20" cy="16" r="3.5" fill="#fff"/>' +
      '</svg></div>';
    return L.divIcon({
      html: html,
      className: 'case-study-marker-icon',
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });
  }

  var locations = [
    {
      id: 'caseStudyMapSpringfield',
      lat: 42.10176,
      lng: -72.59102,
      zoom: 16,
      label: '1441 Main St, Springfield, MA',
    },
    {
      id: 'caseStudyMapCambridge',
      lat: 42.36318,
      lng: -71.08447,
      zoom: 16,
      label: '101 Main St, Cambridge, MA',
    },
  ];

  function mountMap(loc) {
    var el = document.getElementById(loc.id);
    if (!el) return;

    function init() {
      var map = L.map(el, {
        scrollWheelZoom: false,
        attributionControl: true,
        trackResize: true,
      });

      map.setView([loc.lat, loc.lng], loc.zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer">OpenStreetMap</a>',
      }).addTo(map);

      L.marker([loc.lat, loc.lng], { icon: tcOrangePinIcon() })
        .addTo(map)
        .bindPopup(loc.label);

      function reflow() {
        map.invalidateSize();
        map.setView([loc.lat, loc.lng], loc.zoom);
      }

      reflow();
      requestAnimationFrame(function () {
        requestAnimationFrame(reflow);
      });
      setTimeout(reflow, 50);
      setTimeout(reflow, 300);

      window.addEventListener('resize', reflow);

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) reflow();
            });
          },
          { root: null, rootMargin: '0px', threshold: [0, 0.01, 0.1] }
        );
        io.observe(el);
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(reflow);
      }
    }

    /* Defer init until after first layout pass so the aspect-ratio box has real dimensions. */
    requestAnimationFrame(function () {
      requestAnimationFrame(init);
    });
  }

  locations.forEach(mountMap);
});
