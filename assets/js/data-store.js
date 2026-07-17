(function () {
  'use strict';

  const DEFAULTS = window.DEFAULT_PORTFOLIO_DATA || {
    profile: {},
    skills: [],
    projects: [],
    credentials: []
  };

  const CONFIG = window.SUPABASE_CONFIG || {};
  const LOCAL_DATA_KEY = 'nk_cloud_portfolio_data_v54';

  const PREVIOUS_SKILL_ICONS = {
    aws: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg',
    python: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    linux: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg',
    docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
    github: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg',
    azure: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg',
    gcp: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg',
    terraform: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg'
  };

  let client = null;
  let cache = null;

  const clone = value => JSON.parse(JSON.stringify(value));
  const sortItems = items => [...items].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  function isConfigured() {
    return Boolean(
      CONFIG.url &&
      CONFIG.anonKey &&
      window.supabase &&
      typeof window.supabase.createClient === 'function'
    );
  }

  function getClient() {
    if (!isConfigured()) return null;

    if (!client) {
      client = window.supabase.createClient(CONFIG.url, CONFIG.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }

    return client;
  }

  function readLocalFallback() {
    try {
      const value = localStorage.getItem(LOCAL_DATA_KEY);
      return value ? JSON.parse(value) : clone(DEFAULTS);
    } catch (error) {
      console.warn('Local fallback data could not be read.', error);
      return clone(DEFAULTS);
    }
  }

  function writeLocalFallback(data) {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
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
    const rawIconUrl = row.icon_url || row.iconUrl || '';
    const usesOldLocalImage =
      !rawIconUrl ||
      /^assets\/images\/skills\//i.test(rawIconUrl) ||
      /\.(?:jpe?g|png)$/i.test(rawIconUrl);

    return {
      id: row.id,
      name: row.name,
      subtitle: row.subtitle || '',
      category: row.category || 'Core',
      status: row.status || '',
      iconUrl:
        usesOldLocalImage && PREVIOUS_SKILL_ICONS[row.id]
          ? PREVIOUS_SKILL_ICONS[row.id]
          : rawIconUrl,
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
      tags: Array.isArray(row.tags)
        ? row.tags
        : String(row.tags || '').split(',').map(value => value.trim()).filter(Boolean),
      repo_url: row.repo_url || '',
      live_url: row.live_url || '',
      image_url: row.image_url || '',
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
      tags: Array.isArray(item.tags)
        ? item.tags
        : String(item.tags || '').split(',').map(value => value.trim()).filter(Boolean),
      repo_url: item.repo_url || '',
      live_url: item.live_url || '',
      image_url: item.image_url || '',
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

    const errors = [
      profileResult.error,
      skillsResult.error,
      projectsResult.error,
      credentialsResult.error
    ].filter(Boolean);

    if (errors.length) throw errors[0];

    return {
      profile: normalizeProfile(profileResult.data),
      skills: skillsResult.data?.length
        ? skillsResult.data.map(normalizeSkill)
        : clone(DEFAULTS.skills),
      projects: projectsResult.data?.length
        ? projectsResult.data.map(normalizeProject)
        : clone(DEFAULTS.projects),
      credentials: credentialsResult.data?.length
        ? credentialsResult.data.map(normalizeCredential)
        : clone(DEFAULTS.credentials)
    };
  }

  async function loadData(force = false) {
    if (cache && !force) return clone(cache);

    if (isConfigured()) {
      try {
        cache = await loadRemote();
        writeLocalFallback(cache);
        return clone(cache);
      } catch (error) {
        console.warn(
          'Supabase content could not be loaded. Using the last local/default copy.',
          error
        );
      }
    }

    cache = readLocalFallback();
    return clone(cache);
  }

  async function requireAuthenticatedClient() {
    const supabaseClient = getClient();
    if (!supabaseClient) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (!data.session) throw new Error('Administrator authentication is required.');

    return supabaseClient;
  }

  async function saveProfile(profile) {
    const supabaseClient = await requireAuthenticatedClient();
    const { error } = await supabaseClient
      .from('site_profile')
      .upsert(profileToRow(profile));

    if (error) throw error;
    cache = null;
    return loadData(true);
  }

  async function upsertItem(collection, item) {
    const allowed = ['skills', 'projects', 'credentials'];
    if (!allowed.includes(collection)) throw new Error('Unsupported collection.');
    if (!item.id) throw new Error('A unique ID is required.');

    const supabaseClient = await requireAuthenticatedClient();
    const converters = {
      skills: skillToRow,
      projects: projectToRow,
      credentials: credentialToRow
    };

    const { error } = await supabaseClient
      .from(collection)
      .upsert(converters[collection](item));

    if (error) throw error;
    cache = null;
    return loadData(true);
  }

  async function deleteItem(collection, id) {
    const allowed = ['skills', 'projects', 'credentials'];
    if (!allowed.includes(collection)) throw new Error('Unsupported collection.');

    const supabaseClient = await requireAuthenticatedClient();
    const { error } = await supabaseClient.from(collection).delete().eq('id', id);

    if (error) throw error;
    cache = null;
    return loadData(true);
  }

  function safeFileName(fileName) {
    const parts = String(fileName || 'upload').split('.');
    const extension = parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
    const base = parts
      .join('.')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'upload';

    return `${base}${extension}`;
  }

  async function uploadFile(file, folder = 'uploads') {
    if (!(file instanceof File)) throw new Error('Choose a valid file.');

    const supabaseClient = await requireAuthenticatedClient();
    const bucket = CONFIG.storageBucket || 'portfolio-assets';
    const randomId = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const path = `${folder}/${randomId}-${safeFileName(file.name)}`;

    const { error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
      });

    if (uploadError) throw uploadError;

    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('The public file URL could not be created.');

    return data.publicUrl;
  }

  async function seedDefaults() {
    const supabaseClient = await requireAuthenticatedClient();

    const operations = [
      supabaseClient.from('site_profile').upsert(profileToRow(DEFAULTS.profile)),
      supabaseClient.from('skills').upsert(DEFAULTS.skills.map(skillToRow)),
      supabaseClient.from('projects').upsert(DEFAULTS.projects.map(projectToRow)),
      supabaseClient.from('credentials').upsert(DEFAULTS.credentials.map(credentialToRow))
    ];

    const results = await Promise.all(operations);
    const error = results.map(result => result.error).find(Boolean);
    if (error) throw error;

    cache = null;
    return loadData(true);
  }

  async function signOut() {
    const supabaseClient = getClient();
    if (supabaseClient) await supabaseClient.auth.signOut();
  }

  window.portfolioStore = {
    isConfigured,
    getClient,
    loadData,
    saveProfile,
    upsertItem,
    deleteItem,
    uploadFile,
    seedDefaults,
    signOut
  };
})();
