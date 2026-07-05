/* =============================================================================
 * Nimiq UI Kit — runtime logic
 *  • builds token grids (colors, ladder, gradients, spacing, icons) from data
 *  • copy-to-clipboard (via @nimiq/utils Clipboard), search, scroll-spy
 *  • live playgrounds: Tweenable, identicons, @nimiq/utils
 *  • mounts real @nimiq/vue-components with reactive prop "knobs"
 * ========================================================================== */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function highlightHtml(code) {
    var e = esc(code);
    e = e.replace(/(&lt;\/?[a-zA-Z][\w-]*)/g, '<span class="tok-tag">$1</span>');
    e = e.replace(/([a-zA-Z:@-]+)=(&quot;[^&]*&quot;)/g,
      '<span class="tok-attr">$1</span>=<span class="tok-str">$2</span>');
    return e;
  }
  // Give a non-semantic click-to-copy cell real button semantics + keyboard
  // activation (Enter / Space), sharing one code path with the click handler.
  // Pass label = null to keep an aria-label the element already carries.
  function makeActivatable(elm, onActivate, label) {
    elm.setAttribute('tabindex', '0');
    elm.setAttribute('role', 'button');
    if (label != null) elm.setAttribute('aria-label', label);
    elm.addEventListener('click', onActivate);
    elm.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        onActivate.call(elm, e);
      }
    });
  }

  /* ---------- copy + toast ---------- */
  var toast = document.getElementById('copy-toast'), toastTimer;
  function copyText(text) {
    try {
      if (window.NimiqUtils && NimiqUtils.Clipboard) NimiqUtils.Clipboard.copy(text);
      else if (navigator.clipboard) navigator.clipboard.writeText(text);
    } catch (e) { try { navigator.clipboard.writeText(text); } catch (_) {} }
    showToast('Copied  ' + (text.length > 44 ? text.slice(0, 41) + '…' : text));
  }
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1500);
  }

  /* ---------- data ---------- */
  var BRAND = [
    ['blue', '#1F2348', '31, 35, 72'], ['light-blue', '#0582CA', '5, 130, 202'], ['gold', '#E9B213', '233, 178, 19'],
    ['green', '#21BCA5', '33, 188, 165'], ['orange', '#FC8702', '252, 135, 2'], ['red', '#D94432', '216, 65, 51'],
    ['purple', '#5F4B8B', '95, 75, 139'], ['pink', '#FA7268', '250, 114, 104'], ['light-green', '#88B04B', '136, 176, 75'],
    ['brown', '#795548', '121, 85, 72']
  ];
  var NEUTRAL = [['gray', '#F4F4F4'], ['light-gray', '#FAFAFA'], ['white', '#FFFFFF']];
  var CRYPTO = [['bitcoin', '#F7931A', '--bitcoin-orange'], ['usdc', '#2775CA', '--usdc-blue'], ['usdt', '#009393', '--usdt-green']];
  var VARIANTS = [
    ['light-blue-on-dark', '#0CA6FE'], ['red-on-dark', '#FF5C48'],
    ['blue-darkened', '#151833'], ['light-blue-darkened', '#0071C3'], ['gold-darkened', '#E5A212'],
    ['green-darkened', '#20B29E'], ['orange-darkened', '#FC7500'], ['red-darkened', '#D13030']
  ];
  var LADDER = [100, 80, 70, 60, 50, 40, 35, 30, 25, 22, 20, 16, 14, 12, 10, 6];
  var GRADIENTS = [
    ['blue', '#260133', '#1F2348'], ['light-blue', '#265DD7', '#0582CA'], ['gold', '#EC991C', '#E9B213'],
    ['green', '#41A38E', '#21BCA5'], ['orange', '#FD6216', '#FC8702'], ['red', '#CC3047', '#D94432'],
    ['purple', '#4D4C96', '#5F4B8B'], ['pink', '#E0516B', '#FA7268'], ['light-green', '#70B069', '#88B04B'], ['brown', '#724147', '#795548']
  ];

  /* ---------- swatches ---------- */
  function swatch(name, val, varName) {
    var s = el('div', 'swatch');
    s.innerHTML = '<div class="swatch-chip" style="background:' + val + '"></div>' +
      '<div class="swatch-meta"><div class="swatch-name">' + name + '</div>' +
      '<div class="swatch-val">' + val + '</div>' +
      (varName ? '<div class="swatch-var">' + varName + '</div>' : '') + '</div>';
    makeActivatable(s, function () { copyText(val); }, 'Copy ' + name + ' color ' + val);
    return s;
  }
  function fill(id, arr, mapper) { var c = document.getElementById(id); if (c) arr.forEach(function (a) { c.appendChild(mapper(a)); }); }
  fill('swatches-brand', BRAND, function (a) { return swatch(a[0], a[1], '--nimiq-' + a[0]); });
  fill('swatches-neutral', NEUTRAL, function (a) { return swatch(a[0], a[1], '--nimiq-' + a[0]); });
  fill('swatches-crypto', CRYPTO, function (a) { return swatch(a[0], a[1], a[2]); });
  fill('swatches-variants', VARIANTS, function (a) { return swatch(a[0], a[1], '--nimiq-' + a[0]); });

  /* ---------- opacity ladder ---------- */
  (function () {
    var c = document.getElementById('ladder'); if (!c) return;
    LADDER.forEach(function (step) {
      var cell = el('div', 'ladder-cell');
      cell.innerHTML = '<div class="ladder-chip" style="background:rgba(31,35,72,' + (step / 100) + ')"></div><div class="ladder-label">' + step + '</div>';
      makeActivatable(cell, function () { copyText('var(--text-' + step + ')'); }, 'Copy opacity token var(--text-' + step + ')');
      c.appendChild(cell);
    });
  })();

  /* ---------- gradients ---------- */
  (function () {
    var c = document.getElementById('gradients');
    if (c) GRADIENTS.forEach(function (g) {
      var grad = 'radial-gradient(100% 100% at bottom right, ' + g[1] + ', ' + g[2] + ')';
      var t = el('div', 'gradient-tile', g[0]); t.style.backgroundImage = grad;
      makeActivatable(t, function () { copyText('var(--nimiq-' + g[0] + '-bg)'); }, 'Copy ' + g[0] + ' gradient var(--nimiq-' + g[0] + '-bg)');
      c.appendChild(t);
    });
    var f = document.getElementById('gradient-formula');
    if (f) f.textContent = '--nimiq-<color>-bg: radial-gradient(100% 100% at bottom right, <accent>, var(--nimiq-<color>));';
  })();

  /* ---------- spacing ---------- */
  (function () {
    var c = document.getElementById('spacing-grid'); if (!c) return;
    [1, 2, 3, 4, 5].forEach(function (n) {
      var px = n * 8, cell = el('div', 'spec-cell');
      cell.innerHTML = '<div class="spec-box" style="width:' + px + 'px;height:' + px + 'px"></div><div class="spec-meta">' + n + 'rem · ' + px + 'px</div>';
      c.appendChild(cell);
    });
  })();

  /* ---------- icons (parse sprite for ids) ---------- */
  // Plain-language summaries so an LLM agent can identify each icon from the DOM
  // (aria-label / title / data-summary) without needing to look at the glyph.
  var ICON_DESC = {
    'nq-alert-circle': 'Circle containing an exclamation mark — alert / important notice',
    'nq-alert-triangle': 'Triangle containing an exclamation mark — warning / caution',
    'nq-arrow-left': 'Left-pointing arrow — go back / previous',
    'nq-arrow-left-small': 'Small left-pointing arrow — back (compact)',
    'nq-arrow-right': 'Right-pointing arrow — forward / next / proceed',
    'nq-arrow-right-small': 'Small right-pointing arrow — forward (compact)',
    'nq-caret-right-small': 'Small right chevron — expand or navigate forward',
    'nq-cashlink': 'Cashlink symbol — a Nimiq Cashlink (shareable link that holds NIM)',
    'nq-cashlink-small': 'Cashlink symbol (small)',
    'nq-cashlink-xsmall': 'Cashlink symbol (extra small)',
    'nq-checkmark': 'Checkmark — success / confirmed / completed',
    'nq-checkmark-small': 'Checkmark (small) — success',
    'nq-close': 'Cross / X — close or dismiss',
    'nq-contacts': 'People silhouettes — contacts / address book',
    'nq-copy': 'Two overlapping pages — copy to clipboard',
    'nq-cross': 'X cross — remove / cancel / error',
    'nq-download': 'Downward arrow onto a baseline — download / save',
    'nq-face-neutral': 'Neutral face — neutral or indifferent status',
    'nq-face-sad': 'Sad face — error or negative status',
    'nq-gear': 'Cog / gear wheel — settings',
    'nq-hexagon': 'Nimiq hexagon signet — the brand logo mark',
    'nq-info-circle': 'Circle containing the letter i — information / help',
    'nq-info-circle-small': 'Info circle (small) — information',
    'nq-keys': 'A key — private keys, login credentials or security',
    'nq-ledger': 'Ledger hardware wallet device',
    'nq-lock-locked': 'Closed padlock — locked / secure / encrypted',
    'nq-lock-unlocked': 'Open padlock — unlocked / accessible',
    'nq-login': 'Arrow entering a doorway — log in / sign in',
    'nq-menu-dots': 'Three dots — more options / overflow menu',
    'nq-plus-circle': 'Circle containing a plus — add / create new',
    'nq-qr-code': 'A QR code square — show or scan a QR code',
    'nq-questionmark': 'Question mark — help or unknown',
    'nq-scan-qr-code': 'Camera brackets framing a QR code — scan a QR code',
    'nq-settings': 'Horizontal sliders — settings / preferences',
    'nq-stopwatch': 'Stopwatch — time, pending state or countdown',
    'nq-transfer': 'Two arrows pointing opposite ways — transfer / swap / exchange',
    'nq-under-payment': 'Warning that a payment amount is too low (underpayment)',
    'nq-view': 'An open eye — show / reveal / view',
    'nq-view-off': 'An eye with a slash through it — hide / conceal'
  };
  window.NimiqIconSummaries = ICON_DESC; // also exposed for programmatic access
  (function () {
    var usage = '<svg class="nq-icon">\n  <use xlink:href="nimiq-style.icons.svg#nq-hexagon"/>\n</svg>';
    var u = document.getElementById('icon-usage'); if (u) u.innerHTML = highlightHtml(usage);
    var SPRITE = 'assets/icons/nimiq-style.icons.svg';
    fetch(SPRITE).then(function (r) { return r.text(); }).then(function (txt) {
      var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      var ids = Array.prototype.map.call(doc.querySelectorAll('symbol'), function (s) { return s.id; }).filter(Boolean).sort();
      build('icon-grid-light', ids); build('icon-grid-dark', ids);
    }).catch(function (e) { console.warn('sprite load failed', e); });
    function build(id, ids) {
      var c = document.getElementById(id); if (!c) return;
      ids.forEach(function (nq) {
        var desc = ICON_DESC[nq] || '';
        var cell = el('div', 'icon-cell');
        cell.setAttribute('title', nq + (desc ? ' — ' + desc : ''));
        cell.setAttribute('aria-label', nq + (desc ? ': ' + desc : ''));
        cell.setAttribute('data-summary', desc);
        cell.innerHTML = '<svg class="nq-icon" role="img" aria-label="' + esc(desc) + '"><use xlink:href="' + SPRITE + '#' + nq + '"/></svg><div class="icon-name">' + nq + '</div>';
        makeActivatable(cell, function () { copyText('<svg class="nq-icon"><use xlink:href="nimiq-style.icons.svg#' + nq + '"/></svg>'); });
        c.appendChild(cell);
      });
    }
  })();

  /* ---------- extended nimiq-icons (onmax/nimiq-ui, Iconify JSON) ---------- */
  (function () {
    var grid = document.getElementById('icon-grid-nimiq'); if (!grid) return;
    fetch('assets/nimiq-icons.json').then(function (r) { return r.json(); }).then(function (data) {
      var icons = data.icons || {}, dw = data.width || 24, dh = data.height || 24;
      var names = Object.keys(icons).filter(function (n) { return !icons[n].hidden; }).sort();
      names.forEach(function (name) {
        var ic = icons[name], w = ic.width || dw, h = ic.height || dh, human = name.replace(/-/g, ' ');
        var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(human) + '">' + ic.body + '</svg>';
        var cell = el('div', 'icon-cell');
        cell.setAttribute('title', 'nimiq:' + name + ' — ' + human);
        cell.setAttribute('aria-label', 'nimiq:' + name + ': ' + human);
        cell.setAttribute('data-summary', human);
        cell.innerHTML = svg + '<div class="icon-name">' + name + '</div>';
        makeActivatable(cell, function () { copyText(svg); });
        grid.appendChild(cell);
      });
    }).catch(function (e) { console.warn('nimiq-icons load failed', e); grid.innerHTML = '<div class="kit-note">Could not load the extended icon set.</div>'; });
  })();

  /* ---------- motion / Tweenable ---------- */
  (function () {
    var btn = document.getElementById('motion-play'), bar = document.getElementById('motion-bar'), count = document.getElementById('motion-count');
    if (!btn) return;
    if (!(window.NimiqUtils && NimiqUtils.Tweenable)) { btn.disabled = true; return; }
    btn.onclick = function () {
      var tw = new NimiqUtils.Tweenable(0);
      tw.tweenTo(1000, 1100);
      (function frame() {
        var v = tw.currentValue;
        bar.style.width = (v / 10) + '%'; count.textContent = Math.round(v);
        if (!tw.finished) requestAnimationFrame(frame); else { bar.style.width = '100%'; count.textContent = '1000'; }
      })();
    };
  })();

  /* ---------- search (content-aware: filters sections, demos, swatches, icons…) ---------- */
  (function () {
    var input = document.getElementById('kit-search'); if (!input) return;
    var navLinks = [].slice.call(document.querySelectorAll('.kit-nav a'));
    var navById = {}; navLinks.forEach(function (a) { navById[a.getAttribute('href').slice(1)] = a; });
    var sections = [].slice.call(document.querySelectorAll('.kit-section'));
    var ITEMS = '.demo, .swatch, .ladder-cell, .gradient-tile, .icon-cell, .type-row, .spec-cell';
    var show = function (e) { e.style.display = ''; };
    var txt = function (e) { return (e.textContent || '').toLowerCase(); };

    function reset() {
      sections.forEach(function (s) {
        show(s);
        [].forEach.call(s.querySelectorAll(ITEMS), show);
        [].forEach.call(s.querySelectorAll('.kit-subsection'), show);
      });
      navLinks.forEach(function (a) { a.classList.remove('hidden-by-search'); });
      [].forEach.call(document.querySelectorAll('.kit-nav-group'), show);
      var e = document.getElementById('kit-search-empty'); if (e) e.remove();
    }

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var old = document.getElementById('kit-search-empty'); if (old) old.remove();
      if (!q) { reset(); return; }
      var anyVisible = false;

      sections.forEach(function (s) {
        var h2 = s.querySelector('h2');
        var titleMatch = !!h2 && txt(h2).indexOf(q) >= 0;
        var visible = titleMatch;
        var items = [].slice.call(s.querySelectorAll(ITEMS));

        items.forEach(function (it) {
          var m = titleMatch || txt(it).indexOf(q) >= 0;
          it.style.display = m ? '' : 'none';
          if (m) visible = true;
        });

        [].forEach.call(s.querySelectorAll('.kit-subsection'), function (sub) {
          var subItems = [].slice.call(sub.querySelectorAll(ITEMS));
          var sv = subItems.length
            ? (titleMatch || subItems.some(function (it) { return it.style.display !== 'none'; }))
            : (titleMatch || txt(sub).indexOf(q) >= 0);
          sub.style.display = sv ? '' : 'none';
          if (sv) visible = true;
        });

        if (!items.length && !s.querySelector('.kit-subsection')) visible = titleMatch || txt(s).indexOf(q) >= 0;

        s.style.display = visible ? '' : 'none';
        if (visible) anyVisible = true;
        var nav = navById[s.id]; if (nav) nav.classList.toggle('hidden-by-search', !visible);
      });

      [].forEach.call(document.querySelectorAll('.kit-nav-group'), function (g) {
        g.style.display = g.querySelectorAll('a:not(.hidden-by-search)').length ? '' : 'none';
      });

      if (!anyVisible) {
        var c = document.querySelector('.kit-container');
        if (c) {
          var m = document.createElement('div');
          m.id = 'kit-search-empty'; m.className = 'kit-note';
          m.style.cssText = 'padding:48px 0;font-size:16px;text-align:center';
          m.textContent = 'No matches for “' + input.value.trim() + '”.';
          c.appendChild(m);
        }
      }
    });
  })();

  /* ---------- scroll-spy ---------- */
  (function () {
    var navMap = {};
    [].forEach.call(document.querySelectorAll('.kit-nav a'), function (a) {
      navMap[a.getAttribute('href').slice(1)] = a;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          for (var k in navMap) navMap[k].classList.remove('active');
          if (navMap[en.target.id]) navMap[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-8% 0px -82% 0px', threshold: 0 });
    [].forEach.call(document.querySelectorAll('.kit-section'), function (s) { obs.observe(s); });
  })();

  /* ---------- accessible off-canvas drawer ---------- */
  (function () {
    var sidebar = document.getElementById('kit-sidebar') || document.querySelector('.kit-sidebar');
    var btn = document.getElementById('kit-menu-btn');
    var scrim = document.getElementById('kit-scrim');
    if (!sidebar || !btn) return;
    var isOpen = false, savedOverflow = '';

    // Visible, focusable elements inside the drawer (order = DOM order).
    function focusables() {
      return [].slice.call(sidebar.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(function (n) { return n.offsetWidth || n.offsetHeight || n.getClientRects().length; });
    }
    function openDrawer() {
      if (isOpen) return; isOpen = true;
      sidebar.classList.add('open');
      if (scrim) scrim.classList.add('show');
      btn.setAttribute('aria-expanded', 'true');
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';     // lock background scroll while open
      sidebar.focus();                              // move focus into the drawer (tabindex="-1")
    }
    function closeDrawer(returnFocus) {
      if (!isOpen) return; isOpen = false;
      sidebar.classList.remove('open');
      if (scrim) scrim.classList.remove('show');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = savedOverflow;
      if (returnFocus) btn.focus();                 // Escape returns focus to the toggle
    }
    function toggleDrawer() { isOpen ? closeDrawer(true) : openDrawer(); }

    btn.addEventListener('click', toggleDrawer);
    if (scrim) scrim.addEventListener('click', function () { closeDrawer(false); });
    // Preserve existing behaviour: tapping a nav link closes the drawer.
    [].forEach.call(document.querySelectorAll('.kit-nav a'), function (a) {
      a.addEventListener('click', function () { closeDrawer(false); });
    });

    // Escape closes (+ returns focus); Tab is trapped within the drawer while open.
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.keyCode === 27) { closeDrawer(true); return; }
      if (e.key === 'Tab' || e.keyCode === 9) {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1], active = document.activeElement;
        var inList = f.indexOf(active) !== -1;
        if (e.shiftKey) { if (active === first || !inList) { e.preventDefault(); last.focus(); } }
        else { if (active === last || !inList) { e.preventDefault(); first.focus(); } }
      }
    });

    // Growing past the drawer breakpoint resets everything (drawer is desktop-irrelevant).
    var mq = window.matchMedia('(max-width: 960px)');
    function onChange(e) { if (!e.matches) closeDrawer(false); }
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange); // Safari < 14
  })();

  /* ---------- identicons playground ---------- */
  (function () {
    var out = document.getElementById('iqon-out'), input = document.getElementById('iqon-input'), rnd = document.getElementById('iqon-random');
    if (!out || !input) return;
    // Generate a real-format Nimiq address: NQ + 2 check digits + 32 base32 chars, grouped in 4s.
    function randomAddress() {
      var alpha = (window.NimiqUtils && NimiqUtils.ValidationUtils && NimiqUtils.ValidationUtils.NIMIQ_ALPHABET) || '0123456789ABCDEFGHJKLMNPQRSTUVXY';
      var s = 'NQ' + ('0' + Math.floor(Math.random() * 100)).slice(-2);
      for (var i = 0; i < 32; i++) s += alpha[Math.floor(Math.random() * alpha.length)];
      return s.replace(/(.{4})/g, '$1 ').trim();
    }
    function render() {
      if (!window.Identicons) return;
      try { var p = window.Identicons.render(input.value, out); if (p && p.catch) p.catch(function () {}); } catch (e) {}
    }
    function whenReady(cb) { if (window.Identicons) cb(); else window.addEventListener('identicons-ready', cb, { once: true }); }
    input.addEventListener('input', render);
    if (rnd) makeActivatable(rnd, function () { input.value = randomAddress(); render(); }, 'Generate a random address');
    whenReady(render);
  })();

  /* ---------- @nimiq/utils playgrounds ---------- */
  (function () {
    var NU = window.NimiqUtils; if (!NU) return;
    function on(id, ev, fn) { var e = document.getElementById(id); if (e) e.addEventListener(ev, fn); }
    function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
    function set(id, html) { var e = document.getElementById(id); if (e) e.innerHTML = html; }

    // FormattableNumber
    function fmt() {
      try {
        var n = new NU.FormattableNumber(val('fmt-val'));
        var s = n.toString({ maxDecimals: parseInt(val('fmt-max'), 10) || 0, useGrouping: document.getElementById('fmt-group').checked });
        set('fmt-out', '<span class="ok">' + esc(s) + '</span>');
      } catch (e) { set('fmt-out', '<span class="bad">' + esc(e.message) + '</span>'); }
    }
    ['fmt-val', 'fmt-max'].forEach(function (id) { on(id, 'input', fmt); }); on('fmt-group', 'change', fmt); fmt();

    // ValidationUtils
    function validate() {
      var a = val('val-addr');
      try {
        var ok = NU.ValidationUtils.isValidAddress(a);
        set('val-out', ok ? '<span class="ok">✓ valid Nimiq address</span>' : '<span class="bad">✗ not a valid address</span>');
      } catch (e) { set('val-out', '<span class="bad">' + esc(e.message) + '</span>'); }
    }
    on('val-addr', 'input', validate); validate();

    // RequestLinkEncoding
    function reqlink() {
      try {
        var RLE = NU.RequestLinkEncoding;
        var link = RLE.createRequestLink(val('rl-addr'),
          parseFloat(val('rl-amount')) || 0, val('rl-msg'), 'wallet.nimiq.com');
        set('rl-out', '<span class="ok">' + esc(link) + '</span>');
      } catch (e) { set('rl-out', '<span class="bad">' + esc(e.message) + '</span>'); }
    }
    ['rl-addr', 'rl-amount', 'rl-msg'].forEach(function (id) { on(id, 'input', reqlink); }); reqlink();

    // CurrencyInfo
    function currency() {
      try {
        var c = new NU.CurrencyInfo(val('cur-code').trim());
        set('cur-out', '<span class="ok">symbol <b>' + esc(c.symbol) + '</b> · decimals <b>' + c.decimals + '</b> · ' + esc(c.name) + '</span>');
      } catch (e) { set('cur-out', '<span class="bad">' + esc(e.message) + '</span>'); }
    }
    on('cur-code', 'input', currency); currency();
  })();

  /* ========================================================================
   *  LIVE @nimiq/vue-components
   * ===================================================================== */
  (function () {
    if (!window.Vue || !window.NimiqVueComponents) { console.error('Vue / NimiqVueComponents missing'); return; }
    var Vue = window.Vue, NVC = window.NimiqVueComponents;
    Vue.config.productionTip = false; Vue.config.devtools = false;
    if (typeof NVC.setAssetPublicPath === 'function') { try { NVC.setAssetPublicPath('assets/js/vue-components/'); } catch (e) {} }
    Object.keys(NVC).forEach(function (k) {
      if (k === 'setAssetPublicPath' || k === 'I18nMixin') return;
      var c = NVC[k];
      if (c && (typeof c === 'function' || typeof c === 'object')) { try { Vue.component(k, c); } catch (e) {} }
    });

    var NOW = Date.now();
    var ADDR = 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000';
    var ADDR2 = 'NQ34 248H 1EQJ F5H9 5A9E K8P4 KRB1 T2FN 3LQR';

    function demo(cfg) { return cfg; }
    var GROUPS = {
      'vc-amounts-mount': [
        demo({ title: 'Identicon', tag: 'Identicon', stageClass: 'center',
          data: {}, knobs: [{ name: 'address', label: 'Address', type: 'text', def: ADDR }],
          template: '<Identicon :address="address" style="width:88px;height:88px"/>',
          code: function (s) { return '<Identicon address="' + s.address + '" />'; } }),
        demo({ title: 'Amount', tag: 'Amount', stageClass: 'center',
          knobs: [{ name: 'amount', label: 'Amount (luna)', type: 'number', def: 123456789 },
                  { name: 'currency', label: 'Currency', type: 'select', options: ['nim', 'btc', 'eth', 'usdc'], def: 'nim' },
                  { name: 'maxDecimals', label: 'Max decimals', type: 'number', def: 5 }],
          template: '<span class="nq-h1"><Amount :amount="amount" :currency="currency" :maxDecimals="maxDecimals"/></span>',
          code: function (s) { return '<Amount :amount="' + s.amount + '" currency="' + s.currency + '" :maxDecimals="' + s.maxDecimals + '" />'; } }),
        demo({ title: 'FiatAmount', tag: 'FiatAmount', stageClass: 'center',
          knobs: [{ name: 'amount', label: 'Amount', type: 'number', def: 1234.5 },
                  { name: 'currency', label: 'Currency', type: 'select', options: ['eur', 'usd', 'gbp', 'jpy', 'chf'], def: 'eur' }],
          template: '<span class="nq-h1"><FiatAmount :amount="amount" :currency="currency"/></span>',
          code: function (s) { return '<FiatAmount :amount="' + s.amount + '" currency="' + s.currency + '" />'; } }),
        demo({ title: 'AddressDisplay', tag: 'AddressDisplay', stageClass: 'center',
          knobs: [{ name: 'address', label: 'Address', type: 'text', def: ADDR2 }],
          template: '<AddressDisplay :address="address"/>',
          code: function (s) { return '<AddressDisplay address="' + s.address + '" />'; } }),
        demo({ title: 'AccountRing', tag: 'AccountRing', stageClass: 'center',
          data: { addresses: [ADDR, ADDR2, 'NQ55 seed three', 'NQ88 seed four'] }, knobs: [],
          template: '<AccountRing :addresses="addresses" style="width:80px;height:80px"/>',
          code: function () { return '<AccountRing :addresses="addresses" />'; } }),
        demo({ title: 'Account', tag: 'Account', stageClass: 'center',
          data: { label: 'Wallet', addr: ADDR, balance: 4200000000 }, knobs: [{ name: 'label', label: 'Label', type: 'text', def: 'Wallet' }],
          template: '<div style="width:44rem;max-width:100%"><Account :label="label" :address="addr" :balance="balance"/></div>',
          code: function (s) { return '<Account label="' + s.label + '" :address="…" :balance="4200000000" />'; } }),
        demo({ title: 'AmountWithFee', tag: 'AmountWithFee', stageClass: 'center',
          data: { val: { amount: 0, fee: 0, isValid: false }, avail: 5000000000 }, knobs: [],
          template: '<div style="width:100%;max-width:34rem"><AmountWithFee :value="val" :availableBalance="avail" currency="nim" :currencyDecimals="5"/></div>',
          code: function () { return '<AmountWithFee :value="{amount,fee,isValid}" :availableBalance="…" currency="nim" :currencyDecimals="5" />'; } }),
        demo({ title: 'AccountList', tag: 'AccountList', stageClass: '',
          data: { accounts: [
            { path: "m/44'/242'/0'/0'", label: 'Main account', userFriendlyAddress: ADDR, balance: 4200000000 },
            { path: "m/44'/242'/0'/1'", label: 'Savings', userFriendlyAddress: ADDR2, balance: 1250000000 },
            { path: "m/44'/242'/0'/2'", label: 'Vacation fund', userFriendlyAddress: 'NQ55 1A2B 3C4D 5EF6 7GH8 9JKL MNPQ RSTU VXYA', balance: 88000000 }
          ] }, knobs: [],
          template: '<div style="width:44rem;max-width:100%;display:flex"><AccountList :accounts="accounts" :minBalance="1"/></div>',
          code: function () { return '<AccountList :accounts="[{path,label,userFriendlyAddress,balance}, …]" :minBalance="1" />'; } }),
        demo({ title: 'AccountDetails', tag: 'AccountDetails', stageClass: 'center',
          data: { addr: ADDR, bal: 4200000000 }, knobs: [{ name: 'label', label: 'Label', type: 'text', def: 'Main account' }],
          template: '<div style="width:44rem;max-width:100%"><AccountDetails :address="addr" :label="label" walletLabel="Keyguard Wallet" :balance="bal"/></div>',
          code: function (s) { return '<AccountDetails :address="…" label="' + s.label + '" walletLabel="Keyguard Wallet" :balance="4200000000" />'; } }),
        demo({ title: 'AccountSelector', tag: 'AccountSelector', stageClass: '',
          data: { wallets: [{ id: 'w1', label: 'Keyguard Wallet', type: 1, keyMissing: false, contracts: [],
            accounts: new Map([
              [ADDR, { path: "m/44'/242'/0'/0'", label: 'Main account', userFriendlyAddress: ADDR, balance: 4200000000 }],
              [ADDR2, { path: "m/44'/242'/0'/1'", label: 'Savings', userFriendlyAddress: ADDR2, balance: 1250000000 }]
            ]) }] }, knobs: [],
          template: '<div style="width:44rem;max-width:100%;display:flex"><AccountSelector :wallets="wallets" :minBalance="1"/></div>',
          code: function () { return '<AccountSelector :wallets="[{id,label,type,keyMissing,contracts,accounts:Map}]" :minBalance="1" />'; } })
      ],
      'vc-inputs-mount': [
        demo({ title: 'LabelInput', tag: 'LabelInput', stageClass: '',
          knobs: [{ name: 'value', label: 'Value', type: 'text', def: 'Savings' }, { name: 'placeholder', label: 'Placeholder', type: 'text', def: 'Set a label' }],
          template: '<LabelInput :value="value" :placeholder="placeholder"/>',
          code: function (s) { return '<LabelInput value="' + s.value + '" placeholder="' + s.placeholder + '" />'; } }),
        demo({ title: 'AmountInput', tag: 'AmountInput', stageClass: 'center',
          data: {}, knobs: [{ name: 'placeholder', label: 'Placeholder', type: 'text', def: '0' }],
          template: '<div style="width:100%;max-width:32rem;margin:0 auto"><AmountInput :placeholder="placeholder"/></div>',
          code: function () { return '<AmountInput :value="valueInLuna" :decimals="5" currency="nim" />'; } }),
        demo({ title: 'AddressInput', tag: 'AddressInput', stageClass: '',
          data: {}, knobs: [],
          template: '<AddressInput placeholder="Recipient address"/>',
          code: function () { return '<AddressInput :value="address" placeholder="Recipient address" @input="…" />'; } }),
        demo({ title: 'SelectBar', tag: 'SelectBar', stageClass: '',
          data: { options: [
            { value: 0, index: 0, text: 'Low', color: 'nq-green-bg' },
            { value: 1, index: 1, text: 'Mid', color: 'nq-gold-bg' },
            { value: 2, index: 2, text: 'High', color: 'nq-orange-bg' }
          ], selectedValue: 1 },
          knobs: [],
          template: '<div style="width:32rem;max-width:100%"><SelectBar name="fee" :options="options" :selectedValue="selectedValue"/></div>',
          code: function () { return '<SelectBar name="fee"\n  :options="[{value:0,index:0,text:\'Low\',color:\'nq-green-bg\'}, …]"\n  :selectedValue="1" @changed="onChange" />'; } }),
        demo({ title: 'SliderToggle', tag: 'SliderToggle', stageClass: 'center',
          data: {}, knobs: [],
          template: '<SliderToggle name="demo" value="week"><template slot="day">Day</template><template slot="week">Week</template><template slot="month">Month</template></SliderToggle>',
          code: function () { return '<SliderToggle name="range" value="week">\n  <template slot="day">Day</template>\n  <template slot="week">Week</template>\n</SliderToggle>'; } }),
        demo({ title: 'LanguageSelector', tag: 'LanguageSelector', stageClass: 'center', overflowVisible: true,
          data: { languages: ['en', 'de', 'es', 'fr', 'nl', 'pt', 'ru', 'uk', 'zh'] }, knobs: [],
          template: '<LanguageSelector :languages="languages" value="en"/>',
          code: function () { return "<LanguageSelector :languages=\"['en','de','es', …]\" value=\"en\" />"; } })
      ],
      'vc-feedback-mount': [
        demo({ title: 'Tooltip', tag: 'Tooltip', stageClass: 'center', overflowVisible: true,
          knobs: [{ name: 'position', label: 'Position', type: 'select', options: ['top', 'bottom', 'left', 'right'], def: 'bottom' }],
          template: '<div style="padding:3rem 0"><Tooltip :preferredPosition="position"><span slot="trigger" class="nq-link" style="cursor:pointer">Hover me</span><div style="padding:1rem;max-width:24rem">This is a Nimiq tooltip. It repositions to stay in view.</div></Tooltip></div>',
          code: function (s) { return '<Tooltip preferredPosition="' + s.position + '">\n  <span slot="trigger">Hover me</span>\n  Tooltip content\n</Tooltip>'; } }),
        demo({ title: 'Copyable', tag: 'Copyable', stageClass: 'center',
          knobs: [{ name: 'text', label: 'Text to copy', type: 'text', def: ADDR }],
          template: '<Copyable :text="text"><span class="nq-label">Click to copy</span></Copyable>',
          code: function (s) { return '<Copyable text="' + s.text + '">Click to copy</Copyable>'; } }),
        demo({ title: 'CopyableField', tag: 'CopyableField', stageClass: 'center dark',
          data: { fieldVal: ADDR }, knobs: [],
          template: '<div style="width:44rem;max-width:100%"><CopyableField label="Address" :value="fieldVal"/></div>',
          code: function () { return '<CopyableField label="Address" :value="address" />  <!-- white text; use on a dark surface -->'; } }),
        demo({ title: 'LoadingSpinner', tag: 'LoadingSpinner', stageClass: 'center',
          knobs: [], template: '<div style="color:#0582CA"><LoadingSpinner/></div>', code: function () { return '<LoadingSpinner />'; } }),
        demo({ title: 'CircleSpinner', tag: 'CircleSpinner', stageClass: 'center',
          knobs: [], template: '<CircleSpinner/>', code: function () { return '<CircleSpinner />'; } }),
        demo({ title: 'CloseButton', tag: 'CloseButton', stageClass: 'center',
          knobs: [], template: '<CloseButton/>', code: function () { return '<CloseButton />'; } }),
        demo({ title: 'LongPressButton', tag: 'LongPressButton', stageClass: 'center',
          knobs: [{ name: 'duration', label: 'Duration (ms)', type: 'number', def: 2000 }],
          template: '<LongPressButton :duration="duration">Hold to confirm</LongPressButton>',
          code: function (s) { return '<LongPressButton :duration="' + s.duration + '">Hold to confirm</LongPressButton>'; } }),
        demo({ title: 'Timer', tag: 'Timer', stageClass: 'center',
          data: { start: NOW, end: NOW + 120000 }, knobs: [],
          template: '<Timer :startTime="start" :endTime="end"/>',
          code: function () { return '<Timer :startTime="start" :endTime="end" />'; } }),
        demo({ title: 'PaymentInfoLine', tag: 'PaymentInfoLine', stageClass: '',
          data: { crypto: { amount: 123456789, currency: 'nim', decimals: 5 } }, knobs: [],
          template: '<div style="width:44rem;max-width:100%"><PaymentInfoLine :cryptoAmount="crypto" origin="shop.example.com"/></div>',
          code: function () { return '<PaymentInfoLine :cryptoAmount="{amount,currency,decimals}" origin="shop.example.com" />'; } }),
        demo({ title: 'BottomOverlay', tag: 'BottomOverlay', stageClass: 'center',
          knobs: [{ name: 'theme', label: 'Theme', type: 'select', options: ['dark', 'light', 'green'], def: 'dark' }],
          template: '<div class="bottom-overlay-demo" style="position:relative;width:52rem;max-width:100%;height:15rem;border-radius:1rem;overflow:hidden;background:repeating-linear-gradient(45deg,rgba(31,35,72,0.03) 0,rgba(31,35,72,0.03) 12px,rgba(31,35,72,0.06) 12px,rgba(31,35,72,0.06) 24px)"><BottomOverlay :theme="theme" @close="onClose">Bottom overlay content</BottomOverlay></div>',
          code: function (s) { return '<BottomOverlay theme="' + s.theme + '" @close="onClose">Overlay content</BottomOverlay>'; } })
      ],
      'vc-layout-mount': [
        demo({ title: 'SmallPage (+ PageHeader / PageBody / PageFooter)', tag: 'SmallPage', stageClass: 'center',
          knobs: [], data: {},
          template: '<SmallPage><PageHeader>Send transaction</PageHeader><PageBody><p class="nq-text">Compose a page from <b>PageHeader</b>, <b>PageBody</b> and <b>PageFooter</b> inside a <b>SmallPage</b> — the fixed 52.5&times;70.5rem Nimiq modal page.</p><input class="nq-input" placeholder="Recipient address" style="width:100%;margin-top:1rem"><input class="nq-input" placeholder="Amount" style="width:100%;margin-top:1.5rem"></PageBody><PageFooter><button class="nq-button light-blue">Send transaction</button></PageFooter></SmallPage>',
          code: function () { return '<SmallPage>\n  <PageHeader>Send transaction</PageHeader>\n  <PageBody>…</PageBody>\n  <PageFooter><button class="nq-button">Send transaction</button></PageFooter>\n</SmallPage>'; } }),
        demo({ title: 'Carousel', tag: 'Carousel', stageClass: 'center',
          data: { entries: ['one', 'two', 'three'], selected: 'two' },
          knobs: [],
          template: '<Carousel :entries="entries" :selected="selected" style="width:40rem"><div slot="one" class="nq-card" style="margin:0;padding:2rem;text-align:center">Slide one</div><div slot="two" class="nq-card" style="margin:0;padding:2rem;text-align:center">Slide two</div><div slot="three" class="nq-card" style="margin:0;padding:2rem;text-align:center">Slide three</div></Carousel>',
          code: function () { return '<Carousel :entries="[\'a\',\'b\',\'c\']" selected="a">\n  <div slot="a">…</div>\n</Carousel>'; } }),
        demo({ title: 'Wallet', tag: 'Wallet', stageClass: 'center',
          data: { wallet: { id: 'w1', label: 'Keyguard Wallet', type: 2, fileExported: true, wordsExported: true, balance: 4200000000, accounts: [{ address: ADDR }, { address: ADDR2 }] } }, knobs: [],
          template: '<div style="width:44rem;max-width:100%"><Wallet :wallet="wallet"/></div>',
          code: function () { return '<Wallet :wallet="{id,label,type,accounts:[{address}],balance,…}" />  <!-- @deprecated component -->'; } })
      ],
      'vc-qr-mount': [
        demo({ title: 'QrCode', tag: 'QrCode', stageClass: 'center',
          knobs: [{ name: 'data', label: 'Data', type: 'text', def: 'https://nimiq.com' }],
          template: '<QrCode :data="data" :size="160"/>',
          code: function (s) { return '<QrCode data="' + s.data + '" :size="160" />'; } }),
        demo({ title: 'QrScanner', tag: 'QrScanner', stageClass: 'center', clickToMount: true,
          clickLabel: 'Enable camera & scan', clickNote: 'Live QR scanner — starts the camera on click (works on localhost / HTTPS). Shows a graceful message if no camera is available.',
          data: {}, knobs: [],
          template: '<div style="width:30rem;max-width:100%;height:30rem;border-radius:1rem;overflow:hidden"><QrScanner @result="onResult" @cancel="onClose" @error="onClose"/></div>',
          code: function () { return '<QrScanner @result="onResult" @error="onError" @cancel="onCancel" />'; } })
      ]
    };

    function buildKnob(k, state, vm, onChange) {
      var kn = el('div', 'knob' + (k.type === 'boolean' ? ' check' : ''));
      var label = el('label', null, k.label || k.name), input;
      if (k.type === 'select') { input = el('select'); k.options.forEach(function (o) { var op = el('option', null, String(o)); op.value = o; if (o === k.def) op.selected = true; input.appendChild(op); }); }
      else if (k.type === 'boolean') { input = el('input'); input.type = 'checkbox'; input.checked = !!k.def; }
      else if (k.type === 'number') { input = el('input'); input.type = 'number'; input.value = k.def; }
      else { input = el('input'); input.type = 'text'; input.value = k.def; }
      function apply() {
        var v = k.type === 'boolean' ? input.checked : k.type === 'number' ? parseFloat(input.value) : input.value;
        state[k.name] = v; if (vm) { try { vm[k.name] = v; } catch (e) {} } onChange();
      }
      input.addEventListener(k.type === 'select' || k.type === 'boolean' ? 'change' : 'input', apply);
      if (k.type === 'boolean') { kn.appendChild(input); kn.appendChild(label); } else { kn.appendChild(label); kn.appendChild(input); }
      return kn;
    }

    function buildDemo(cfg) {
      var wrap = el('div', 'demo');
      if (cfg.overflowVisible) wrap.classList.add('allow-overflow');
      wrap.appendChild(el('div', 'demo-head', '<span class="demo-title">' + cfg.title + (cfg.tag ? ' <small>&lt;' + cfg.tag + '&gt;</small>' : '') + '</span>'));
      var stage = el('div', 'demo-stage ' + (cfg.stageClass || 'center'));
      var mountEl = el('div'); stage.appendChild(mountEl); wrap.appendChild(stage);

      var state = {}; if (cfg.data) for (var d in cfg.data) state[d] = cfg.data[d];
      (cfg.knobs || []).forEach(function (k) { state[k.name] = k.def; });

      var codeWrap = el('div', 'code-wrap');
      var copyBtn = el('button', 'copy-btn', 'Copy'); codeWrap.appendChild(copyBtn);
      var pre = el('pre', 'code'); codeWrap.appendChild(pre);
      function renderCode() { pre.innerHTML = highlightHtml(cfg.code(state)); }
      var knobsEl = null;
      if (cfg.knobs && cfg.knobs.length) { knobsEl = el('div', 'demo-knobs'); wrap.appendChild(knobsEl); }
      wrap.appendChild(codeWrap);
      renderCode();
      copyBtn.onclick = function () { copyText(cfg.code(state)); };

      // Mount is deferred until AFTER wrap is inserted in the document, so components
      // that measure their own size on mount (AmountInput, CopyableField, AmountWithFee)
      // get real dimensions instead of 0 — which is what made them render blank.
      wrap._mount = function () {
        var vm = null;
        function mountNow(target) {
          try {
            vm = new Vue({ data: function () { return state; }, methods: { onResult: function () {}, onClose: function () {}, onChange: function () {}, onInput: function () {}, noop: function () {} }, template: '<div class="vue-mount-inner">' + cfg.template + '</div>' });
            vm.$mount(target);
          } catch (e) {
            if (target && target.parentNode) target.parentNode.innerHTML = '<div class="kit-note" style="text-align:center">Needs structured props — see usage below.</div>';
            console.warn('mount failed:', cfg.title, e);
          }
        }
        if (cfg.noMount) {
          stage.innerHTML = '<div class="kit-note" style="text-align:center">' + (cfg.note || 'Rendered in-app with structured props — see usage below.') + '</div>';
        } else if (cfg.clickToMount) {
          // deferred live mount on click — for components that grab hardware (camera) on mount
          stage.style.flexDirection = 'column';
          if (cfg.clickNote) { var n = el('div', 'kit-note'); n.style.cssText = 'text-align:center;margin-bottom:1.5rem'; n.textContent = cfg.clickNote; stage.appendChild(n); }
          var btn = el('button', 'nq-button-s'); btn.textContent = cfg.clickLabel || 'Start';
          stage.appendChild(btn);
          btn.onclick = function () { stage.innerHTML = ''; var m = el('div'); stage.appendChild(m); mountNow(m); };
        } else {
          mountNow(mountEl);
        }
        if (knobsEl) cfg.knobs.forEach(function (k) { knobsEl.appendChild(buildKnob(k, state, vm, renderCode)); });
      };
      return wrap;
    }

    Object.keys(GROUPS).forEach(function (mountId) {
      var c = document.getElementById(mountId); if (!c) return;
      GROUPS[mountId].forEach(function (cfg) { var w = buildDemo(cfg); c.appendChild(w); w._mount(); });
    });

    /* ---------- patterns ---------- */
    (function () {
      var c = document.getElementById('patterns-mount'); if (!c) return;
      var grid = el('div', 'pattern-grid');
      // account item
      var a = el('div', 'demo'); a.appendChild(el('div', 'demo-head', '<span class="demo-title">Account item</span>'));
      var as = el('div', 'demo-stage'); a.appendChild(as);
      try {
        new Vue({ template: '<div style="display:flex;align-items:center;gap:1.5rem;width:100%"><Identicon address="' + ADDR + '" style="width:6rem;height:6rem"/><div style="flex:1"><div class="nq-label" style="margin:0">Main account</div><div class="nq-h1" style="margin:.5rem 0 0"><Amount :amount="4200000000"/></div></div></div>' }).$mount(as.appendChild(el('div')));
      } catch (e) { as.innerHTML = '<div class="kit-note">pattern unavailable</div>'; }
      grid.appendChild(a);
      // address line
      var b = el('div', 'demo'); b.appendChild(el('div', 'demo-head', '<span class="demo-title">Copyable address</span>'));
      var bs = el('div', 'demo-stage center'); b.appendChild(bs);
      try { new Vue({ template: '<Copyable :text="\'' + ADDR + '\'"><AddressDisplay address="' + ADDR2 + '"/></Copyable>' }).$mount(bs.appendChild(el('div'))); }
      catch (e) { bs.innerHTML = '<div class="kit-note">pattern unavailable</div>'; }
      grid.appendChild(b);
      c.appendChild(grid);
    })();
  })();

  console.log('Nimiq UI Kit ready.');
})();
