(function () {
  const KEY = 'walkon-theme';
  const root = document.documentElement;

  function readTheme() {
    try {
      const saved = localStorage.getItem(KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch (error) {
      return;
    }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
  }

  applyTheme(readTheme());

  document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.navbar-nav');
    if (!nav) {
      return;
    }

    const item = document.createElement('li');
    const button = document.createElement('button');
    item.className = 'nav-item d-flex align-items-center';
    button.type = 'button';
    button.className = 'theme-toggle';
    item.append(button);
    nav.append(item);

    function refreshButton() {
      const dark = root.getAttribute('data-theme') === 'dark';
      button.textContent = dark ? 'Light mode' : 'Dark mode';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }

    button.addEventListener('click', function () {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
      refreshButton();
    });

    refreshButton();
  });
})();