(function () {
  const store = window.portfolioStore;
  const { escapeHTML } = window.portfolioUI;
  let data = null;
  let currentMode = store.mode();

  const authCard = document.querySelector('#auth-card');
  const adminApp = document.querySelector('#admin-app');
  const logoutButton = document.querySelector('#logout-button');
  const authMessage = document.querySelector('#auth-message');
  const globalMessage = document.querySelector('#global-message');

  function message(target, text = '', type = '') {
    target.textContent = text;
    target.className = target === authMessage ? 'form-message' : 'global-message';
    if (type) target.classList.add(type);
  }

  function slugify(value) {
    return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function formObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function setModeUI() {
    const banner = document.querySelector('#mode-banner');
    const systemMode = document.querySelector('#system-mode');
    const uploadNote = document.querySelector('#upload-note');
    const emailField = document.querySelector('#email-field');
    const authTitle = document.querySelector('#auth-title');
    const authCopy = document.querySelector('#auth-copy');

    if (currentMode === 'supabase') {
      banner.textContent = 'Secure online mode: Supabase connected';
      banner.className = 'mode-banner remote';
      systemMode.textContent = 'Supabase online mode';
      uploadNote.textContent = 'PDF and image uploads will be stored in the public portfolio-assets bucket. Access is protected by RLS write policies.';
      emailField.hidden = false;
      document.querySelector('#login-email').required = true;
      authTitle.textContent = 'Sign in to the live admin panel';
      authCopy.textContent = 'Use the email and password of the Supabase admin user.';
    } else {
      banner.textContent = 'Local preview mode: changes stay only in this browser';
      banner.className = 'mode-banner local';
      systemMode.textContent = 'Local preview mode';
      uploadNote.textContent = 'Direct file upload is disabled in local preview mode. Configure Supabase for online certificate and image uploads.';
      emailField.hidden = true;
      document.querySelector('#login-email').required = false;
      authTitle.textContent = 'Unlock local preview admin';
      authCopy.textContent = 'This password protects only this browser. It is not secure online authentication.';
    }
  }

  async function showAuthState() {
    const session = await store.getSession();
    if (session) return openAdmin();

    authCard.hidden = false;
    adminApp.hidden = true;
    logoutButton.hidden = true;

    if (currentMode === 'local' && !(await store.hasLocalPassword())) {
      document.querySelector('#login-form').hidden = true;
      document.querySelector('#setup-password-form').hidden = false;
      document.querySelector('#auth-title').textContent = 'Create a local preview password';
      document.querySelector('#auth-copy').textContent = 'Use at least 8 characters. This protects only local preview data in this browser.';
    } else {
      document.querySelector('#login-form').hidden = false;
      document.querySelector('#setup-password-form').hidden = true;
    }
  }

  async function openAdmin() {
    authCard.hidden = true;
    adminApp.hidden = false;
    logoutButton.hidden = false;
    await refreshData();
  }

  async function refreshData() {
    data = await store.loadData(true);
    fillProfileForm();
    renderAllLists();
  }

  function fillProfileForm() {
    const form = document.querySelector('#profile-form');
    Object.entries(data.profile).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field) field.value = value ?? '';
    });
  }

  function recordCard(collection, item) {
    let meta = [];
    let description = '';
    if (collection === 'skills') {
      meta = [item.category, item.status, `Order ${item.sort_order}`];
      description = item.subtitle;
    } else if (collection === 'projects') {
      meta = [item.status, ...(item.tags || []).slice(0, 3), `Order ${item.sort_order}`];
      description = item.summary;
    } else {
      meta = [item.issuer, item.type, item.score, item.featured ? 'Homepage' : '', `Order ${item.sort_order}`].filter(Boolean);
      description = item.description;
    }
    return `
      <article class="record-card" data-id="${escapeHTML(item.id)}" data-collection="${collection}">
        <div class="record-card-head">
          <div><h3>${escapeHTML(item.name || item.title)}</h3><p>${escapeHTML(description || '')}</p></div>
          <div class="record-actions"><button data-action="edit" type="button">Edit</button><button data-action="delete" type="button">Delete</button></div>
        </div>
        <div class="record-meta">${meta.map(value => `<span>${escapeHTML(value)}</span>`).join('')}</div>
      </article>`;
  }

  function renderAllLists() {
    document.querySelector('#skills-list').innerHTML = data.skills.map(item => recordCard('skills', item)).join('');
    document.querySelector('#projects-list').innerHTML = data.projects.map(item => recordCard('projects', item)).join('');
    document.querySelector('#credentials-list').innerHTML = data.credentials.map(item => recordCard('credentials', item)).join('');
  }

  function resetForm(formId) {
    const form = document.querySelector(`#${formId}`);
    form.reset();
    const editing = form.elements.namedItem('editingId');
    if (editing) editing.value = '';
    const idField = form.elements.namedItem('id');
    if (idField) idField.readOnly = false;
  }

  function populateForm(collection, item) {
    const ids = { skills: 'skill-form', projects: 'project-form', credentials: 'credential-form' };
    const form = document.querySelector(`#${ids[collection]}`);
    resetForm(ids[collection]);
    form.elements.namedItem('editingId').value = item.id;
    Object.entries(item).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (!field) return;
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else if (key === 'tags' && Array.isArray(value)) field.value = value.join(', ');
      else field.value = value ?? '';
    });
    form.elements.namedItem('id').readOnly = true;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function deleteRecord(collection, id) {
    const item = data[collection].find(entry => entry.id === id);
    if (!item || !confirm(`Delete "${item.name || item.title}"?`)) return;
    try {
      await store.deleteItem(collection, id);
      await refreshData();
      message(globalMessage, 'Record deleted.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Delete failed.', 'error');
    }
  }

  document.querySelector('#login-form').addEventListener('submit', async event => {
    event.preventDefault();
    message(authMessage, 'Signing in...');
    try {
      await store.signIn(document.querySelector('#login-email').value.trim(), document.querySelector('#login-password').value);
      message(authMessage, '');
      await openAdmin();
    } catch (error) {
      message(authMessage, error.message || 'Sign in failed.', 'error');
    }
  });

  document.querySelector('#setup-password-form').addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.querySelector('#setup-password').value;
    const confirmation = document.querySelector('#setup-password-confirm').value;
    if (password !== confirmation) return message(authMessage, 'Passwords do not match.', 'error');
    try {
      await store.setLocalPassword(password);
      await openAdmin();
    } catch (error) {
      message(authMessage, error.message, 'error');
    }
  });

  logoutButton.addEventListener('click', async () => {
    await store.signOut();
    location.reload();
  });

  document.querySelectorAll('.tab-button').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === button.dataset.tab));
  }));

  document.querySelectorAll('[data-reset-form]').forEach(button => button.addEventListener('click', () => resetForm(button.dataset.resetForm)));

  document.querySelector('#profile-form').addEventListener('submit', async event => {
    event.preventDefault();
    try {
      await store.saveProfile(formObject(event.currentTarget));
      await refreshData();
      message(globalMessage, 'Profile updated.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Profile update failed.', 'error');
    }
  });

  document.querySelector('#skill-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const item = formObject(form);
    item.id = slugify(item.id || item.name);
    item.sort_order = Number(item.sort_order || 0);
    try {
      await store.upsertItem('skills', item);
      resetForm('skill-form');
      await refreshData();
      message(globalMessage, 'Skill saved.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Skill save failed.', 'error');
    }
  });

  document.querySelector('#project-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = formObject(form);
    const item = {
      ...raw,
      id: slugify(raw.id || raw.title),
      tags: String(raw.tags || '').split(',').map(value => value.trim()).filter(Boolean),
      featured: form.elements.namedItem('featured').checked,
      sort_order: Number(raw.sort_order || 0)
    };
    delete item.editingId;
    try {
      await store.upsertItem('projects', item);
      resetForm('project-form');
      await refreshData();
      message(globalMessage, 'Project saved.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Project save failed.', 'error');
    }
  });

  document.querySelector('#credential-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = formObject(form);
    const certificateFile = document.querySelector('#credential-file').files[0];
    const imageFile = document.querySelector('#credential-image').files[0];
    const item = {
      ...raw,
      id: slugify(raw.id || raw.title),
      featured: form.elements.namedItem('featured').checked,
      sort_order: Number(raw.sort_order || 0)
    };
    delete item.editingId;
    try {
      if (certificateFile) item.file_url = await store.uploadFile(certificateFile, 'certificates');
      if (imageFile) item.image_url = await store.uploadFile(imageFile, 'credential-images');
      await store.upsertItem('credentials', item);
      resetForm('credential-form');
      document.querySelector('#credential-file').value = '';
      document.querySelector('#credential-image').value = '';
      await refreshData();
      message(globalMessage, 'Credential saved.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Credential save failed.', 'error');
    }
  });

  document.querySelectorAll('.record-list').forEach(list => list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    const card = event.target.closest('.record-card');
    if (!button || !card) return;
    const collection = card.dataset.collection;
    const id = card.dataset.id;
    const item = data[collection].find(entry => entry.id === id);
    if (button.dataset.action === 'edit') populateForm(collection, item);
    if (button.dataset.action === 'delete') deleteRecord(collection, id);
  }));

  document.querySelector('#seed-defaults').addEventListener('click', async () => {
    if (!confirm('Seed the current portfolio profile, skills, projects, and credentials into the connected data source?')) return;
    try {
      await store.seedDefaults();
      await refreshData();
      message(globalMessage, 'Current portfolio data seeded successfully.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Seeding failed.', 'error');
    }
  });

  document.querySelector('#export-data').addEventListener('click', () => store.exportData());
  document.querySelector('#import-data').addEventListener('change', async event => {
    try {
      await store.importData(event.target.files[0]);
      await refreshData();
      message(globalMessage, 'Data imported into local preview mode.', 'success');
    } catch (error) {
      message(globalMessage, error.message || 'Import failed.', 'error');
    }
  });

  document.addEventListener('DOMContentLoaded', async () => {
    setModeUI();
    await showAuthState();
  });
})();
