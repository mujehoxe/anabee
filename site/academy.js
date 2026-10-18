(() => {
  const configUrl = 'academy.config.json';
  const toast = document.getElementById('toast');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('visible'), 3200);
  };

  const lmsHref = (config) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal && config.lmsLocalUrl ? config.lmsLocalUrl : config.lmsUrl;
  };

  const renderCourses = (courses) => {
    const grid = document.getElementById('course-grid');
    if (!grid || !courses?.length) return;
    grid.innerHTML = courses.map((course) => `
      <article class="feature-card overflow-hidden flex flex-col h-full">
        <div class="h-36 bg-primary/5 flex items-center justify-center border-b border-border">
          <span class="material-symbols-outlined text-primary text-5xl" style="font-variation-settings:'FILL' 0">${course.icon}</span>
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="text-meta font-semibold text-mint bg-mint/10 px-2 py-0.5 rounded-full">${course.pillar}</span>
            <span class="text-meta text-earth">${course.level}</span>
          </div>
          <h3 class="text-lg font-semibold text-charcoal mb-2">${course.title}</h3>
          <p class="text-earth text-meta flex-grow mb-4">${course.description}</p>
          <div class="flex items-center justify-between text-meta text-earth pt-4 border-t border-border">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span>${course.duration}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">video_library</span>${course.modules} modules</span>
          </div>
        </div>
      </article>
    `).join('');
  };

  const renderFeatures = (features) => {
    const grid = document.getElementById('feature-grid');
    if (!grid || !features?.length) return;
    grid.innerHTML = features.map((f) => `
      <article class="glass-panel rounded-card p-8">
        <span class="material-symbols-outlined text-mint text-3xl mb-4">${f.icon}</span>
        <h3 class="font-semibold text-charcoal text-lg mb-2">${f.title}</h3>
        <p class="text-earth text-body-lg">${f.description}</p>
      </article>
    `).join('');
  };

  const renderSteps = (steps) => {
    const list = document.getElementById('org-steps');
    if (!list || !steps?.length) return;
    list.innerHTML = steps.map((s) => `
      <article class="glass-panel rounded-card p-6 flex gap-4">
        <span class="text-2xl font-bold text-primary/20 shrink-0">${s.step}</span>
        <div>
          <h3 class="font-semibold text-charcoal mb-1">${s.title}</h3>
          <p class="text-earth text-meta">${s.description}</p>
        </div>
      </article>
    `).join('');
  };

  const renderStats = (stats) => {
    const row = document.getElementById('academy-stats');
    if (!row || !stats?.length) return;
    row.innerHTML = stats.map((s) => `
      <div class="glass-panel rounded-card p-4 text-center">
        <p class="text-3xl font-bold text-primary">${s.value}</p>
        <p class="text-meta text-earth mt-1">${s.label}</p>
      </div>
    `).join('');
  };

  const bindActions = (config) => {
    const href = lmsHref(config);
    document.querySelectorAll('[data-lms-login]').forEach((el) => {
      el.href = href;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    });
    document.getElementById('request-org-access')?.addEventListener('click', () => {
      const subject = encodeURIComponent(`${config.siteName} — Organization access request`);
      const body = encodeURIComponent('Organization name:\nStaff count:\nPillar tracks needed:\n\n');
      window.location.href = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`;
    });
    document.getElementById('academy-demo')?.addEventListener('click', () => {
      showToast('Academy demo environment launches with learn.anabee.org — contact us for early org access.');
    });
  };

  const applyConfig = (config) => {
    document.title = `${config.siteName} — ANABEE`;
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el && text) el.textContent = text;
    };
    setText('academy-badge', config.hero?.badge);
    setText('academy-headline', config.hero?.headline);
    setText('academy-description', config.hero?.description);
    setText('academy-platform', `Powered by ${config.platform === 'frappe-lms' ? 'Frappe Learning' : config.platform === 'moodle' ? 'Moodle' : config.platform} (open source)`);
    renderStats(config.stats);
    renderFeatures(config.features);
    renderSteps(config.orgSteps);
    renderCourses(config.courses);
    bindActions(config);
  };

  fetch(configUrl)
    .then((r) => r.json())
    .then(applyConfig)
    .catch(() => showToast('Could not load academy configuration.'));
})();
