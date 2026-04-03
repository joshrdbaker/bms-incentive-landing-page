(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var pathButtons = document.querySelectorAll('.path-toggle-btn[data-path]');
    var panels = {
      prescriptive: document.getElementById('path-panel-prescriptive'),
      custom: document.getElementById('path-panel-custom')
    };

    function setPath(path) {
      if (!pathButtons.length || !panels.prescriptive || !panels.custom) return;
      var isPrescriptive = path === 'prescriptive';
      pathButtons.forEach(function (btn) {
        var active = btn.getAttribute('data-path') === path;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      panels.prescriptive.hidden = !isPrescriptive;
      panels.custom.hidden = isPrescriptive;
    }

    if (pathButtons.length && panels.prescriptive && panels.custom) {
      pathButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var path = btn.getAttribute('data-path');
          if (path) setPath(path);
        });
      });
    }

    document.querySelectorAll('[data-path-jump]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var path = el.getAttribute('data-path-jump');
        if (!path) return;
        setPath(path);
        var targetBtn = document.getElementById(
          path === 'custom' ? 'path-toggle-custom' : 'path-toggle-prescriptive'
        );
        if (targetBtn) {
          targetBtn.focus({ preventScroll: true });
        }
        var heading = document.getElementById('path-module-heading');
        if (heading) {
          heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    function initPathSectionTabs(container) {
      var tabs = container.querySelectorAll('[data-path-tab]');
      var tabPanels = container.querySelectorAll('[data-path-panel]');
      if (!tabs.length || !tabPanels.length) return;

      function showPanel(name) {
        tabPanels.forEach(function (panel) {
          var match = panel.getAttribute('data-path-panel') === name;
          panel.hidden = !match;
        });
        tabs.forEach(function (tab) {
          var active = tab.getAttribute('data-path-tab') === name;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
          tab.setAttribute('tabindex', active ? '0' : '-1');
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var name = tab.getAttribute('data-path-tab');
          if (!name) return;
          showPanel(name);
          // On mobile the tablist is sticky. If the user has scrolled deep into the
          // tab content and taps a different tab, snap back so the tab bar sits at
          // the top of the viewport (i.e. scroll to the top of the tabs container).
          if (window.matchMedia('(max-width: 991.98px)').matches) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }

    document.querySelectorAll('[data-path-section-tabs]').forEach(initPathSectionTabs);
  });
})();
