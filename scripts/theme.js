(function () {
  var storageKey = 'watchtower-theme';
  var root = document.documentElement;
  var button = document.querySelector('[data-theme-toggle]');
  var saved = localStorage.getItem(storageKey);

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (button) {
      button.textContent = theme === 'light' ? button.dataset.darkLabel : button.dataset.lightLabel;
      button.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  applyTheme(saved === 'light' ? 'light' : 'dark');

  if (button) {
    button.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var primaryNav = menuButton
    ? document.getElementById(menuButton.getAttribute('aria-controls'))
    : null;
  var navInner = menuButton ? menuButton.closest('.nav-inner') : null;
  var mobileNavigation = window.matchMedia('(max-width: 900px)');

  function setMenuState(open) {
    if (!menuButton || !primaryNav || !navInner) return;

    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuButton.textContent = open
      ? menuButton.dataset.menuOpenLabel
      : menuButton.dataset.menuClosedLabel;
    menuButton.setAttribute('aria-label', open
      ? menuButton.dataset.menuCloseAriaLabel
      : menuButton.dataset.menuOpenAriaLabel);
    primaryNav.classList.toggle('is-open', open);
    navInner.classList.toggle('menu-open', open);
  }

  if (menuButton && primaryNav && navInner) {
    setMenuState(false);

    menuButton.addEventListener('click', function () {
      setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    primaryNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenuState(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenuState(false);
        menuButton.focus();
      }
    });

    document.addEventListener('pointerdown', function (event) {
      if (menuButton.getAttribute('aria-expanded') === 'true' && !navInner.contains(event.target)) {
        setMenuState(false);
      }
    });

    function resetMenuForViewport() {
      setMenuState(false);
    }

    if (mobileNavigation.addEventListener) {
      mobileNavigation.addEventListener('change', resetMenuForViewport);
    } else {
      mobileNavigation.addListener(resetMenuForViewport);
    }
  }
}());
