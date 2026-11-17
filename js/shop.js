(function () {
  const list = document.getElementById('products');
  const basketList = document.getElementById('basket-list');

  if (!list || !basketList) {
    return;
  }

  const searchInput = document.getElementById('product-search');
  const categorySelect = document.getElementById('product-category');
  const countText = document.getElementById('product-count');
  const emptyText = document.getElementById('products-empty');
  const basketEmpty = document.getElementById('basket-empty');
  const basketSummary = document.getElementById('basket-summary');
  const basketTotal = document.getElementById('basket-total');
  const clearButton = document.getElementById('basket-clear');
  const orderForm = document.getElementById('order-form');
  const orderSuccess = document.getElementById('order-success');
  const orderError = document.getElementById('order-error');

  function formatPrice(value) {
    return '£' + value.toFixed(2);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  }

  function findProduct(id) {
    return products.find(function (product) {
      return product.id === id;
    });
  }

  function createProduct(product) {
    const card = createElement('article', 'product-card');
    const body = createElement('div', 'product-body');
    const button = createElement('button', 'btn btn-red', 'Add to basket');
    const image = createElement('img', 'product-image');

    button.type = 'button';
    button.dataset.id = product.id;
    button.setAttribute('aria-label', 'Add ' + product.name + ' to basket');

    image.src = product.image;
    image.alt = product.alt;
    image.width = 400;
    image.height = 300;
    image.loading = 'lazy';
    image.style.height = '200px';
    image.style.width = '100%';
    image.style.objectFit = 'contain';

    body.append(
      createElement('h3', '', product.name),
      createElement('p', 'product-text', product.text),
      createElement('p', 'product-price', formatPrice(product.price)),
      button
    );
    card.append(image, body);
    return card;
  }

  function productMatches(product, query, category) {
    const categoryOk = category === 'all' || product.category === category;
    const text = (product.name + ' ' + product.text).toLowerCase();
    return categoryOk && (query === '' || text.includes(query));
  }

  function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    let shown = 0;

    list.replaceChildren();
    for (const product of products) {
      if (productMatches(product, query, category)) {
        list.append(createProduct(product));
        shown++;
      }
    }

    countText.textContent = 'Showing ' + shown + ' of ' + products.length + ' products';
    emptyText.hidden = shown > 0;
    $(list).children().stop(true, true).hide().fadeIn(250);
  }

  function createBasketRow(product, qty) {
    const row = createElement('li', 'basket-row');
    const info = createElement('div');
    const controls = createElement('div', 'basket-controls');
    const lineTotal = createElement('strong', 'basket-line', formatPrice(product.price * qty));
    const minus = createElement('button', 'qty-btn', '−');
    const plus = createElement('button', 'qty-btn', '+');
    const remove = createElement('button', 'basket-remove', 'Remove');

    minus.type = 'button';
    minus.dataset.action = 'dec';
    minus.dataset.id = product.id;
    minus.setAttribute('aria-label', 'One less ' + product.name);

    plus.type = 'button';
    plus.dataset.action = 'inc';
    plus.dataset.id = product.id;
    plus.setAttribute('aria-label', 'One more ' + product.name);
    plus.disabled = qty >= WalkOnCart.maxQty;

    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.dataset.id = product.id;
    remove.setAttribute('aria-label', 'Remove ' + product.name + ' from basket');

    info.append(
      createElement('span', 'basket-name', product.name),
      createElement('small', 'basket-unit', formatPrice(product.price) + ' each')
    );
    controls.append(minus, createElement('span', 'basket-qty', qty), plus, lineTotal, remove);
    row.append(info, controls);
    return row;
  }

  function renderBasket() {
    const items = WalkOnCart.get();
    let total = 0;
    let rows = 0;

    basketList.replaceChildren();
    for (const item of items) {
      const product = findProduct(item.id);
      if (product) {
        basketList.append(createBasketRow(product, item.qty));
        total += product.price * item.qty;
        rows++;
      }
    }

    basketTotal.textContent = formatPrice(total);
    basketEmpty.hidden = rows > 0;
    basketSummary.hidden = rows === 0;
  }

  function pulseBadge() {
    $('[data-cart-count]').stop(true, true).css('opacity', 0.3).animate({ opacity: 1 }, 300);
  }

  list.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-id]');
    if (!button) {
      return;
    }
    WalkOnCart.add(button.dataset.id);
    pulseBadge();
  });

  basketList.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const id = button.dataset.id;
    const current = WalkOnCart.get().find(function (item) {
      return item.id === id;
    });
    if (!current) {
      return;
    }

    if (button.dataset.action === 'inc') {
      WalkOnCart.setQty(id, current.qty + 1);
    } else if (button.dataset.action === 'dec') {
      WalkOnCart.setQty(id, current.qty - 1);
    } else {
      WalkOnCart.remove(id);
    }
  });

  clearButton.addEventListener('click', function () {
    WalkOnCart.clear();
  });

  const rules = {
    name: function (value) {
      if (value === '') return 'Please enter your name.';
      if (value.length < 2) return 'Your name must have at least 2 letters.';
      if (!/^[A-Za-zÀ-ÿ\u0400-\u04FF' -]+$/.test(value)) return 'Use only letters in your name.';
      return '';
    },
    email: function (value) {
      if (value === '') return 'Please enter your email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Enter an email like name@example.com.';
      return '';
    }
  };

  const fieldNames = Object.keys(rules);

  function showError(input, message) {
    document.getElementById(input.id + '-error').textContent = message;
    input.classList.toggle('is-invalid', message !== '');
    input.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
  }

  function validateField(input) {
    const message = rules[input.name](input.value.trim());
    showError(input, message);
    return message === '';
  }

  orderForm.addEventListener('input', function (event) {
    const input = event.target;
    if (rules[input.name] && input.classList.contains('is-invalid')) {
      validateField(input);
    }
    orderError.textContent = '';
  });

  orderForm.addEventListener('submit', function (event) {
    event.preventDefault();

    let firstInvalid = null;
    for (const name of fieldNames) {
      const input = orderForm.elements[name];
      if (!validateField(input) && firstInvalid === null) {
        firstInvalid = input;
      }
    }

    if (firstInvalid !== null) {
      firstInvalid.focus();
      return;
    }

    if (WalkOnCart.count() === 0) {
      orderError.textContent = 'Your basket is empty. Add something from the shop first.';
      return;
    }

    const visitor = orderForm.elements.name.value.trim();
    orderSuccess.textContent = 'Thank you, ' + visitor + '! Your order is reserved. This is a demo shop, so nothing was sold.';
    WalkOnCart.clear();
    orderForm.reset();
    for (const name of fieldNames) {
      showError(orderForm.elements[name], '');
    }
    $(orderSuccess).stop(true, true).hide().slideDown(300);
  });

  searchInput.addEventListener('input', renderProducts);
  categorySelect.addEventListener('change', renderProducts);
  document.addEventListener('cart:change', renderBasket);

  renderProducts();
  renderBasket();
})();