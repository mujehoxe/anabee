/**
 * Lightweight i18n scaffold (EN default).
 * Future locales: set <html lang="ar|fr|es"> and load locale JSON, or expand STRINGS.
 * Markup: data-i18n="key" on text nodes; data-i18n-attr="placeholder:search.clubs" for attributes.
 */
(() => {
  const STRINGS = {
    en: {
      'nav.home': 'Home',
      'nav.blog': 'Blog',
      'nav.academy': 'Academy',
      'nav.adnoc': 'ADNOC League',
      'search.clubs': 'Filter by club or venue…',
      'league.loading.fixtures': 'Loading live fixtures…',
      'league.loading.standings': 'Loading live standings…',
    },
  };

  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  const dict = STRINGS[lang] || STRINGS.en;

  const t = (key) => dict[key] || STRINGS.en[key] || key;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.getAttribute('data-i18n-attr')
      .split(';')
      .forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
  });

  window.ANABEE_I18N = { t, lang, STRINGS };
})();
