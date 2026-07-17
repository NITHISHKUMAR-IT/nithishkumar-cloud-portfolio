(function () {
  const { escapeHTML, safeUrl, credentialImage } = window.portfolioUI;
  let allCredentials = [];

  function setupReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
  }

  function card(item) {
    const verify = safeUrl(item.verification_url);
    const file = safeUrl(item.file_url);
    return `
      <article class="library-card reveal">
        <div class="library-thumb">${credentialImage(item)}</div>
        <span>${escapeHTML(item.type)}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.description || item.issuer)}</p>
        <div class="library-meta">
          <b>${escapeHTML(item.issuer)}</b>
          ${item.issued ? `<b>${escapeHTML(item.issued)}</b>` : ''}
          ${item.score ? `<b>${escapeHTML(item.score)}</b>` : ''}
        </div>
        <div class="library-actions">
          ${verify ? `<a href="${verify}" target="_blank" rel="noopener">Verify ↗</a>` : ''}
          ${file ? `<a href="${file}" target="_blank" rel="noopener">Open certificate ↗</a>` : ''}
        </div>
      </article>`;
  }

  function render(items) {
    const target = document.querySelector('#credential-library');
    const count = document.querySelector('#library-count');
    count.textContent = `${items.length} learning records`;
    target.innerHTML = items.length ? items.map(card).join('') : '<div class="empty-state">No credentials match your search.</div>';
    setupReveal();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
    const data = await window.portfolioStore.loadData(true);
    allCredentials = [...data.credentials].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    render(allCredentials);

    document.querySelector('#credential-search').addEventListener('input', event => {
      const query = event.target.value.trim().toLowerCase();
      const filtered = !query ? allCredentials : allCredentials.filter(item => [item.title, item.issuer, item.type, item.description, item.score].join(' ').toLowerCase().includes(query));
      render(filtered);
    });
  });
})();
