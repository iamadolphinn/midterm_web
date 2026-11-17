(function () {
  const auth = window.WalkOnAuth;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const guest = document.getElementById('guest-view');
  const profile = document.getElementById('profile-view');

  function showError(form, name, message) {
    const input = form.elements[name];
    const box = form.querySelector('[data-error-for="' + name + '"]');
    input.classList.toggle('is-invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    box.textContent = message || '';
    return !message;
  }

  function checkName(form) {
    const v = form.elements.name.value.trim();
    return showError(form, 'name', v.length < 2 ? 'Enter your name (at least 2 characters).' : '');
  }

  function checkEmail(form) {
    const v = form.elements.email.value.trim();
    return showError(form, 'email', !EMAIL.test(v) ? 'Enter a valid email, like fan@example.com.' : '');
  }

  function checkPassword(form) {
    const v = form.elements.password.value;
    const bad = v.length < 6 || !/[0-9]/.test(v) || !/[a-zA-Z]/.test(v);
    return showError(form, 'password', bad ? 'Password: at least 6 characters, with a letter and a number.' : '');
  }

  function checkConfirm(form) {
    const same = form.elements.confirm.value === form.elements.password.value;
    return showError(form, 'confirm', same ? '' : 'Passwords do not match.');
  }

  function render() {
    const user = auth.currentUser();
    guest.hidden = Boolean(user);
    profile.hidden = !user;
    if (!user) {
      return;
    }
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('profile-joined').textContent = new Date(user.joined).toLocaleDateString('en-GB');
    document.getElementById('profile-form').elements.club.value = user.club || '';
    const plan = document.getElementById('profile-plan');
    plan.textContent = user.plan
      ? 'Saved visit plan: ' + user.plan.match + ' on ' + new Date(user.plan.date).toLocaleDateString('en-GB') + ' · ' + user.plan.stand + ' · ' + user.plan.people + ' people'
      : 'No saved visit plan yet. Make one in Plan My Visit.';
  }

  const signUpForm = document.getElementById('signup-form');
  const logInForm = document.getElementById('login-form');
  const profileForm = document.getElementById('profile-form');

  signUpForm.addEventListener('input', function (e) {
    if (e.target.name === 'name') { checkName(signUpForm); }
    if (e.target.name === 'email') { checkEmail(signUpForm); }
    if (e.target.name === 'password') { checkPassword(signUpForm); }
    if (e.target.name === 'confirm') { checkConfirm(signUpForm); }
  });

  signUpForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const ok = [checkName(signUpForm), checkEmail(signUpForm), checkPassword(signUpForm), checkConfirm(signUpForm)].every(Boolean);
    if (!ok) { return; }
    const created = await auth.signUp(signUpForm.elements.name.value.trim(), signUpForm.elements.email.value.trim().toLowerCase(), signUpForm.elements.password.value);
    if (!created) {
      showError(signUpForm, 'email', 'This email is already registered. Log in instead.');
      return;
    }
    location.reload();
  });

  logInForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const okEmail = checkEmail(logInForm);
    const okPass = showError(logInForm, 'password', logInForm.elements.password.value ? '' : 'Enter your password.');
    if (!okEmail || !okPass) { return; }
    const ok = await auth.logIn(logInForm.elements.email.value.trim().toLowerCase(), logInForm.elements.password.value);
    if (!ok) {
      showError(logInForm, 'password', 'Wrong email or password.');
      return;
    }
    location.reload();
  });

  profileForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const club = profileForm.elements.club.value.trim();
    if (club.length > 40) {
      showError(profileForm, 'club', 'Keep it under 40 characters.');
      return;
    }
    showError(profileForm, 'club', '');
    auth.updateUser({ club: club });
    document.getElementById('profile-saved').hidden = false;
  });

  document.getElementById('logout-btn').addEventListener('click', function () {
    auth.logOut();
    location.reload();
  });

  render();
})();
