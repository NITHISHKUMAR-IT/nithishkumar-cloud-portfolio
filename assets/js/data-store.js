(function () {
  const DEFAULTS = window.DEFAULT_PORTFOLIO_DATA || { profile: {}, skills: [], projects: [], credentials: [] };
  const CONFIG = window.SUPABASE_CONFIG || {};
  const LOCAL_DATA_KEY = 'nk_cloud_pro_data_v5';
  const LOCAL_PASSWORD_KEY = 'nk_cloud_pro_admin_hash_v5';
  const LOCAL_UNLOCK_KEY = 'nk_cloud_pro_admin_unlocked_v5';
  let client = null;
  let cache = null;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const sortItems = (items) => [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  function isConfigured() {
    return Boolean(CONFIG.url && CONFIG.anonKey && window.supabase && window.supabase.createClient);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    }
    return client;
  }

  function localData() {
    try {
      const stored = localStorage.getItem(LOCAL_DATA_KEY);
      return stored ? JSON.parse(stored) : clone(DEFAULTS);
    } catch (error) {
      console.warn('Local portfolio data could not be read.', error);
      return clone(DEFAULTS);
    }
  }

  function saveLocalData(data) {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
    cache = clone(data);
    window.dispatchEvent(new CustomEvent('portfolio:data-updated', { detail: cache }));
    return cache;
  }

  function normalizeProfile(row) {
    if (!row) return clone(DEFAULTS.profile);
    return {
      id: row.id || 1,
      name: row.name || DEFAULTS.profile.name,
      intro: row.intro || DEFAULTS.profile.intro,
      headline: row.headline || DEFAULTS.profile.headline,
      tagline: row.tagline || DEFAULTS.profile.tagline,
      summary: row.summary || DEFAULTS.profile.summary,
      role: row.role || DEFAULTS.profile.role,
      location: row.location || DEFAULTS.profile.location,
      email: row.email || DEFAULTS.profile.email,
      whatsapp: row.whatsapp || DEFAULTS.profile.whatsapp,
      phoneDisplay: row.phone_display || row.phoneDisplay || DEFAULTS.profile.phoneDisplay,
      linkedin: row.linkedin || DEFAULTS.profile.linkedin,
      github: row.github || DEFAULTS.profile.github,
      resumeUrl: row.resume_url || row.resumeUrl || DEFAULTS.profile.resumeUrl,
      portfolioVersion: row.portfolio_version || row.portfolioVersion || DEFAULTS.profile.portfolioVersion,
      cgpa: row.cgpa || DEFAULTS.profile.cgpa,
      graduation: row.graduation || DEFAULTS.profile.graduation
    };
  }

  function profileToRow(profile) {
    return {
      id: 1,
      name: profile.name,
      intro: profile.intro,
      headline: profile.headline,
      tagline: profile.tagline,
      summary: profile.summary,
      role: profile.role,
      location: profile.location,
      email: profile.email,
      whatsapp: profile.whatsapp,
      phone_display: profile.phoneDisplay,
      linkedin: profile.linkedin,
      github: profile.github,
      resume_url: profile.resumeUrl,
      portfolio_version: profile.portfolioVersion,
      cgpa: profile.cgpa,
      graduation: profile.graduation,
      updated_at: new Date().toISOString()
    };
  }

  function normalizeSkill(row) {
    return {
      id: row.id,
      name: row.name,
      subtitle: row.subtitle || '',
      category: row.category || 'Core',
      status: row.status || '',
      iconUrl: row.icon_url || row.iconUrl || '',
      fallback: row.fallback || (row.name || '').slice(0, 3),
      sort_order: Number(row.sort_order || 0)
    };
  }

  function skillToRow(item) {
    return {
      id: item.id,
      name: item.name,
      subtitle: item.subtitle || '',
      category: item.category || 'Core',
      status: item.status || '',
      icon_url: item.iconUrl || item.icon_url || '',
      fallback: item.fallback || '',
      sort_order: Number(item.sort_order || 0),
      updated_at: new Date().toISOString()
    };
  }

  function normalizeProject(row) {
    return {
      id: row.id,
      title: row.title,
      kicker: row.kicker || '',
      status: row.status || 'In Progress',
      summary: row.summary || '',
      tags: Array.isArray(row.tags) ? row.tags : String(row.tags || '').split(',').map(v => v.trim()).filter(Boolean),
      repo_url: row.repo_url || '',
      live_url: row.live_url || '',
      featured: Boolean(row.featured),
      sort_order: Number(row.sort_order || 0),
      icon: row.icon || 'aws'
    };
  }

  function projectToRow(item) {
    return {
      id: item.id,
      title: item.title,
      kicker: item.kicker || '',
      status: item.status || 'In Progress',
      summary: item.summary || '',
      tags: Array.isArray(item.tags) ? item.tags : String(item.tags || '').split(',').map(v => v.trim()).filter(Boolean),
      repo_url: item.repo_url || '',
      live_url: item.live_url || '',
      featured: Boolean(item.featured),
      sort_order: Number(item.sort_order || 0),
      icon: item.icon || 'aws',
      updated_at: new Date().toISOString()
    };
  }

  function normalizeCredential(row) {
    return {
      id: row.id,
      title: row.title,
      issuer: row.issuer || '',
      type: row.type || 'Credential',
      issued: row.issued || '',
      score: row.score || '',
      description: row.description || '',
      verification_url: row.verification_url || '',
      file_url: row.file_url || '',
      image_url: row.image_url || '',
      featured: Boolean(row.featured),
      sort_order: Number(row.sort_order || 0)
    };
  }

  function credentialToRow(item) {
    return {
      id: item.id,
      title: item.title,
      issuer: item.issuer || '',
      type: item.type || 'Credential',
      issued: item.issued || '',
      score: item.score || '',
      description: item.description || '',
      verification_url: item.verification_url || '',
      file_url: item.file_url || '',
      image_url: item.image_url || '',
      featured: Boolean(item.featured),
      sort_order: Number(item.sort_order || 0),
      updated_at: new Date().toISOString()
    };
  }

  async function loadRemote() {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;

    const [profileResult, skillsResult, projectsResult, credentialsResult] = await Promise.all([
      supabaseClient.from('site_profile').select('*').eq('id', 1).maybeSingle(),
      supabaseClient.from('skills').select('*').order('sort_order'),
      supabaseClient.from('projects').select('*').order('sort_order'),
      supabaseClient.from('credentials').select('*').order('sort_order')
    ]);

    const errors = [profileResult.error, skillsResult.error, projectsResult.error, credentialsResult.error].filter(Boolean);
    if (errors.length) throw errors[0];

    return {
      profile: normalizeProfile(profileResult.data),
      skills: skillsResult.data?.length ? skillsResult.data.map(normalizeSkill) : clone(DEFAULTS.skills),
      projects: projectsResult.data?.length ? projectsResult.data.map(normalizeProject) : clone(DEFAULTS.projects),
      credentials: credentialsResult.data?.length ? credentialsResult.data.map(normalizeCredential) : clone(DEFAULTS.credentials)
    };
  }

  async function loadData(force = false) {
    if (cache && !force) return clone(cache);
    if (isConfigured()) {
      try {
        cache = await loadRemote();
        return clone(cache);
      } catch (error) {
        console.warn('Supabase data could not be loaded. Falling back to local/default content.', error);
      }
    }
    cache = localData();
    return clone(cache);
  }

  async function saveProfile(profile) {
    if (isConfigured()) {
      const { error } = await getClient().from('site_profile').upsert(profileToRow(profile));
      if (error) throw error;
      return loadData(true);
    }
    const data = await loadData();
    data.profile = { ...data.profile, ...profile };
    return saveLocalData(data);
  }

  async function upsertItem(collection, item) {
    const allowed = ['skills', 'projects', 'credentials'];
    if (!allowed.includes(collection)) throw new Error('Unsupported collection.');
    if (!item.id) throw new Error('An ID is required.');

    if (isConfigured()) {
      const converters = { skills: skillToRow, projects: projectToRow, credentials: credentialToRow };
      const { error } = await getClient().from(collection).upsert(converters[collection](item));
      if (error) throw error;
      return loadData(true);
    }

    const data = await loadData();
    const index = data[collection].findIndex(entry => entry.id === item.id);
    if (index >= 0) data[collection][index] = { ...data[collection][index], ...item };
    else data[collection].push(item);
    data[collection] = sortItems(data[collection]);
    return saveLocalData(data);
  }

  async function deleteItem(collection, id) {
    if (isConfigured()) {
      const { error } = await getClient().from(collection).delete().eq('id', id);
      if (error) throw error;
      return loadData(true);
    }
    const data = await loadData();
    data[collection] = data[collection].filter(item => item.id !== id);
    return saveLocalData(data);
  }

  async function uploadFile(file, folder = 'uploads') {
    if (!file) return '';
    if (!isConfigured()) throw new Error('Online file upload requires Supabase configuration.');
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const bucket = CONFIG.storageBucket || 'portfolio-assets';
    const { error } = await getClient().storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = getClient().storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async function signIn(email, password) {
    if (!isConfigured()) return localSignIn(password);
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  async function signOut() {
    if (isConfigured()) {
      const { error } = await getClient().auth.signOut();
      if (error) throw error;
    }
    sessionStorage.removeItem(LOCAL_UNLOCK_KEY);
  }

  async function getSession() {
    if (!isConfigured()) return sessionStorage.getItem(LOCAL_UNLOCK_KEY) === 'true' ? { local: true } : null;
    const { data } = await getClient().auth.getSession();
    return data.session;
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function hasLocalPassword() {
    return Boolean(localStorage.getItem(LOCAL_PASSWORD_KEY));
  }

  async function setLocalPassword(password) {
    if (!password || password.length < 8) throw new Error('Use at least 8 characters.');
    localStorage.setItem(LOCAL_PASSWORD_KEY, await sha256(password));
    sessionStorage.setItem(LOCAL_UNLOCK_KEY, 'true');
    return true;
  }

  async function localSignIn(password) {
    const stored = localStorage.getItem(LOCAL_PASSWORD_KEY);
    if (!stored) throw new Error('Create a local preview password first.');
    if ((await sha256(password)) !== stored) throw new Error('Incorrect password.');
    sessionStorage.setItem(LOCAL_UNLOCK_KEY, 'true');
    return { local: true };
  }


  async function seedDefaults() {
    if (!isConfigured()) {
      return saveLocalData(clone(DEFAULTS));
    }
    const supabaseClient = getClient();
    const operations = [
      supabaseClient.from('site_profile').upsert(profileToRow(DEFAULTS.profile)),
      supabaseClient.from('skills').upsert(DEFAULTS.skills.map(skillToRow)),
      supabaseClient.from('projects').upsert(DEFAULTS.projects.map(projectToRow)),
      supabaseClient.from('credentials').upsert(DEFAULTS.credentials.map(credentialToRow))
    ];
    const results = await Promise.all(operations);
    const error = results.map(result => result.error).find(Boolean);
    if (error) throw error;
    return loadData(true);
  }

  function exportData() {
    const data = cache || localData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  }

  async function importData(file) {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed.profile || !Array.isArray(parsed.skills) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.credentials)) {
      throw new Error('Invalid portfolio data file.');
    }
    return saveLocalData(parsed);
  }

  window.portfolioStore = {
    isConfigured,
    mode: () => isConfigured() ? 'supabase' : 'local',
    loadData,
    saveProfile,
    upsertItem,
    deleteItem,
    uploadFile,
    signIn,
    signOut,
    getSession,
    hasLocalPassword,
    setLocalPassword,
    exportData,
    importData,
    seedDefaults
  };
})();
