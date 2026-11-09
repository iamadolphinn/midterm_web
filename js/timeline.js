(function () {
  const list = document.getElementById('timeline');
  const searchInput = document.getElementById('step-search');
  const categorySelect = document.getElementById('step-category');
  const countText = document.getElementById('step-count');
  const emptyText = document.getElementById('timeline-empty');

  if (!list) {
    return;
  }

  function createStep(step) {
    const article = document.createElement('article');
    article.className = step.highlight ? 'step step-big' : 'step';

    const time = document.createElement('time');
    time.className = 'step-time';
    time.dateTime = step.time;
    time.textContent = step.time;

    const body = document.createElement('div');
    body.className = 'step-body';

    const title = document.createElement('h3');
    title.textContent = step.title;

    const text = document.createElement('p');
    text.textContent = step.text;

    body.append(title, text);
    article.append(time, body);
    return article;
  }

  function matches(step, query, category) {
    const categoryOk = category === 'all' || step.category === category;
    const text = (step.title + ' ' + step.text).toLowerCase();
    const queryOk = query === '' || text.includes(query);
    return categoryOk && queryOk;
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    let shown = 0;

    list.replaceChildren();
    for (const step of steps) {
      if (matches(step, query, category)) {
        list.append(createStep(step));
        shown++;
      }
    }

    countText.textContent = 'Showing ' + shown + ' of ' + steps.length + ' steps';
    emptyText.hidden = shown > 0;
    $(list).children().hide().fadeIn(250);
  }

  searchInput.addEventListener('input', render);
  categorySelect.addEventListener('change', render);
  render();
})();