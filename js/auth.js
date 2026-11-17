(function () {
  const USERS_KEY = 'walkon-users';
  const SESSION_KEY = 'walkon-session';

  function readUsers() {
    try {
      const data = JSON.parse(localStorage.getItem(USERS_KEY));
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  function writeUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      return;
    }
  }

  function currentEmail() {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch (error) {
      return null;
    }
  }

  function currentUser() {
    const email = currentEmail();
    return readUsers().find(function (user) { return user.email === email; }) || null;
  }

  function setSession(email) {
    try {
      if (email) {
        localStorage.setItem(SESSION_KEY, email);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (error) {
      return;
    }
  }

  async function hash(text) {
    if (window.crypto && crypto.subtle) {
      const bytes = new TextEncoder().encode(text);
      const buffer = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(buffer)).map(function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    }
    return btoa(text);
  }

  async function signUp(name, email, password) {
    const users = readUsers();
    if (users.some(function (user) { return user.email === email; })) {
      return false;
    }
    users.push({ name: name, email: email, password: await hash(email + ':' + password), club: '', joined: new Date().toISOString(), plan: null });
    writeUsers(users);
    setSession(email);
    return true;
  }

  async function logIn(email, password) {
    const user = readUsers().find(function (u) { return u.email === email; });
    if (!user || user.password !== await hash(email + ':' + password)) {
      return false;
    }
    setSession(email);
    return true;
  }

  function logOut() {
    setSession(null);
  }

  function updateUser(changes) {
    const email = currentEmail();
    const users = readUsers();
    const user = users.find(function (u) { return u.email === email; });
    if (!user) {
      return false;
    }
    Object.assign(user, changes);
    writeUsers(users);
    return true;
  }

  window.WalkOnAuth = { currentUser: currentUser, signUp: signUp, logIn: logIn, logOut: logOut, updateUser: updateUser };

  document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.navbar-nav');
    if (!nav) {
      return;
    }
    const user = currentUser();
    const item = document.createElement('li');
    item.className = 'nav-item';
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = 'account.html';
    link.textContent = user ? 'Hi, ' + user.name.split(' ')[0] : 'Log In';
    item.append(link);
    if (user) {
      const out = document.createElement('li');
      out.className = 'nav-item';
      const button = document.createElement('a');
      button.className = 'nav-link';
      button.href = 'index.html';
      button.textContent = 'Log Out';
      button.addEventListener('click', function () { logOut(); });
      out.append(button);
      nav.append(item, out);
    } else {
      nav.append(item);
    }
    if (location.pathname.endsWith('account.html')) {
      link.classList.add('active');
    }
  });
})();
