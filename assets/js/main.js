(function () {
  const { escapeHTML, safeUrl, brandIcon, logoSetHTML, credentialImage } = window.portfolioUI;
  let revealObserver;

  function setupNavigation() {
    const menuButton = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.primary-menu');
    if (!menuButton || !menu) return;
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  function setupReveal() {
    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  }

  function setupEcosystemMotion() {
    const ecosystem = document.querySelector('#hero-ecosystem');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ecosystem || reduceMotion) return;

    ecosystem.addEventListener('pointermove', event => {
      const rect = ecosystem.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      ecosystem.style.setProperty('--ecosystem-x', `${x * 10}px`);
      ecosystem.style.setProperty('--ecosystem-y', `${y * 8}px`);
    });

    ecosystem.addEventListener('pointerleave', () => {
      ecosystem.style.setProperty('--ecosystem-x', '0px');
      ecosystem.style.setProperty('--ecosystem-y', '0px');
    });
  }

  function applyProfile(profile) {
    document.querySelectorAll('[data-profile]').forEach(el => {
      const key = el.dataset.profile;
      if (profile[key] !== undefined) el.textContent = profile[key];
    });

    document.querySelectorAll('[data-profile-link]').forEach(el => {
      const key = el.dataset.profileLink;
      let url = profile[key] || '';
      if (key === 'email') url = `mailto:${profile.email}`;
      if (key === 'whatsapp') url = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(`Hello ${profile.name}, I visited your cloud portfolio.`)}`;
      if (url) el.setAttribute('href', url);
    });

    document.title = `${profile.name} | Cloud & DevOps Portfolio`;
  }

  function renderSkills(skills) {
    const target = document.querySelector('#skill-grid');
    const core = document.querySelector('#ecosystem-core');
    if (!target || !core) return;

    const aws = skills.find(skill => skill.id === 'aws') || skills[0];
    const satellites = skills.filter(skill => skill !== aws);

    core.innerHTML = `
      <span class="ecosystem-core-ring"></span>
      ${brandIcon(aws, 'ecosystem-core-logo')}
      <span class="sr-only">${escapeHTML(aws.name)}</span>
    `;

    target.innerHTML = satellites.map((skill, index) => `
      <article class="ecosystem-satellite ecosystem-satellite-${index + 1}" aria-label="${escapeHTML(skill.name)}" title="${escapeHTML(skill.name)}">
        ${brandIcon(skill, 'ecosystem-logo')}
        <span class="sr-only">${escapeHTML(skill.name)}</span>
      </article>
    `).join('');
  }

  function renderStaticLogoSets(skillMap) {
    document.querySelectorAll('[data-logo-set]').forEach(el => {
      const ids = el.dataset.logoSet.split(',').map(value => value.trim()).filter(Boolean);
      el.innerHTML = logoSetHTML(ids, skillMap, 'mini-brand');
    });
  }

  function visualIds(project, skillMap) {
    const first = project.icon && skillMap[project.icon] ? project.icon : 'aws';
    const candidates = [first];
    if (first === 'aws') candidates.push('linux', 'python', 'github');
    else if (first === 'docker') candidates.push('linux', 'github', 'aws');
    else if (first === 'linux') candidates.push('aws', 'github', 'python');
    else candidates.push('github', 'aws', 'linux');
    return [...new Set(candidates)].filter(id => skillMap[id]).slice(0, 4);
  }

  function renderProjects(projects, skillMap) {
    const target = document.querySelector('#project-list');
    if (!target) return;
    if (!projects.length) {
      target.innerHTML = '<div class="empty-state">No projects have been published yet.</div>';
      return;
    }
    target.innerHTML = projects.map(project => {
      const repo = safeUrl(project.repo_url);
      const live = safeUrl(project.live_url);
      const ids = visualIds(project, skillMap);
      return `
        <article class="project-feature reveal">
          <div>
            <p class="project-kicker">${escapeHTML(project.kicker || project.status)}</p>
            <h3>${escapeHTML(project.title)}</h3>
            <p class="project-copy">${escapeHTML(project.summary)}</p>
            <div class="project-tags">${project.tags.map(tag => `<span class="project-tag">${escapeHTML(tag)}</span>`).join('')}</div>
            <div class="project-links">
              ${repo ? `<a href="${repo}" target="_blank" rel="noopener">Repository ↗</a>` : ''}
              ${live ? `<a href="${live}" target="_blank" rel="noopener">Live demo ↗</a>` : ''}
            </div>
            <div class="project-status">Status: ${escapeHTML(project.status)}</div>
          </div>
          <div class="project-visual" aria-label="${escapeHTML(project.title)} visual">
            ${safeUrl(project.image_url)
              ? `<img class="project-cover-image" src="${safeUrl(project.image_url)}" alt="${escapeHTML(project.title)} project preview" loading="lazy">`
              : `<div class="project-logo-stack">${logoSetHTML(ids, skillMap, 'brand-icon')}</div>`}
          </div>
        </article>`;
    }).join('');
  }

  function renderFeaturedCredentials(credentials) {
    const target = document.querySelector('#featured-credentials');
    if (!target) return;
    const selected = credentials.filter(item => item.featured).slice(0, 6);
    if (!selected.length) {
      target.innerHTML = '<div class="empty-state">No featured credentials selected.</div>';
      return;
    }
    target.innerHTML = selected.map(item => {
      const targetUrl = safeUrl(item.verification_url || item.file_url || 'credentials.html');
      return `
        <a class="credential-tile" href="${targetUrl || 'credentials.html'}" target="${targetUrl && targetUrl !== 'credentials.html' ? '_blank' : '_self'}" rel="noopener">
          <div class="credential-image">${credentialImage(item)}</div>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.issuer)}${item.issued ? ` · ${escapeHTML(item.issued)}` : ''}</p>
          ${item.score ? `<span class="credential-score">${escapeHTML(item.score)}</span>` : ''}
        </a>`;
    }).join('');
  }

  async function render() {
    const data = await window.portfolioStore.loadData(true);
    const skills = [...data.skills].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const projects = [...data.projects].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const credentials = [...data.credentials].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
    const skillMap = Object.fromEntries(skills.map(skill => [skill.id, skill]));

    applyProfile(data.profile);
    renderSkills(skills);
    renderStaticLogoSets(skillMap);
    renderProjects(projects, skillMap);
    renderFeaturedCredentials(credentials);
    document.querySelector('#project-count').textContent = String(projects.length);
    document.querySelector('#credential-count').textContent = String(credentials.length);
    setupReveal();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    setupNavigation();
    setupEcosystemMotion();
    const year = document.querySelector('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
    await render();
  });

  window.addEventListener('portfolio:data-updated', render);
})();
