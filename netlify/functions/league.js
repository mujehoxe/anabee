/**
 * Live ADNOC Pro League data from the official UAE Pro League site.
 * Falls back to TheSportsDB if the official endpoints are unavailable.
 * Cached ~1 hour at the CDN edge.
 */
const OFFICIAL = 'https://uaeproleague.ae';
const SPORTDB = 'https://www.thesportsdb.com/api/v1/json/3';
const LEAGUE_ID = '4678';

const headersOut = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json, text/html, */*',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'ANABEE-Academy-Bot/1.0 (+https://anabee.org)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchJson(url) {
  const text = await fetchText(url);
  if (!text || !text.trim()) return {};
  return JSON.parse(text);
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Discover ADNOC PRO LEAGUE competition UUIDs per season from the fixtures page. */
async function loadCompetitionMap() {
  const html = await fetchText(`${OFFICIAL}/en/fixtures`);
  const match = html.match(/var season = (\{[\s\S]*?\});/);
  if (!match) throw new Error('Could not parse official season map');
  const season = JSON.parse(match[1]);
  const map = {};
  for (const [seasonId, comps] of Object.entries(season)) {
    const adnoc = (comps || []).find((c) => /ADNOC\s*PRO\s*LEAGUE/i.test(c.name || ''));
    if (adnoc) map[seasonId] = adnoc.id;
  }
  // Season select labels live in the same page
  const labels = {};
  for (const m of html.matchAll(/<option value="(\d+)"[^>]*>\s*(\d{4}\/\d{4})\s*<\/option>/g)) {
    labels[m[1]] = m[2].replace('/', '-');
  }
  return { map, labels };
}

function pickCompetition(map, labels) {
  // Prefer highest numeric season id (newest)
  const ids = Object.keys(map)
    .map(Number)
    .sort((a, b) => b - a);
  if (!ids.length) throw new Error('No ADNOC competition ids found');
  const newest = String(ids[0]);
  const prev = ids[1] != null ? String(ids[1]) : newest;
  return {
    newestId: map[newest],
    newestLabel: labels[newest] || newest,
    prevId: map[prev],
    prevLabel: labels[prev] || prev,
    newestSeasonKey: newest,
    prevSeasonKey: prev,
  };
}

function parseStandingsHtml(html) {
  const standings = [];
  // Each club row lives in accordion-title with rank, logo, name, then 8 stat cells.
  const rowRe =
    /accordion-title[\s\S]*?<strong>(\d+)<\/strong>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[\s\S]*?<span>([^<]+)<\/span>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span>(\d+)<\/span>[\s\S]*?<span>([+\-]?\d+)\s*<\/span>[\s\S]*?<strong>(\d+)<\/strong>/g;

  let m;
  while ((m = rowRe.exec(html)) !== null) {
    standings.push({
      rank: Number(m[1]),
      badge: m[2],
      team: (m[4] || m[3] || '').trim(),
      played: Number(m[5]),
      won: Number(m[6]),
      draw: Number(m[7]),
      lost: Number(m[8]),
      ga: Number(m[9]),
      gf: Number(m[10]),
      gd: Number(m[11]),
      points: Number(m[12]),
      form: '',
    });
  }
  return standings;
}

