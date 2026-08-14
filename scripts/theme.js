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
}());
