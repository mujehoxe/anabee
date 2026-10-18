(() => {
  const API_URL = '/.netlify/functions/league';
  // Also try /api/league (netlify.toml redirect) if primary fails
  const API_FALLBACK = '/api/league';
  const fixturesEl = document.getElementById('live-fixtures');
  const standingsEl = document.getElementById('live-standings');
  const recentEl = document.getElementById('live-recent');
  const clubsEl = document.getElementById('live-clubs');
  const metaEl = document.getElementById('league-data-meta');
  const filterInput = document.getElementById('league-filter');
  if (!fixturesEl || !standingsEl) return;

  let cache = null;

  const formatDate = (iso) => {
    if (!iso) return 'TBD';
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatTime = (t) => {
    if (!t || t === '00:00:00') return '';
    return t.slice(0, 5);
  };

  const badge = (url, name) =>
    url
      ? `<img src="${url}" alt="" width="24" height="24" class="w-6 h-6 object-contain shrink-0" loading="lazy" decoding="async"/>`
      : `<span class="w-6 h-6 rounded-full bg-mist border border-border shrink-0" aria-hidden="true"></span>`;

  const renderFixtures = (fixtures, query = '') => {
    const q = query.trim().toLowerCase();
    const list = fixtures.filter(
      (f) => !q || f.home.toLowerCase().includes(q) || f.away.toLowerCase().includes(q) || (f.venue || '').toLowerCase().includes(q)
    );
    if (!list.length) {
      fixturesEl.innerHTML = `<p class="text-earth text-meta p-4">No upcoming fixtures match your filter.</p>`;
      return;
    }
    fixturesEl.innerHTML = list
      .map(
        (f) => `
      <article class="glass-panel rounded-card p-5 flex flex-wrap items-center gap-4 league-row" data-home="${f.home}" data-away="${f.away}">
        <div class="shrink-0 w-20 text-center">
          <p class="text-meta font-bold text-adnoc">${f.date ? formatDate(f.date) : f.round || 'TBD'}</p>
          <p class="text-xs text-earth">${f.date && f.round ? f.round : formatTime(f.time) || 'Kickoff TBA'}</p>
        </div>
        <div class="flex-1 min-w-[12rem] space-y-1">
          <div class="flex items-center gap-2 font-semibold text-charcoal">
            ${badge(f.homeBadge, f.home)}
            <span>${f.home}</span>
            <span class="text-earth font-normal text-meta">vs</span>
            ${badge(f.awayBadge, f.away)}
            <span>${f.away}</span>
          </div>
          <p class="text-meta text-earth">${[f.venue, formatTime(f.time)].filter(Boolean).join(' · ') || 'Venue TBA'}</p>
        </div>
        <span class="text-meta font-semibold text-mint px-3 py-1 rounded-btn bg-mint/10">${f.status === 'NS' ? 'Upcoming' : f.status || 'Scheduled'}</span>
      </article>`
      )
      .join('');
  };

  const renderStandings = (rows, query = '') => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => !q || r.team.toLowerCase().includes(q));
    if (!list.length) {
      standingsEl.innerHTML = `<p class="text-earth text-meta p-4">No clubs match your filter.</p>`;
      return;
    }
    standingsEl.innerHTML = `
      <div class="overflow-x-auto">
        <table class="standings-table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Club</th>
              <th class="text-center">P</th>
              <th class="text-center">W</th>
              <th class="text-center">D</th>
              <th class="text-center">L</th>
              <th class="text-center">GD</th>
              <th class="text-center">Pts</th>
            </tr>
          </thead>
          <tbody class="text-charcoal">
            ${list
              .map(
                (r) => `
              <tr data-team="${r.team}">
                <td>${r.rank}</td>
                <td>
                  <span class="inline-flex items-center gap-2">
                    ${badge(r.badge, r.team)}
                    <span>${r.team}</span>
                  </span>
                </td>
                <td class="text-center">${r.played}</td>
                <td class="text-center">${r.won}</td>
                <td class="text-center">${r.draw}</td>
                <td class="text-center">${r.lost}</td>
                <td class="text-center">${r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                <td class="text-center font-semibold">${r.points}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`;
  };

  const renderRecent = (rows) => {
    if (!recentEl) return;
    if (!rows.length) {
      recentEl.innerHTML = '';
      return;
    }
    recentEl.innerHTML = `
      <h3 class="font-semibold text-charcoal mb-4">Recent results</h3>
      <div class="space-y-3">
        ${rows
          .map(
            (r) => `
          <article class="glass-panel rounded-card p-4 flex flex-wrap items-center justify-between gap-3">
            <span class="text-meta text-earth">${formatDate(r.date)}</span>
            <div class="flex items-center gap-2 font-semibold text-charcoal text-meta sm:text-base">
              ${badge(r.homeBadge, r.home)}
              <span>${r.home}</span>
              <span class="text-adnoc font-bold">${r.homeScore}–${r.awayScore}</span>
              <span>${r.away}</span>
              ${badge(r.awayBadge, r.away)}
            </div>
          </article>`
          )
          .join('')}
      </div>`;
  };

  const renderClubs = (rows) => {
    if (!clubsEl || !rows.length) return;
    clubsEl.innerHTML = rows
      .map(
        (r) => `
      <div class="icon-frame icon-frame-lg" title="${r.team}">
        ${
          r.badge
            ? `<img src="${r.badge}" alt="${r.team}" loading="lazy" decoding="async"/>`
            : `<span class="text-meta text-earth text-center px-1">${r.team.split(' ').slice(-1)[0]}</span>`
        }
      </div>`
      )
      .join('');
  };

  const applyFilter = () => {
    if (!cache) return;
    const q = filterInput?.value || '';
    renderFixtures(cache.fixtures, q);
    renderStandings(cache.standings, q);
  };

  const showError = (msg) => {
    fixturesEl.innerHTML = `<p class="text-earth p-4">${msg} <a class="text-adnoc underline" href="https://uaeproleague.ae/en/fixtures" target="_blank" rel="noopener">View on UAE Pro League</a></p>`;
    standingsEl.innerHTML = `<p class="text-earth p-4">Standings unavailable. <a class="text-adnoc underline" href="https://uaeproleague.ae/en/standings" target="_blank" rel="noopener">Official standings</a></p>`;
  };

  const load = async () => {
    fixturesEl.innerHTML = `<p class="text-earth text-meta p-4 animate-pulse">Loading live fixtures…</p>`;
    standingsEl.innerHTML = `<p class="text-earth text-meta p-4 animate-pulse">Loading live standings…</p>`;
    try {
      let res = await fetch(API_URL);
      if (!res.ok) res = await fetch(API_FALLBACK);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cache = await res.json();
      if (cache.error) throw new Error(cache.detail || cache.error);

      renderFixtures(cache.fixtures);
      renderStandings(cache.standings);
      renderRecent(cache.recent || []);
      renderClubs(cache.standings);

      if (metaEl) {
        const updated = new Date(cache.fetchedAt);
        const sourceLabel = cache.source || 'Live feed';
        metaEl.innerHTML = `
          Live data · Standings ${cache.standingsSeason}
          ${cache.fixturesTotal ? `· ${cache.fixturesTotal} fixtures ${cache.fixturesSeason}` : ''}
          · Updated ${updated.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
          · ${sourceLabel}
          · <a class="text-adnoc underline" href="${cache.officialUrl}" target="_blank" rel="noopener">uaeproleague.ae</a>`;
      }
    } catch (err) {
      console.error('League data failed', err);
      showError('Could not load live league data right now.');
      if (metaEl) metaEl.textContent = 'Live feed temporarily unavailable';
    }
  };

  filterInput?.addEventListener('input', applyFilter);
  load();
  // Refresh every hour while the tab stays open
  setInterval(load, 60 * 60 * 1000);
})();
