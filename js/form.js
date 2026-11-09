(function () {
  const form = document.getElementById('plan-form');
  const success = document.getElementById('form-success');

  if (!form) {
    return;
  }

  function todayString() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + month + '-' + day;
  }


  const rules = {
    name: function (value) {
      if (value === '') return 'Please enter your name.';
      if (value.length < 2) return 'Your name must have at least 2 letters.';
      if (!/^[A-Za-zÀ-ÿ' -]+$/.test(value)) return 'Use only letters in your name.';
      return '';
    },
    email: function (value) {
      if (value === '') return 'Please enter your email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter an email like name@example.com.';
      return '';
    },
    phone: function (value) {
      if (value === '') return 'Please enter your phone number.';
      if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(value)) return 'Enter a valid phone, for example +44 7700 900123.';
      return '';
    },
    date: function (value) {
      if (value === '') return 'Please choose the match date.';
      if (value < todayString()) return 'The match date cannot be in the past.';
      return '';
    },
    fans: function (value) {
      if (value === '') return 'Enter a whole number from 1 to 4.';
      if (!/^\d+$/.test(value)) return 'Use a whole number, without decimals.';
      if (Number(value) < 1 || Number(value) > 4) return 'You can book for 1 to 4 fans.';
      return '';
    }
  };

  const fieldNames = Object.keys(rules);

  function showError(input, message) {
    const error = document.getElementById(input.id + '-error');
    error.textContent = message;
    input.classList.toggle('is-invalid', message !== '');
    input.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
  }

  function validateField(input) {
    const message = rules[input.name](input.value.trim());
    showError(input, message);
    return message === '';
  }

  function clearErrors() {
    for (const name of fieldNames) {
      showError(form.elements[name], '');
    }
  }


  form.addEventListener('input', function (event) {
    const input = event.target;
    if (rules[input.name] && input.classList.contains('is-invalid')) {
      validateField(input);
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let firstInvalid = null;
    for (const name of fieldNames) {
      const input = form.elements[name];
      if (!validateField(input) && firstInvalid === null) {
        firstInvalid = input;
      }
    }

    if (firstInvalid !== null) {
      firstInvalid.focus();
      return;
    }

    const visitor = form.elements.name.value.trim();
    success.textContent = 'Thank you, ' + visitor + '! Your visit plan was sent.';
    form.reset();
    clearErrors();
    $(success).stop(true, true).hide().slideDown(300);
  });
})();