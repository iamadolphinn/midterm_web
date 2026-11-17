(function () {
  const cabinet = document.getElementById('cabinet');
  const history = document.getElementById('history');

  if (!cabinet || !history) {
    return;
  }

  const searchInput = document.getElementById('cup-search');
  const regionSelect = document.getElementById('cup-region');
  const cupCount = document.getElementById('cup-count');
  const cupEmpty = document.getElementById('cabinet-empty');
  const eraSelect = document.getElementById('history-era');
  const historyCount = document.getElementById('history-count');
  const historyEmpty = document.getElementById('history-empty');
  const totalText = document.getElementById('total-honours');

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

  function createCup(cup) {
    const card = createElement('article', 'cup-card');
    const body = createElement('div', 'cup-body');
    const image = createElement('img', 'cup-image');
    image.style.height = '220px';
    image.style.width = '100%';
    image.style.objectFit = 'contain';
    image.style.background = '#000';
    const years = createElement('ul', 'cup-years');

    image.src = cup.image;
    image.alt = cup.alt;
    image.width = 400;
    image.height = 300;
    image.loading = 'lazy';

    for (const year of cup.years) {
      years.append(createElement('li', '', year));
    }

    body.append(
      createElement('span', 'cup-number', cup.years.length),
      createElement('h3', '', cup.name),
      createElement('p', 'cup-text', cup.text),
      years
    );
    card.append(image, body);
    return card;
  }

  function cupMatches(cup, query, region) {
    const regionOk = region === 'all' || cup.region === region;
    const text = (cup.name + ' ' + cup.text + ' ' + cup.years.join(' ')).toLowerCase();
    return regionOk && (query === '' || text.includes(query));
  }

  function renderCabinet() {
    const query = searchInput.value.trim().toLowerCase();
    const region = regionSelect.value;
    let cupsShown = 0;
    let trophiesShown = 0;

    cabinet.replaceChildren();
    for (const cup of trophies) {
      if (cupMatches(cup, query, region)) {
        cabinet.append(createCup(cup));
        cupsShown++;
        trophiesShown += cup.years.length;
      }
    }

    cupCount.textContent = 'Showing ' + cupsShown + ' of ' + trophies.length + ' competitions · ' + trophiesShown + ' trophies';
    cupEmpty.hidden = cupsShown > 0;
    $(cabinet).children().stop(true, true).hide().fadeIn(250);
  }

  function createMilestone(milestone) {
    const item = createElement('li', 'history-item');
    item.append(
      createElement('span', 'history-year', milestone.year),
      createElement('h3', '', milestone.title),
      createElement('p', '', milestone.text)
    );
    return item;
  }

  function renderHistory() {
    const era = eraSelect.value;
    let shown = 0;

    history.replaceChildren();
    for (const milestone of milestones) {
      if (era === 'all' || milestone.era === era) {
        history.append(createMilestone(milestone));
        shown++;
      }
    }

    historyCount.textContent = 'Showing ' + shown + ' of ' + milestones.length + ' moments';
    historyEmpty.hidden = shown > 0;
    $(history).children().stop(true, true).hide().fadeIn(250);
  }

  function countHonours() {
    let total = 0;
    for (const cup of trophies) {
      total += cup.years.length;
    }
    return total;
  }

  function showTotal() {
    const total = countHonours();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    totalText.textContent = total;
    if (reduceMotion) {
      return;
    }

    $({ value: 0 }).animate({ value: total }, {
      duration: 1200,
      step: function (now) {
        totalText.textContent = Math.round(now);
      },
      complete: function () {
        totalText.textContent = total;
      }
    });
  }

  searchInput.addEventListener('input', renderCabinet);
  regionSelect.addEventListener('change', renderCabinet);
  eraSelect.addEventListener('change', renderHistory);

  renderCabinet();
  renderHistory();
  showTotal();
})();