/** Canonical non-React adapter for the opt-in web navbar. Apps supply their own preference/auth actions. */
(function () {
  'use strict';
  const COPY = {
    es: ['Aplicaciones', 'Opciones', 'Ayuda', 'Tema claro', 'Tema oscuro', 'Idioma', 'Cerrar sesión', 'Cuenta', 'No pudimos guardar el cambio.'],
    en: ['Apps', 'Options', 'Help', 'Light theme', 'Dark theme', 'Language', 'Sign out', 'Account', 'Could not save the change.'],
    it: ['Applicazioni', 'Opzioni', 'Aiuto', 'Tema chiaro', 'Tema scuro', 'Lingua', 'Esci', 'Account', 'Impossibile salvare la modifica.'],
    pt: ['Aplicativos', 'Opções', 'Ajuda', 'Tema claro', 'Tema escuro', 'Idioma', 'Sair', 'Conta', 'Não foi possível salvar a alteração.'],
  };
  const PATHS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    more: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01"/>',
    theme: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>',
    logout: '<path d="M9 21H4V3h5M14 8l5 4-5 4M8 12h11"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  };
  function icon(name) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', width: '18', height: '18', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'aria-hidden': 'true' })) node.setAttribute(key, value);
    node.innerHTML = PATHS[name]; // fixed, kit-owned icon markup only
    return node;
  }
  function mount(container, options) {
    if (!container || window.__CHANWE_DESKTOP__) return () => {};
    const locale = String(options.locale || document.documentElement.lang || 'es').split(/[-_]/)[0];
    const text = COPY[locale] || COPY.es;
    const accountText = ({ es: ['Mis datos', 'Roles y accesos', 'Roles', 'Aplicaciones', 'Ir al perfil', 'Cargando…', 'Abrí tu perfil para iniciar sesión y consultar tus datos.', 'Sin datos', 'Preferencias de esta aplicación'], en: ['My details', 'Roles and access', 'Roles', 'Apps', 'Go to profile', 'Loading…', 'Open your profile to sign in and view your details.', 'No details', 'App preferences'], it: ['I miei dati', 'Ruoli e accessi', 'Ruoli', 'Applicazioni', 'Vai al profilo', 'Caricamento…', 'Apri il profilo per accedere e vedere i tuoi dati.', 'Nessun dato', 'Preferenze applicazione'], pt: ['Meus dados', 'Funções e acessos', 'Funções', 'Aplicativos', 'Ir ao perfil', 'Carregando…', 'Abra seu perfil para entrar e consultar seus dados.', 'Sem dados', 'Preferências do aplicativo'] })[locale] || ['My details', 'Roles and access', 'Roles', 'Apps', 'Go to profile', 'Loading…', 'Open your profile to sign in and view your details.', 'No details', 'App preferences'];
    const root = document.createElement('span'); root.className = 'cw-native-navigation';
    const control = (label, glyph, href) => {
      const node = document.createElement(href ? 'a' : 'button');
      if (href) node.href = href; else node.type = 'button';
      node.className = 'cw-top-bar__action'; node.title = label; node.setAttribute('aria-label', label); node.append(icon(glyph)); return node;
    };
    const grid = control(text[0], 'grid', 'https://espacios.chanwe.ar/');
    const trigger = control(text[1], 'more'); trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'false');
    const menuRoot = document.createElement('span'); menuRoot.className = 'cw-web-utilities'; menuRoot.append(trigger);
    let panel = null;
    function close(focus) { panel?.remove(); panel = null; trigger.setAttribute('aria-expanded', 'false'); if (focus) trigger.focus(); }
    function open() {
      panel = document.createElement('span'); panel.className = 'cw-web-utilities__panel'; panel.setAttribute('role', 'menu'); panel.setAttribute('aria-label', text[1]);
      const item = (label, glyph, href, action) => {
        const node = control(label, glyph, href); node.className = 'cw-web-utilities__item'; node.setAttribute('role', 'menuitem'); node.append(document.createTextNode(label));
        if (action) node.addEventListener('click', async () => { try { await action(); if (!node.dataset.expand) close(true); } catch { const error = document.createElement('span'); error.setAttribute('role', 'alert'); error.textContent = text[8]; panel?.append(error); } });
        panel.append(node); return node;
      };
      item(text[2], 'help', options.helpHref || 'mailto:help@chanwe.com.ar');
      item(text[options.getTheme?.() === 'dark' ? 3 : 4], 'theme', null, options.onTheme);
      if (options.languageHref) item(text[5], 'globe', options.languageHref);
      else if (options.onLocale) {
        item(text[5] + ' · ' + locale.toUpperCase(), 'globe', null, () => {
          if (panel.querySelector('[role="menuitemradio"]')) return;
          for (const [code, name] of [['es', 'Español'], ['en', 'English'], ['it', 'Italiano'], ['pt', 'Português']]) {
            const choice = document.createElement('button'); choice.type = 'button'; choice.className = 'cw-web-utilities__item cw-web-utilities__language'; choice.textContent = name; choice.lang = code; choice.setAttribute('role', 'menuitemradio'); choice.setAttribute('aria-checked', String(code === locale));
            choice.addEventListener('click', async () => { try { await options.onLocale(code); close(true); } catch { choice.setAttribute('aria-invalid', 'true'); } }); panel.append(choice);
          }
          // This action expands a submenu; keep it open instead of the normal action-close path.
        }).dataset.expand = 'true';
      }
      if (options.logoutHref || options.onLogout) item(text[6], 'logout', options.logoutHref, options.onLogout);
      menuRoot.append(panel); trigger.setAttribute('aria-expanded', 'true'); panel.querySelector('[role="menuitem"]')?.focus();
    }
    // Language expansion stays open; other action buttons close after success.
    trigger.addEventListener('click', () => panel ? close() : open());
    const outside = event => { if (!root.contains(event.target)) close(); };
    const keys = event => {
      if (!root.contains(document.activeElement) || accountPanel) return;
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
      if (event.key === 'Tab') close();
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); if (!panel) { open(); return; }
      const items = [...panel.querySelectorAll('[role="menuitem"],[role="menuitemradio"]')]; const at = items.indexOf(document.activeElement);
      items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (at + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    };
    root.append(grid, menuRoot);
    let accountPanel = null, accountData = null, loading = true;
    const controller = new AbortController();
    const accountRoot = document.createElement('span'); accountRoot.className = 'cw-web-account';
    const avatar = control(text[7], 'user'); avatar.classList.add('cw-web-profile'); avatar.setAttribute('aria-haspopup', 'dialog'); avatar.setAttribute('aria-expanded', 'false');
    const closeAccount = (focus) => { accountPanel?.remove(); accountPanel = null; avatar.setAttribute('aria-expanded', 'false'); if (focus) avatar.focus(); };
    const appendText = (parent, tag, value) => { const node = document.createElement(tag); node.textContent = value; parent.append(node); return node; };
    const drawAccount = () => {
      accountPanel.replaceChildren(); appendText(accountPanel, 'strong', text[7]);
      if (loading) appendText(accountPanel, 'p', accountText[5]).setAttribute('role', 'status');
      else if (!accountData) appendText(accountPanel, 'p', accountText[6]);
      else {
        const details = document.createElement('section'); accountPanel.append(details);
        appendText(details, 'h3', accountText[0]); appendText(details, 'strong', accountData.name || accountData.email || ''); appendText(details, 'p', accountData.email || ''); appendText(details, 'p', [accountData.jobTitle, accountData.department, accountData.company].filter(Boolean).join(' · '));
        const access = document.createElement('section'); accountPanel.append(access); appendText(access, 'h3', accountText[1]);
        for (const [label, values] of [[accountText[2], accountData.roles], [accountText[3], accountData.access]]) { appendText(access, 'h4', label); const list = document.createElement('ul'); access.append(list); for (const value of Array.isArray(values) && values.length ? values : [accountText[7]]) appendText(list, 'li', String(value)); }
      }
      if (options.accountHref) { const native = appendText(accountPanel, 'a', accountText[8]); native.href = options.accountHref; }
      const link = appendText(accountPanel, 'a', accountText[4]); link.href = 'https://espacios.chanwe.ar/?tab=profile'; link.className = 'cw-web-account__link';
    };
    const accountKeys = event => { if (event.key === 'Escape' && accountPanel) { event.preventDefault(); event.stopImmediatePropagation(); closeAccount(true); } };
    const accountOutside = event => { if (!accountRoot.contains(event.target)) closeAccount(); };
    if (options.avatar !== false) {
      accountRoot.append(avatar); root.append(accountRoot);
      avatar.addEventListener('click', () => { if (accountPanel) { closeAccount(); return; } close(); accountPanel = document.createElement('div'); accountPanel.className = 'cw-web-account__panel'; accountPanel.setAttribute('role', 'dialog'); accountPanel.setAttribute('aria-label', text[7]); accountRoot.append(accountPanel); avatar.setAttribute('aria-expanded', 'true'); drawAccount(); accountPanel.querySelector('a')?.focus(); });
      document.addEventListener('keydown', accountKeys); document.addEventListener('pointerdown', accountOutside);
      fetch('https://espacios.chanwe.ar/api/navigation-profile', { credentials: 'include', cache: 'no-store', signal: controller.signal }).then(response => { if (!response.ok) throw new Error('profile'); return response.json(); }).then(data => { accountData = data; if (typeof data.photo === 'string' && data.photo.startsWith('data:image/png;base64,')) { const image = document.createElement('img'); image.src = data.photo; image.alt = ''; image.addEventListener('error', () => avatar.replaceChildren(icon('user'))); avatar.replaceChildren(image); } }).catch(() => {}).finally(() => { loading = false; if (accountPanel) drawAccount(); });
    }
    container.append(root); document.addEventListener('pointerdown', outside); document.addEventListener('keydown', keys);
    return () => { controller.abort(); closeAccount(); document.removeEventListener('keydown', accountKeys); document.removeEventListener('pointerdown', accountOutside); close(); root.remove(); document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keys); };
  }
  window.ChanweWebNavigation = Object.freeze({ mount });
})();
