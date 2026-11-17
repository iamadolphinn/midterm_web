(function () {
  const KEY = 'walkon-cart';
  const MAX_QTY = 10;

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (!Array.isArray(data)) {
        return [];
      }
      return data.filter(function (item) {
        return item && typeof item.id === 'string' && Number.isInteger(item.qty) && item.qty > 0;
      });
    } catch (error) {
      return [];
    }
  }

  function count() {
    let total = 0;
    for (const item of read()) {
      total += item.qty;
    }
    return total;
  }

  function updateBadges() {
    const total = count();
    for (const badge of document.querySelectorAll('[data-cart-count]')) {
      badge.textContent = total;
      badge.hidden = total === 0;
    }
  }

  function write(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (error) {
      return;
    }
    updateBadges();
    document.dispatchEvent(new CustomEvent('cart:change'));
  }

  function add(id) {
    const items = read();
    const found = items.find(function (item) {
      return item.id === id;
    });

    if (found) {
      found.qty = Math.min(found.qty + 1, MAX_QTY);
    } else {
      items.push({ id: id, qty: 1 });
    }
    write(items);
  }

  function remove(id) {
    write(read().filter(function (item) {
      return item.id !== id;
    }));
  }

  function setQty(id, qty) {
    if (qty < 1) {
      remove(id);
      return;
    }

    const items = read();
    const found = items.find(function (item) {
      return item.id === id;
    });

    if (found) {
      found.qty = Math.min(qty, MAX_QTY);
      write(items);
    }
  }

  function clear() {
    write([]);
  }

  window.WalkOnCart = {
    get: read,
    count: count,
    add: add,
    remove: remove,
    setQty: setQty,
    clear: clear,
    maxQty: MAX_QTY
  };

  window.addEventListener('storage', function (event) {
    if (event.key === KEY) {
      updateBadges();
      document.dispatchEvent(new CustomEvent('cart:change'));
    }
  });

  updateBadges();
})();