function parseFixturesHtml(html) {
  const names = [...html.matchAll(/upcomingMatches__club-name">\s*([^<]+?)\s*</g)].map((m) =>
    m[1].replace(/\s+/g, ' ').trim()
  );
  const rounds = [...html.matchAll(/upcomingMatches__time-info-date">\s*([\s\S]*?)\s*<\/span>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  );
  const times = [...html.matchAll(/upcomingMatches__time-info-num">\s*([^<]+)/g)].map((m) =>
    m[1].replace(/\s+/g, ' ').trim()
  );
  const logos = [...html.matchAll(/<img[^>]+upcomingMatches__logo-img[^>]*>/g)].map((m) => {
    const src = m[0].match(/src="([^"]+)"/);
    return src ? src[1] : null;
  });

  const fixtures = [];
  for (let i = 0; i + 1 < names.length; i += 2) {
    const idx = Math.floor(i / 2);
    fixtures.push({
      id: `official-${idx}`,
      home: names[i],
      away: names[i + 1],
      homeBadge: logos[i] || null,
      awayBadge: logos[i + 1] || null,
      date: null,
      time: times[idx] && times[idx] !== 'TBC' ? times[idx] : null,
      round: rounds[idx] || null,
      venue: null,
      status: 'NS',
    });
  }
  return fixtures;
}

async function loadOfficial() {
  const { map, labels } = await loadCompetitionMap();
  const pick = pickCompetition(map, labels);

  // Standings: try newest first; if empty/pre-season, use previous
  let standingsSeason = pick.newestLabel;
  let standingsHtml = (await fetchJson(`${OFFICIAL}/en/standings/list?seasonCompetitionId=${pick.newestId}`)).html || '';
  let standings = parseStandingsHtml(standingsHtml);
  if (standings.length < 5) {
    standingsHtml = (await fetchJson(`${OFFICIAL}/en/standings/list?seasonCompetitionId=${pick.prevId}`)).html || '';
    standings = parseStandingsHtml(standingsHtml);
    standingsSeason = pick.prevLabel;
  }

  // Fixtures: prefer newest season schedule (full calendar for 2026/27)
  let fixturesHtml =
    (await fetchJson(`${OFFICIAL}/en/fixtures/matches?seasonCompetitionId=${pick.newestId}`)).html || '';
  let fixtures = parseFixturesHtml(fixturesHtml);
  let fixturesSeason = pick.newestLabel;
  if (!fixtures.length) {
    fixturesHtml = (await fetchJson(`${OFFICIAL}/en/fixtures/matches?seasonCompetitionId=${pick.prevId}`)).html || '';
    fixtures = parseFixturesHtml(fixturesHtml);
    fixturesSeason = pick.prevLabel;
  }
  // Expose next matchweek slice for the UI (keep full list available as fixturesAll)
  const fixturesAll = fixtures;
  fixtures = fixtures.slice(0, 10);

  // Official results endpoints are auth-gated; pull recent scores from SportsDB when possible
  let recent = [];
  try {
    const past = await fetchJson(`${SPORTDB}/eventspastleague.php?id=${LEAGUE_ID}`);
    recent = (past.events || [])
      .filter((e) => e.intHomeScore != null)
      .slice(0, 6)
      .map((e) => ({
        id: e.idEvent,
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        homeBadge: e.strHomeTeamBadge,
        awayBadge: e.strAwayTeamBadge,
        homeScore: Number(e.intHomeScore),
        awayScore: Number(e.intAwayScore),
        date: e.dateEvent,
        round: e.intRound,
        venue: e.strVenue,
      }));
  } catch (_) {
    /* optional */
  }

  return {
    source: 'UAE Pro League (official)',
    officialUrl: 'https://uaeproleague.ae/en',
    league: 'ADNOC Pro League',
    fetchedAt: new Date().toISOString(),
    standingsSeason,
    fixturesSeason,
    standings,
    fixtures,
    fixturesTotal: fixturesAll.length,
    recent,
  };
}

async function loadSportsDbFallback() {
  const now = new Date();
  const start = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const season = `${start}-${start + 1}`;
  const prev = `${start - 1}-${start}`;

  const tableRes = await fetchJson(`${SPORTDB}/lookuptable.php?l=${LEAGUE_ID}&s=${encodeURIComponent(season)}`);
  let table = tableRes.table || [];
  let standingsSeason = season;
  if (!table.length) {
    const prevRes = await fetchJson(`${SPORTDB}/lookuptable.php?l=${LEAGUE_ID}&s=${encodeURIComponent(prev)}`);
    table = prevRes.table || [];
    standingsSeason = prev;
  }

  const next = await fetchJson(`${SPORTDB}/eventsnextleague.php?id=${LEAGUE_ID}`);
  const past = await fetchJson(`${SPORTDB}/eventspastleague.php?id=${LEAGUE_ID}`);

  return {
    source: 'TheSportsDB (fallback)',
    officialUrl: 'https://uaeproleague.ae/en',
    league: 'ADNOC Pro League',
    leagueId: LEAGUE_ID,
    fetchedAt: new Date().toISOString(),
    standingsSeason,
    fixturesSeason: season,
    standings: (table || []).map((row) => ({
      rank: Number(row.intRank),
      team: row.strTeam,
      badge: row.strBadge,
      played: Number(row.intPlayed),
      won: Number(row.intWin),
      draw: Number(row.intDraw),
      lost: Number(row.intLoss),
      gf: Number(row.intGoalsFor),
      ga: Number(row.intGoalsAgainst),
      gd: Number(row.intGoalDifference),
      points: Number(row.intPoints),
      form: row.strForm || '',
    })),
    fixtures: (next.events || []).slice(0, 8).map((e) => ({
      id: e.idEvent,
      home: e.strHomeTeam,
      away: e.strAwayTeam,
      homeBadge: e.strHomeTeamBadge,
      awayBadge: e.strAwayTeamBadge,
      date: e.dateEvent,
      time: e.strTime,
      round: e.intRound,
      venue: e.strVenue,
      status: e.strStatus,
    })),
    recent: (past.events || [])
      .filter((e) => e.intHomeScore != null)
      .slice(0, 6)
      .map((e) => ({
        id: e.idEvent,
        home: e.strHomeTeam,
        away: e.strAwayTeam,
        homeBadge: e.strHomeTeamBadge,
        awayBadge: e.strAwayTeamBadge,
        homeScore: Number(e.intHomeScore),
        awayScore: Number(e.intAwayScore),
        date: e.dateEvent,
        round: e.intRound,
        venue: e.strVenue,
      })),
  };
}

exports.handler = async () => {
  try {
    let body;
    try {
      body = await loadOfficial();
      if (!body.standings.length && !body.fixtures.length) throw new Error('Official parse empty');
    } catch (err) {
      console.warn('Official feed failed, using SportsDB fallback:', err.message);
      body = await loadSportsDbFallback();
      body.fallbackReason = String(err.message || err);
    }
    return { statusCode: 200, headers: headersOut, body: JSON.stringify(body) };
  } catch (err) {
    return {
      statusCode: 502,
      headers: headersOut,
      body: JSON.stringify({ error: 'Failed to load league data', detail: String(err.message || err) }),
    };
  }
};
