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
          template: '<QrCode :data="data" :size="320"/>',
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

/* ==== Wallet-Hub-Keyguard reproductions — init/animation IIFEs ==== */

/* --- sbb --- */
/* sbb — SwapBalanceBar interactivity.
   Self-contained IIFE. Finds each .sbb-root and wires the draggable handle
   (pointer events: mouse + touch), the live header amounts, the diagonal
   "change" hatch on the gaining side, the marching slide-hints, the scale
   percentages, the equilibrium dot and the CurvedLine connectors.

   Simplified static mechanic (as used by the wallet demo): a fixed fiat total
   is conserved across the two sides. The boundary is a percentage p:
   left width = p%, right width = (100 - p)%. Header amounts are derived from
   each side's fiat value via fixed exchange rates. */
(function () {
    "use strict";

    /* Demo constants ------------------------------------------------------ */
    var TOTAL = 2500;      /* conserved fiat total (EUR)          */
    var NIM_RATE = 0.0025; /* EUR per NIM                         */
    var P0 = 60;           /* equilibrium boundary (%) NIM 60/40  */
    var REM = 8;           /* Nimiq rem base (px) used by source geometry */

    /* Right-side assets. Every Nimiq swap is NIM (left) <-> a crypto (right).
       `rate` is EUR per unit, chosen so the amount at equilibrium (40% of the
       2500 EUR total = 1000 EUR) reads sensibly: BTC ~0.02, USDC/USDT ~1,500.
       `dp` = max decimals shown; `color` recolours the right icon + bar (via the
       --sbb-right custom property); `iconSvg`/`iconVb` are the header glyph,
       lifted verbatim from the wallet's Bitcoin/Usdc/UsdtIcon and drawn in
       currentColor so `color` tints them. */
    var ICON_BTC =
        '<circle fill="#fff" cx="21" cy="21" r="18"/>' +
        '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M15.918 41.371c11.253 2.805 22.649-4.04 25.454-15.291C44.176 14.83 37.33 3.433 26.077.628 14.828-2.176 3.433 4.67.629 15.922c-2.806 11.25 4.041 22.645 15.289 25.45zm10.31-29.01c3.041.997 5.265 2.49 4.828 5.27-.316 2.033-1.501 3.018-3.075 3.364 2.161 1.07 3.26 2.712 2.213 5.557-1.3 3.533-4.388 3.831-8.495 3.092l-.998 3.8-2.407-.571.983-3.75a96.07 96.07 0 01-1.919-.474l-.986 3.768-2.406-.571.997-3.807-.652-.161c-.351-.087-.706-.175-1.065-.26l-3.135-.744 1.196-2.623s1.775.448 1.75.415c.682.16.985-.262 1.104-.544l1.575-6.007.255.06a2.197 2.197 0 00-.25-.076l1.123-4.288c.03-.487-.147-1.101-1.122-1.333.038-.024-1.75-.413-1.75-.413l.641-2.448 3.322.79-.003.011c.5.118 1.014.23 1.538.344L20.477 7l2.407.571-.967 3.69c.644.137 1.288.281 1.93.431l.96-3.664 2.408.57-.986 3.764zm-7.622 13.646c1.964.494 6.264 1.575 6.947-1.037.7-2.667-3.463-3.556-5.496-3.991-.229-.049-.43-.092-.594-.13l-1.323 5.043c.134.031.291.07.466.115zm1.857-7.369c1.638.416 5.212 1.324 5.835-1.048.636-2.428-2.838-3.159-4.535-3.516-.19-.04-.359-.076-.496-.108l-1.2 4.574c.114.027.247.06.396.098z"/>';
    var ICON_USDC =
        '<path fill="currentColor" d="M1000 2000c554 0 1000-446 1000-1000S1554 0 1000 0 0 446 0 1000s446 1000 1000 1000z"/>' +
        '<path fill="#fff" d="M1275 1158c0-146-87-196-262-216-125-17-150-50-150-109s41-96 125-96c75 0 116 25 137 88 4 12 17 21 29 21h67c17 0 29-13 29-29v-5c-17-91-92-162-187-170V542c0-17-13-30-34-34h-62c-17 0-29 13-34 34v95c-125 17-204 101-204 205 0 137 84 191 259 212 116 21 154 46 154 113s-59 112-138 112c-108 0-146-46-158-108-4-17-17-25-29-25h-71c-17 0-29 12-29 29v4c16 104 83 179 221 200v100c0 17 12 29 33 34h62c17 0 30-13 34-34v-100c125-21 208-108 208-221z"/>' +
        '<path fill="#fff" d="M788 1596a620 620 0 0 1-371-800 616 616 0 0 1 371-371c16-8 25-21 25-42v-58c0-17-9-29-25-33-5 0-13 0-17 4a749 749 0 0 0 0 1429c17 8 33 0 37-17 5-4 5-8 5-16v-59c0-12-13-29-25-37zm441-1300c-16-9-33 0-37 16-4 5-4 9-4 17v58c0 17 12 34 25 42a620 620 0 0 1 370 800 616 616 0 0 1-371 371c-16 8-24 21-24 42v58c0 17 8 29 25 33 4 0 12 0 16-4a749 749 0 0 0 488-942 756 756 0 0 0-488-491z"/>';
    var ICON_USDT =
        '<path fill="#fff" d="M 19.596219,7.6270475 H 66.430976 V 44.958728 c -15.933124,8.870098 -31.518243,8.139987 -46.834757,0 z"/>' +
        '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M18.97.1h49.25c1.17 0 2.26.61 2.85 1.6L85.4 25.88a3.11 3.11 0 0 1-.53 3.86l-39.5 37.85a3.36 3.36 0 0 1-4.62 0L1.32 29.79a3.11 3.11 0 0 1-.49-3.93L16.17 1.62A3.3 3.3 0 0 1 18.97.1Zm42.89 10.8v6.79H47.83v4.7c9.85.5 17.25 2.57 17.3 5.04v5.17c-.05 2.47-7.45 4.54-17.3 5.04v11.55h-9.32V37.64c-9.85-.5-17.24-2.57-17.3-5.04v-5.17c.06-2.47 7.45-4.54 17.3-5.04v-4.7H24.5v-6.8h37.37ZM43.17 34.1c10.52 0 19.3-1.75 21.46-4.09-1.83-1.97-8.42-3.53-16.8-3.96v4.93a91.59 91.59 0 0 1-9.32 0v-4.93c-8.37.43-14.97 1.99-16.8 3.96 2.16 2.34 10.95 4.08 21.46 4.08Z"/>';

    var ASSETS = {
        btc:  { label: "Bitcoin",  unit: "BTC",  rate: 50000,       dp: 8, color: "var(--sbb-bitcoin)", iconVb: "0 0 42 42",     iconSvg: ICON_BTC },
        usdc: { label: "USD Coin", unit: "USDC", rate: 1000 / 1500, dp: 2, color: "var(--sbb-usdc)",    iconVb: "0 0 2000 2000", iconSvg: ICON_USDC },
        usdt: { label: "Tether",   unit: "USDT", rate: 1000 / 1500, dp: 2, color: "var(--sbb-usdt)",    iconVb: "0 0 86 69",     iconSvg: ICON_USDT }
    };

    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    function fmtNim(n) {
        return Math.round(n).toLocaleString("en-US") + " NIM";
    }
    /* Generic crypto formatter: rounds to `dp` decimals, trims trailing zeros,
       and adds thousands separators to the integer part (=> "0.02 BTC",
       "1,500 USDC"). Uses toFixed to avoid scientific notation on tiny amounts. */
    function fmtCrypto(n, unit, dp) {
        if (!isFinite(n) || n <= 0) return "0 " + unit;
        var s = n.toFixed(dp).replace(/\.?0+$/, "");
        if (s === "" || s === "0" || s === "-0") return "0 " + unit;
        var neg = s.charAt(0) === "-";
        if (neg) s = s.slice(1);
        var dot = s.indexOf(".");
        var intPart = (dot === -1 ? s : s.slice(0, dot));
        var frac = (dot === -1 ? "" : s.slice(dot));
        intPart = parseInt(intPart, 10).toLocaleString("en-US");
        return (neg ? "-" : "") + intPart + frac + " " + unit;
    }

    /* CurvedLine path — verbatim formula from CurvedLine.vue (height 35) */
    function curve(width, height) {
        var minWidth = 2;
        var localWidth = width <= minWidth ? minWidth : Math.round(width);
        var angleSize = Math.max(8, Math.min(12, Math.sqrt(localWidth)));
        var y = Math.round(Math.max(3, Math.min(10, angleSize - width / 10)));
        var x = Math.round(Math.max(0, Math.min(12, angleSize - width / 10)));
        var d =
            "M 1 1 v 1 s 0 " + (angleSize - y) + " " + (angleSize - x) + " " + angleSize +
            " S " + (Math.round(width) - ((angleSize - x) * 2 + 1)) + " " + (height - (angleSize + y + 3)) +
            " " + (Math.round(width) - (angleSize + 1) + x) + " " + (height - (angleSize + 3)) +
            " s " + (angleSize - x) + " " + angleSize + " " + (angleSize - x) + " " + angleSize +
            " v 1";
        return { d: d, width: localWidth };
    }

    function init(root) {
        if (root.getAttribute("data-sbb-ready") === "true") return;
        root.setAttribute("data-sbb-ready", "true");

        var el = {
            track: root.querySelector(".sbb-bar-track"),
            leftBar: root.querySelector(".sbb-bar-left"),
            rightBar: root.querySelector(".sbb-bar-right"),
            leftChange: root.querySelector(".sbb-bar-left .sbb-change"),
            rightChange: root.querySelector(".sbb-bar-right .sbb-change"),
            separator: root.querySelector(".sbb-separator"),
            handle: root.querySelector(".sbb-handle"),
            leftAmount: root.querySelector('.sbb-amount[data-side="left"]'),
            rightAmount: root.querySelector('.sbb-amount[data-side="right"]'),
            rightLabel: root.querySelector(".sbb-right .sbb-clabel"),
            rightIcon: root.querySelector(".sbb-right .sbb-cicon"),
            leftPct: root.querySelector(".sbb-left-percent"),
            rightPct: root.querySelector(".sbb-right-percent"),
            hintLeft: root.querySelector(".sbb-slidehint-left"),
            hintRight: root.querySelector(".sbb-slidehint-right"),
            equi: root.querySelector(".sbb-equilibrium"),
            curveLeft: root.querySelector(".sbb-curve-left"),
            curveRight: root.querySelector(".sbb-curve-right")
        };

        var p = P0;
        var asset = ASSETS.btc;   /* current right-side asset (default BTC) */

        function setCurve(svg, res, height) {
            svg.setAttribute("viewBox", "0 0 " + res.width + " " + height);
            svg.style.width = res.width + "px";
            svg.style.height = height + "px";
            var path = svg.querySelector("path");
            if (path) path.setAttribute("d", res.d);
        }

        function updateCurves() {
            if (!el.curveLeft || !el.curveRight) return;
            var h = 35;
            var lb = el.leftBar, rb = el.rightBar;
            var leftWidth = lb.offsetWidth / 2 + lb.offsetLeft - REM * 2.5;
            var rightWidth = rb.offsetWidth / 2 - REM * 2.5;
            setCurve(el.curveLeft, curve(leftWidth, h), h);
            setCurve(el.curveRight, curve(rightWidth, h), h);
        }

        function render() {
            var leftFiat = TOTAL * p / 100;
            var rightFiat = TOTAL - leftFiat;

            el.leftBar.style.flexGrow = String(p);
            el.rightBar.style.flexGrow = String(100 - p);

            el.leftAmount.textContent = fmtNim(leftFiat / NIM_RATE);
            el.rightAmount.textContent = fmtCrypto(rightFiat / asset.rate, asset.unit, asset.dp);

            var leftPct = Math.round(p);
            var rightPct = Math.round(100 - p);

            /* gaining side's hatch = |p - p0| as a fraction of that side */
            var leftChangePct = 0, rightChangePct = 0;
            if (p > P0) leftChangePct = (p - P0) / p * 100;
            else if (p < P0) rightChangePct = (P0 - p) / (100 - p) * 100;
            el.leftChange.style.width = leftChangePct + "%";
            el.rightChange.style.width = rightChangePct + "%";

            el.leftPct.textContent = leftPct + "%";
            el.rightPct.textContent = rightPct + "%";
            var equiX = P0;
            el.leftPct.classList.toggle("sbb-hidden",
                leftPct <= 5 || (equiX < 10 && equiX > 5));
            el.rightPct.classList.toggle("sbb-hidden",
                rightPct <= 5 || (equiX > 90 && equiX < 95));

            /* slide hints appear when a side collapses to <= 2% */
            el.hintLeft.classList.toggle("sbb-hint-visible", rightPct <= 2);
            el.hintRight.classList.toggle("sbb-hint-visible", leftPct <= 2);

            /* equilibrium dot: at p0, hidden when near the handle or the edges */
            var trackW = el.track.offsetWidth || root.offsetWidth || 1;
            var thr = 8 / trackW * 100;
            el.equi.style.left = equiX + "%";
            el.equi.classList.toggle("sbb-hidden",
                Math.abs(p - equiX) < thr || equiX <= 5 || equiX >= 95);

            updateCurves();
        }

        /* ---- dragging (pointer events unify mouse + touch) ---- */
        var grabbing = false, startX = 0, startP = 0;

        function down(e) {
            grabbing = true;
            startX = e.clientX;
            startP = p;
            root.classList.remove("sbb-animating");
            if (el.handle.setPointerCapture && e.pointerId != null) {
                try { el.handle.setPointerCapture(e.pointerId); } catch (_) {}
            }
            e.preventDefault();
            e.stopPropagation();
        }
        function move(e) {
            if (!grabbing) return;
            var w = el.track.offsetWidth || 1;
            /* p = (clientX - barLeft)/barWidth*100, applied as a grab-relative
               delta so the handle never jumps under the cursor */
            p = clamp(startP + (e.clientX - startX) / w * 100, 0, 100);
            render();
        }
        function up(e) {
            grabbing = false;
            if (el.handle.releasePointerCapture && e.pointerId != null) {
                try { el.handle.releasePointerCapture(e.pointerId); } catch (_) {}
            }
        }

        el.handle.addEventListener("pointerdown", down);
        el.handle.addEventListener("pointermove", move);
        el.handle.addEventListener("pointerup", up);
        el.handle.addEventListener("pointercancel", up);

        /* ---- click a bar to move the handle there (animated) ---- */
        function animateTo(target) {
            root.classList.add("sbb-animating");
            p = clamp(target, 0, 100);
            render();
            window.setTimeout(function () {
                root.classList.remove("sbb-animating");
            }, 320);
        }
        el.track.addEventListener("pointerdown", function (e) {
            if (e.target.closest(".sbb-separator")) return; /* handled by handle */
            var r = el.track.getBoundingClientRect();
            animateTo((e.clientX - r.left) / r.width * 100);
        });

        /* ---- click the equilibrium dot to reset ---- */
        el.equi.addEventListener("click", function () { animateTo(P0); });

        /* ---- right-side asset selector (NIM stays on the left) ----
           Switches the right colour, header label + icon and the amount/unit.
           The conserved-total drag keeps working: only `asset` changes, the
           boundary `p` is untouched. */
        function setAsset(key) {
            if (!ASSETS[key]) return;
            asset = ASSETS[key];
            root.style.setProperty("--sbb-right", asset.color);
            if (el.rightLabel) el.rightLabel.textContent = asset.label;
            if (el.rightIcon) {
                el.rightIcon.setAttribute("viewBox", asset.iconVb);
                el.rightIcon.innerHTML = asset.iconSvg;
            }
            render();
        }
        var demo = root.closest(".demo");
        var select = demo ? demo.querySelector(".sbb-select") : null;
        if (select) {
            var pills = select.querySelectorAll(".sbb-select-pill");
            select.addEventListener("click", function (e) {
                var btn = e.target.closest(".sbb-select-pill");
                if (!btn || !select.contains(btn)) return;
                for (var i = 0; i < pills.length; i++) {
                    var on = pills[i] === btn;
                    pills[i].classList.toggle("is-active", on);
                    pills[i].setAttribute("aria-pressed", on ? "true" : "false");
                }
                setAsset(btn.getAttribute("data-asset"));
            });
        }

        window.addEventListener("resize", render);
        render();
    }

    function boot() {
        var roots = document.querySelectorAll(".sbb-root");
        for (var i = 0; i < roots.length; i++) init(roots[i]);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();

/* --- swi --- */
/* swi — swap icons. Pure display: the three swap glyphs are inline SVGs that
   inherit stroke:currentColor from CSS. No interactivity required, so this is a
   near-no-op IIFE that simply confirms the root is present. */
(function () {
    "use strict";
    function init() {
        var root = document.querySelector(".swi-root");
        if (!root) return;
        // Nothing to wire — icons are static. Marker attribute for parity with the kit.
        root.setAttribute("data-swi-ready", "true");
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/* --- swa --- */
/* =====================================================================
   swa — Atomic Swap animation loop.
   Self-contained IIFE. Cycles the source's state classes on
   `.swa-animation` (sign-swap -> await-incoming -> create-outgoing ->
   await-secret -> settle-incoming -> complete), waits, then restarts.
   No Vue, no state store, no network — a pure setTimeout chain.
   ===================================================================== */
(function () {
    'use strict';

    var root = document.querySelector('.swa-root');
    if (!root) return;
    var anim = root.querySelector('.swa-animation');
    var stepEl = root.querySelector('.swa-step');
    if (!anim) return;

    /* Right-side asset (NIM stays on the left). Each entry carries the piece
       colour (drives currentColor on the whole right HTLC), the white logo
       glyph that sits on the coloured disc (viewBox + inner SVG, lifted from
       the wallet's swap/animation/{bitcoin,usdc,usdt}.svg) and the piece
       amount + the footer "Locking up <unit>" text. */
    var LOGO_BTC =
        '<path fill="#fff" d="M40 22.8c.5-3.4-2.3-5.3-6-6.5l1.2-4.7-3-.7-1.2 4.5-2.4-.5 1.2-4.6-3-.7-1.2 4.7-2-.4-4-1-.8 3s2.2.4 2.1.5c1.3.3 1.5 1 1.4 1.6L21 23.4h.3-.3l-2 7.4a1 1 0 01-1.4.7l-2.1-.5-1.5 3.2 3.9 1 2.1.5-1.2 4.7 3 .7 1.2-4.7 2.4.6-1.2 4.7 3 .7 1.2-4.7c5 .9 8.9.5 10.5-3.9 1.3-3.5 0-5.5-2.7-6.8a4.6 4.6 0 003.7-4.2zm-6.9 9c-.9 3.6-7.1 1.7-9.2 1.2l1.7-6.2c2 .5 8.5 1.4 7.5 5zm1-9c-.9 3.2-6 1.5-7.8 1.1l1.5-5.6c1.7.4 7.1 1.1 6.2 4.4z"/>';
    var LOGO_USDC =
        '<path fill="#fff" d="M1275 1158c0-146-87-196-262-216-125-17-150-50-150-109s41-96 125-96c75 0 116 25 137 88 4 12 17 21 29 21h67c17 0 29-13 29-29v-5c-17-91-92-162-187-170V542c0-17-13-30-34-34h-62c-17 0-29 13-34 34v95c-125 17-204 101-204 205 0 137 84 191 259 212 116 21 154 46 154 113s-59 112-138 112c-108 0-146-46-158-108-4-17-17-25-29-25h-71c-17 0-29 12-29 29v4c16 104 83 179 221 200v100c0 17 12 29 33 34h62c17 0 30-13 34-34v-100c125-21 208-108 208-221z"/>' +
        '<path fill="#fff" d="M788 1596a620 620 0 0 1-371-800 616 616 0 0 1 371-371c16-8 25-21 25-42v-58c0-17-9-29-25-33-5 0-13 0-17 4a749 749 0 0 0 0 1429c17 8 33 0 37-17 5-4 5-8 5-16v-59c0-12-13-29-25-37zm441-1300c-16-9-33 0-37 16-4 5-4 9-4 17v58c0 17 12 34 25 42a620 620 0 0 1 370 800 616 616 0 0 1-371 371c-16 8-24 21-24 42v58c0 17 8 29 25 33 4 0 12 0 16-4a749 749 0 0 0 488-942 756 756 0 0 0-488-491z"/>';
    var LOGO_USDT =
        '<path fill-rule="evenodd" clip-rule="evenodd" fill="#fff" d="M400.49 428.59C469.28 428.59 526.77 416.96 540.82 401.42C528.89 388.24 485.74 377.86 430.94 375.02V407.85C421.13 408.36 410.93 408.61 400.48 408.61C390.03 408.61 379.83 408.36 370 407.85V375.02C315.22 377.86 272.05 388.24 260.12 401.42C274.19 416.96 331.69 428.59 400.48 428.59H400.49ZM522.71 274.06V319.27H430.94V350.62C495.4 353.97 543.77 367.75 544.13 384.24V418.62C543.77 435.11 495.4 448.86 430.94 452.22V529.16H370.01V452.22C305.55 448.87 257.2 435.11 256.84 418.62V384.24C257.2 367.75 305.55 353.97 370.01 350.62V319.27H278.24V274.06H522.72H522.71ZM242.15 202.11H564.31C572.01 202.11 579.1 206.16 582.94 212.74L676.79 373.9C681.65 382.26 680.21 392.81 673.27 399.58L414.93 651.76C406.55 659.93 393.09 659.93 384.73 651.76L126.71 399.92C119.62 392.98 118.28 382.13 123.51 373.73L223.84 212.24C227.75 205.96 234.69 202.12 242.16 202.12L242.15 202.11Z"/>';

    var ASSETS = {
        btc:  { unit: 'BTC',  amount: '0.0004 BTC', color: 'var(--bitcoin-orange)', logoVb: '1 0 53 52',     logoSvg: LOGO_BTC },
        usdc: { unit: 'USDC', amount: '15 USDC',    color: 'var(--usdc-blue)',      logoVb: '0 0 2000 2000', logoSvg: LOGO_USDC },
        usdt: { unit: 'USDT', amount: '15 USDT',    color: 'var(--usdt-green)',     logoVb: '0 0 800 800',   logoSvg: LOGO_USDT }
    };
    var currentAsset = 'btc';
    var currentStage = null;
    var rightPiece  = root.querySelector('.swa-right .swa-piece');
    var rightLogo   = root.querySelector('.swa-right .swa-btc-logo');
    var rightAmount = root.querySelector('.swa-right .swa-swap-amount span');

    var STAGES = [
        'swa-sign-swap',
        'swa-await-incoming',
        'swa-create-outgoing',
        'swa-await-secret',
        'swa-settle-incoming',
        'swa-complete'
    ];

    /* Time SPENT in each stage before advancing (ms). Mirrors the source
       processStateChange() delays (0 / 1 / 2.6 / 2.6 / 1.6 / 1 s). The one
       deviation: `sign-swap` is held for a short, perceptible beat rather
       than the source's literal 0s (the real wallet blocked there on the
       user signing) so the zoomed-in opening pose is visible in the loop. */
    var DURATION = {
        'swa-sign-swap':       700,
        'swa-await-incoming':  1000,
        'swa-create-outgoing': 2600,
        'swa-await-secret':    2600,
        'swa-settle-incoming': 1600,
        'swa-complete':        1000
    };

    /* Extra hold on the green success screen before the loop restarts. */
    var SUCCESS_HOLD = 1000;

    /* Footer step label per stage (source nq-card-footer strings). */
    var STEP_LABEL = {
        'swa-sign-swap':       '1/5 Setting up atomic swap',
        'swa-await-incoming':  '2/5 Locking up BTC',
        'swa-create-outgoing': '3/5 Locking up NIM',
        'swa-await-secret':    '4/5 Awaiting swap secret',
        'swa-settle-incoming': '5/5 Finalizing swap',
        'swa-complete':        '5/5 Finalizing swap'
    };

    /* The "Locking up <asset>" step follows the selected right-side asset. */
    function labelFor(cls) {
        if (cls === 'swa-await-incoming') return '2/5 Locking up ' + ASSETS[currentAsset].unit;
        return STEP_LABEL[cls];
    }

    /* Apply the selected right-side asset: recolour the whole right HTLC piece
       (currentColor), swap its white logo glyph + amount, and refresh the
       footer label if the "Locking up" step is currently showing. The loop is
       untouched — only the right asset's presentation changes. */
    function applyAsset(key) {
        if (!ASSETS[key]) return;
        currentAsset = key;
        var a = ASSETS[key];
        if (rightPiece) rightPiece.style.color = a.color;
        if (rightLogo) {
            rightLogo.setAttribute('viewBox', a.logoVb);
            rightLogo.innerHTML = a.logoSvg;
        }
        if (rightAmount) rightAmount.textContent = a.amount;
        if (stepEl && currentStage) stepEl.textContent = labelFor(currentStage);
    }

    var timer = null;

    function clearStages() {
        for (var i = 0; i < STAGES.length; i++) anim.classList.remove(STAGES[i]);
    }

    function setStage(cls, instant) {
        if (instant) root.classList.add('swa-no-anim');

        clearStages();
        anim.classList.add(cls);
        root.classList.toggle('swa-is-complete', cls === 'swa-complete');
        currentStage = cls;
        if (stepEl && labelFor(cls)) stepEl.textContent = labelFor(cls);

        if (instant) {
            /* Force a reflow so the snapped-back styles are committed while
               transitions/animations are suppressed, then re-enable them on
               the next frame. This makes the complete -> sign-swap loop
               restart invisible (no reverse slide / fade). */
            /* eslint-disable-next-line no-unused-expressions */
            root.offsetHeight; // reflow
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    root.classList.remove('swa-no-anim');
                });
            });
        }
    }

    function step(index, instant) {
        var cls = STAGES[index];
        setStage(cls, instant);

        var isLast = index === STAGES.length - 1; // swa-complete
        var wait = DURATION[cls] + (isLast ? SUCCESS_HOLD : 0);

        timer = setTimeout(function () {
            if (isLast) {
                step(0, true);          // restart: snap instantly to the opening pose
            } else {
                step(index + 1, false); // advance with animated transition
            }
        }, wait);
    }

    function start() {
        if (timer) clearTimeout(timer);
        step(0, true);
    }

    /* ---- right-side asset selector (NIM stays on the left) ---- */
    (function () {
        var demo = root.closest('.demo');
        var select = demo ? demo.querySelector('.swa-select') : null;
        if (!select) return;
        var pills = select.querySelectorAll('.swa-select-pill');
        select.addEventListener('click', function (e) {
            var btn = e.target.closest('.swa-select-pill');
            if (!btn || !select.contains(btn)) return;
            for (var i = 0; i < pills.length; i++) {
                var on = pills[i] === btn;
                pills[i].classList.toggle('is-active', on);
                pills[i].setAttribute('aria-pressed', on ? 'true' : 'false');
            }
            applyAsset(btn.getAttribute('data-asset'));
        });
    })();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

/* --- lgu --- */
/* ============================================================================
   lgu — Ledger connect UI loop driver
   Self-contained IIFE. Cycles the `connect-animation-step` attribute
   1 -> 2 -> 3 -> 1 … forever on every `.lgu-device-container`, with
   `illustration="connecting"`, so the CSS keyframes replay seamlessly.

   Step 1: cable slides in + device fades in
   Step 2: device scales up to the PIN screen + dots fill in a staggered wave
   Step 3: device fades out -> dashboard flash -> app screen
   Interval matches the CSS token --lgu-connect-animation-step-duration: 3s.
   ============================================================================ */
(function () {
    'use strict';

    // Keep in sync with --lgu-connect-animation-step-duration (3s).
    var STEP_DURATION_MS = 3000;
    var STEPS = 3;

    function start() {
        var containers = document.querySelectorAll('.lgu-device-container');
        if (!containers.length) return;

        // Drive every instance in lockstep so multiple embeds stay in sync.
        var step = 1;

        function apply() {
            for (var i = 0; i < containers.length; i++) {
                containers[i].setAttribute('illustration', 'connecting');
                containers[i].setAttribute('connect-animation-step', String(step));
            }
        }

        apply();
        setInterval(function () {
            step = (step % STEPS) + 1;
            apply();
        }, STEP_DURATION_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

/* --- lofc --- */
/* ==========================================================================
   lofc — Nimiq Login File card (static).
   The card is fully declarative (HTML + CSS); there is no behavior to drive.
   This no-op IIFE exists only to complete the component trio.
   ========================================================================== */
(function () {
    'use strict';
    /* intentionally empty — the Login File card is static */
}());

/* --- lofa --- */
/* ==========================================================================
   lofa — Nimiq Login File draw-in animation (autonomous loop)

   Reproduces the Keyguard interaction (LoginFileAnimation.js) where the user
   types a password — each keystroke calls setStep(length), popping in one QR
   square (steps 1..8) — and on confirm calls setColor(index), transitioning
   the line-art file into a filled, colored account card.

   Here there is no input: an IIFE drives the same state machine on a loop —
   breathe -> draw in squares 1..8 -> colorize (random palette color) -> hold
   -> reset -> repeat with a DIFFERENT color. No framework, state, or network.
   ========================================================================== */
(function () {
    'use strict';

    var STEPS = 8;                 // LoginFileAnimation.STEPS
    var COLORS = 10;               // LoginFileConfig entries (lofa-c0 .. lofa-c9)

    var root = document.querySelector('.lofa-root');
    var background = root && root.querySelector('.lofa-background');
    if (!root || !background) return;

    var currentColor = -1;

    // --- setStep: cumulatively add step-0..step, remove above (verbatim logic)
    function setStep(step) {
        for (var i = STEPS; i > step; i--) {
            root.classList.remove('lofa-step-' + i);
        }
        for (var j = 0; j <= Math.min(step, STEPS); j++) {
            root.classList.add('lofa-step-' + j);
        }
    }

    // --- setColor: paint the background gradient + transition to colored state
    function setColor(color) {
        currentColor = color;
        background.classList.add('lofa-c' + color);
        root.classList.add('lofa-colored');
        setStep(0);
    }

    // --- reset: back to the clear, breathing line-art state
    function reset() {
        if (currentColor >= 0) background.classList.remove('lofa-c' + currentColor);
        root.classList.remove('lofa-colored');
        setStep(0);
    }

    function randomColor() {
        var c = Math.floor(Math.random() * COLORS);
        if (c === currentColor) c = (c + 1) % COLORS; // ensure a different color
        return c;
    }

    // --- timeline ---------------------------------------------------------
    var INITIAL_HOLD = 700;   // breathe before drawing in
    var STEP_INTERVAL = 350;  // per square, matches the "typing" cadence
    var PRE_COLOR_PAUSE = 300; // beat after the 8th square (key visible)
    var COLOR_HOLD = 2200;    // hold the finished, colored card
    var RESET_HOLD = 950;     // breathe again before the next cycle

    var timers = [];
    function later(fn, delay) { timers.push(setTimeout(fn, delay)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function cycle() {
        clearTimers();
        reset();

        // Draw in squares 1..8 after the initial breathing hold.
        for (var s = 1; s <= STEPS; s++) {
            (function (step) {
                later(function () { setStep(step); }, INITIAL_HOLD + step * STEP_INTERVAL);
            })(s);
        }

        var colorAt = INITIAL_HOLD + STEPS * STEP_INTERVAL + PRE_COLOR_PAUSE;
        later(function () { setColor(randomColor()); }, colorAt);

        // Reset, hold on the clear state, then start the next cycle.
        var resetAt = colorAt + COLOR_HOLD;
        later(reset, resetAt);
        later(cycle, resetAt + RESET_HOLD);
    }

    // Respect users who prefer reduced motion: show one finished colored card.
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        setStep(STEPS);
        setColor(6); // teal
    } else {
        cycle();
    }
}());

/* --- bcb --- */
/* =============================================================================
 * bcb — Backup-code chat bubbles (animation loop)
 *
 * A self-contained IIFE state machine. It replaces the source's View Transition
 * choreography (BackupCodesIllustration.js) with a CSS-transition-driven loop
 * that cycles through the SAME six steps. For each step the per-bubble state
 * classes (masked / faded / zoomed / complete) are exactly those computed by
 * BackupCodesIllustration._getMessageBubbleClasses in the Keyguard source.
 *
 * Sequence: intro -> send code 1 -> code 1 complete -> send code 2
 *           -> code 2 complete -> success (both done) -> reset -> repeat.
 * ========================================================================== */
(function () {
    'use strict';

    var root = document.querySelector('.bcb-root');
    if (!root) return;

    var bubbles = {
        1: root.querySelector('.bcb-code-1'),
        2: root.querySelector('.bcb-code-2'),
    };
    if (!bubbles[1] || !bubbles[2]) return;

    var STATE_CLASSES = ['bcb-masked', 'bcb-faded', 'bcb-zoomed', 'bcb-complete'];
    var STEP_CLASSES = [
        'bcb-intro',
        'bcb-send-code-1',
        'bcb-send-code-1-confirm',
        'bcb-send-code-2',
        'bcb-send-code-2-confirm',
        'bcb-success',
    ];

    // Per-step definition. `code1` / `code2` list the state suffixes to apply to
    // each bubble (mirrors _getMessageBubbleClasses for codeIndex 1 and 2).
    var steps = [
        { step: 'bcb-intro',                dwell: 1800, code1: ['masked'],                     code2: ['masked'] },
        { step: 'bcb-send-code-1',          dwell: 1500, code1: ['zoomed'],                     code2: ['masked', 'faded', 'zoomed'] },
        { step: 'bcb-send-code-1-confirm',  dwell: 1400, code1: ['zoomed', 'complete'],         code2: ['masked', 'faded', 'zoomed'] },
        { step: 'bcb-send-code-2',          dwell: 1500, code1: ['faded', 'zoomed', 'complete'], code2: ['zoomed'] },
        { step: 'bcb-send-code-2-confirm',  dwell: 1400, code1: ['faded', 'zoomed', 'complete'], code2: ['zoomed', 'complete'] },
        { step: 'bcb-success',              dwell: 2400, code1: ['complete'],                   code2: ['complete'] },
    ];

    function applyState(bubble, names) {
        STATE_CLASSES.forEach(function (c) { bubble.classList.remove(c); });
        names.forEach(function (n) { bubble.classList.add('bcb-' + n); });
    }

    function render(s) {
        STEP_CLASSES.forEach(function (c) { root.classList.toggle(c, c === s.step); });
        applyState(bubbles[1], s.code1);
        applyState(bubbles[2], s.code2);
    }

    // Respect reduced-motion: render the intro state statically, no loop.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        render(steps[0]);
        return;
    }

    var i = 0;
    (function tick() {
        var s = steps[i];
        render(s);
        i = (i + 1) % steps.length;
        window.setTimeout(tick, s.dwell);
    })();
})();

/* --- rwg --- */
/* =============================================================================
 * rwg — 24-word Recovery Words grid
 *
 * The display variant of RecoveryWords (providesInput === false) is a purely
 * static, non-interactive read-out of the seed phrase. There is no behaviour to
 * wire up, so this is an intentional no-op IIFE kept for the component trio.
 * ========================================================================== */
(function () {
    'use strict';
    /* Static grid — no interactivity. */
})();

/* --- ppb --- */
/* ppb — eye show/hide toggle.
 * Mirrors PasswordInput._changeVisibility: swaps input type password<->text
 * and toggles the `visible` state class that switches the eye glyph.
 * Self-contained IIFE, no dependencies. */
(function () {
    'use strict';

    var buttons = document.querySelectorAll('.ppb-eye-button');

    Array.prototype.forEach.call(buttons, function (button) {
        var container = button.closest('.ppb-input-container') || document;
        var input = container.querySelector('.ppb-password');
        if (!input) return;

        button.addEventListener('click', function () {
            var reveal = input.getAttribute('type') === 'password';
            input.setAttribute('type', reveal ? 'text' : 'password');
            button.classList.toggle('ppb-visible', reveal);
            button.setAttribute('aria-pressed', String(reveal));
            button.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
            input.focus();
        });
    });
})();

/* --- bdb --- */
/* bdb — BalanceDistributionBar (static display variant).
 * The source display bar has no interactivity (drag lives in the swap-slider
 * variant, not reproduced here), so this is a deliberate no-op IIFE. */
(function () {
    'use strict';
    /* Static component — nothing to wire. */
})();

/* Login File card QR — mount the real @nimiq/vue-components QrCode (white, rounded modules),
   the same generator the actual keyguard Login File uses. */
(function () {
  if (!window.Vue) return;
  document.querySelectorAll('.lofc-qr[data-lofc-qr]').forEach(function (el) {
    var data = el.getAttribute('data-lofc-qr') || 'https://nimiq.com';
    try {
      var vm = new window.Vue({
        data: function () { return { d: data }; },
        template: '<QrCode :data="d" :size="264" fill="white" errorCorrection="M"/>'
      });
      vm.$mount();
      el.appendChild(vm.$el);
    } catch (e) { if (window.console) console.warn('lofc QR mount failed', e); }
  });
})();
