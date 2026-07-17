(function () {
  function escapeHTML(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeUrl(value = '') {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^(https?:|mailto:|tel:)/i.test(text)) return escapeHTML(text);
    if (/^(assets\/|\.\/|\.\.\/)/.test(text)) return escapeHTML(text);
    return '';
  }

  function brandIcon(skill, className = 'brand-icon') {
    const item = skill || { name: 'Technology', iconUrl: '', fallback: 'IT' };
    const url = safeUrl(item.iconUrl || item.icon_url || '');
    return `
      <span class="${escapeHTML(className)}" title="${escapeHTML(item.name)}">
        <span class="fallback"${url ? ' style="display:none"' : ''}>${escapeHTML(item.fallback || item.name.slice(0, 3))}</span>
        ${url ? `<img src="${url}" alt="${escapeHTML(item.name)} logo" loading="lazy" onerror="this.style.display='none'; var fb=this.previousElementSibling; if (fb) fb.style.display='';">` : ''}
      </span>`;
  }

  function logoSetHTML(ids, skillMap, className = 'mini-brand') {
    return ids.map(id => brandIcon(skillMap[id], className)).join('');
  }

  function credentialImage(credential) {
    const image = safeUrl(credential.image_url || '');
    if (image) return `<img src="${image}" alt="${escapeHTML(credential.title)}" loading="lazy" onerror="this.remove()">`;
    return `<div class="credential-fallback-mark">${escapeHTML((credential.issuer || 'Credential').slice(0, 3).toUpperCase())}</div>`;
  }

  window.portfolioUI = { escapeHTML, safeUrl, brandIcon, logoSetHTML, credentialImage };
})();
