/**
 * NUMERAEL — Decision Sphere
 * Floating sphere + deterministic decision timing interface.
 * Chatbot EXPLAINS decisions, does NOT make them. All decisions come from DecisionTiming engine.
 */
(function() {
  'use strict';

  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';

  // ═══════════════════════════════════════════════════════════
  // CSS
  // ═══════════════════════════════════════════════════════════
  var style = document.createElement('style');
  style.textContent = `
    /* ─── ORB ─── */
    #ael-orb {
      position: fixed;
      bottom: 90px;
      right: 18px;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #2a2a2a, #141414);
      border: 1.5px solid rgba(255,255,255,0.1);
      box-shadow: 0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
      cursor: pointer;
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.3s;
      -webkit-tap-highlight-color: transparent;
    }
    @keyframes ds-pulse {
      0%, 100% { box-shadow: 0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06); }
      50% { box-shadow: 0 2px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1); }
    }
    #ael-orb:hover {
      transform: scale(1.08);
      animation: ds-pulse 1.5s ease-in-out infinite;
    }
    #ael-orb:active { transform: scale(0.95); }
    #ael-orb-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      box-shadow: 0 0 8px rgba(255,255,255,0.3);
      transition: background 0.3s;
    }
    #ael-orb.has-result #ael-orb-dot { background: #4ade80; box-shadow: 0 0 10px rgba(74,222,128,0.4); }

    /* ─── TOOLTIP ─── */
    #ael-tooltip {
      position: fixed;
      bottom: 100px;
      right: 72px;
      background: rgba(20,20,20,0.95);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 8px 14px;
      pointer-events: none;
      opacity: 0;
      transform: translateX(6px);
      transition: opacity 0.2s, transform 0.2s;
      z-index: 501;
      white-space: nowrap;
    }
    #ael-tooltip.show { opacity: 1; transform: translateX(0); }
    #ael-tooltip-title {
      font-size: 13px;
      font-weight: 800;
      color: rgba(255,255,255,0.9);
      font-family: 'Space Grotesk', sans-serif;
      letter-spacing: 0.08em;
    }
    #ael-tooltip-sub {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      font-family: 'Space Grotesk', sans-serif;
      margin-top: 1px;
    }

    /* ─── OVERLAY + MODAL ─── */
    #ael-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9000;
      align-items: flex-end;
      justify-content: center;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
    }
    #ael-modal {
      width: 100%;
      max-width: 480px;
      height: 85vh;
      max-height: 700px;
      background: #0e0e0e;
      border-radius: 20px 20px 0 0;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.35s cubic-bezier(0.34,1.1,0.64,1);
      overflow: hidden;
    }

    /* ─── HEADER ─── */
    #ael-header {
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    #ael-header-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #2a2a2a, #141414);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #ael-header-icon .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); }
    #ael-header-info { flex: 1; }
    #ael-header-name {
      font-size: 15px; font-weight: 800; color: rgba(255,255,255,0.9);
      font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.1em;
    }
    #ael-header-status {
      font-size: 11px; color: rgba(255,255,255,0.35);
      font-family: 'Space Grotesk', sans-serif;
    }
    #ael-close {
      width: 32px; height: 32px; background: rgba(255,255,255,0.06);
      border: none; border-radius: 50%; color: rgba(255,255,255,0.4);
      cursor: pointer; font-size: 15px;
      display: flex; align-items: center; justify-content: center;
    }
    #ael-close:hover { background: rgba(255,255,255,0.1); }

    /* ─── ACTION PICKER ─── */
    #ael-actions {
      padding: 16px;
      flex-shrink: 0;
    }
    #ael-actions-label {
      font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3);
      text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px;
      font-family: 'Space Grotesk', sans-serif;
    }
    #ael-actions-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    }
    .ael-action-btn {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 14px 12px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ael-action-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
    .ael-action-btn:active { transform: scale(0.97); }
    .ael-action-btn.selected { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.08); }
    .ael-action-icon {
      font-size: 18px; color: rgba(255,255,255,0.5);
    }
    .ael-action-label {
      font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.8);
      font-family: 'Space Grotesk', sans-serif;
    }
    .ael-action-sub {
      font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px;
      font-family: 'Space Grotesk', sans-serif;
    }

    /* ─── RESULT CARD ─── */
    #ael-result {
      display: none;
      padding: 0 16px 8px;
      flex-shrink: 0;
    }
    #ael-result-card {
      border-radius: 14px;
      padding: 16px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .ael-score-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
    }
    #ael-score-label {
      font-size: 13px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif;
    }
    #ael-score-num {
      font-size: 28px; font-weight: 900; font-family: 'Space Grotesk', sans-serif;
    }
    #ael-score-bar {
      height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px;
      overflow: hidden; margin-bottom: 12px;
    }
    #ael-score-fill {
      height: 100%; border-radius: 2px; transition: width 0.5s ease;
    }
    #ael-reason {
      font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6;
      font-family: 'Space Grotesk', sans-serif;
    }
    #ael-warning {
      display: none;
      margin-top: 10px; padding: 10px 12px;
      background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
      border-radius: 8px; font-size: 12px; color: rgba(239,68,68,0.85);
      line-height: 1.5; font-family: 'Space Grotesk', sans-serif;
    }
    #ael-rationale {
      display: none;
      margin-top: 14px; padding: 12px 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      font-size: 12.5px; color: rgba(255,255,255,0.55);
      line-height: 1.7;
      font-family: 'Space Grotesk', sans-serif;
    }
    #ael-risk-badge {
      display: inline-block; padding: 3px 8px; border-radius: 6px;
      font-size: 10px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.08em; font-family: 'Space Grotesk', sans-serif;
    }
    #ael-directive {
      margin-top: 10px; padding: 10px 14px;
      border-radius: 10px; font-size: 13px; font-weight: 800;
      text-align: center; letter-spacing: 0.04em;
      font-family: 'Space Grotesk', sans-serif;
    }

    /* ─── CHAT ─── */
    #ael-chat {
      flex: 1; overflow-y: auto; padding: 12px 16px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    #ael-chat::-webkit-scrollbar { width: 3px; }
    #ael-chat::-webkit-scrollbar-track { background: transparent; }
    #ael-chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .ael-msg { display: flex; gap: 8px; max-width: 90%; animation: ael-msg-in 0.25s ease; }
    .ael-msg-ael { align-self: flex-start; }
    .ael-msg-user { align-self: flex-end; flex-direction: row-reverse; }
    @keyframes ael-msg-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ael-msg-bubble {
      padding: 10px 14px; border-radius: 14px;
      font-size: 13px; line-height: 1.55; font-family: 'Space Grotesk', sans-serif;
    }
    .ael-msg-ael .ael-msg-bubble {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.8);
      border-bottom-left-radius: 4px;
    }
    .ael-msg-user .ael-msg-bubble {
      background: rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.9);
      font-weight: 600;
      border-bottom-right-radius: 4px;
    }
    .ael-msg-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #2a2a2a, #141414);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px;
    }
    .ael-msg-avatar .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.4); }

    .ael-typing {
      display: flex; gap: 4px; padding: 10px 14px;
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; border-bottom-left-radius: 4px; width: fit-content;
    }
    .ael-typing-dot {
      width: 5px; height: 5px; background: rgba(255,255,255,0.3);
      border-radius: 50%; animation: ael-type 1.2s ease-in-out infinite;
    }
    .ael-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .ael-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ael-type {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 0.8; }
    }

    /* ─── INPUT ─── */
    #ael-input-area {
      padding: 10px 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;
    }
    #ael-input {
      flex: 1; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 18px;
      padding: 10px 14px; color: white; font-size: 13px;
      font-family: 'Space Grotesk', sans-serif;
      resize: none; max-height: 80px; min-height: 40px;
      line-height: 1.4; outline: none; transition: border-color 0.2s;
    }
    #ael-input:focus { border-color: rgba(255,255,255,0.15); }
    #ael-input::placeholder { color: rgba(255,255,255,0.2); }
    #ael-send {
      width: 40px; height: 40px; background: rgba(255,255,255,0.1);
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.2s; color: rgba(255,255,255,0.6);
    }
    #ael-send:hover { background: rgba(255,255,255,0.15); }
    #ael-send:disabled { opacity: 0.3; cursor: not-allowed; }
    #ael-send .material-symbols-outlined { font-size: 18px; }

    /* ─── PERIOD INFO ─── */
    #ael-period {
      padding: 8px 16px;
      display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap;
    }
    .ael-period-tag {
      display: flex; align-items: center; gap: 4px;
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px; padding: 4px 10px;
    }
    .ael-period-label { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em; font-family: 'Space Grotesk', sans-serif; }
    .ael-period-val { font-size: 14px; font-weight: 800; color: rgba(255,255,255,0.7); font-family: 'Space Grotesk', sans-serif; }
  `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════
  // HTML
  // ═══════════════════════════════════════════════════════════
  var ACTIONS = [
    { type: 'job',          icon: 'work',           label: 'İş / Kariyer',    sub: 'Teklif, mülakat, terfi' },
    { type: 'money',        icon: 'payments',       label: 'Finansal',        sub: 'Yatırım, alım, satım' },
    { type: 'relationship', icon: 'favorite',       label: 'İlişki',          sub: 'Tanışma, uzlaşma, ayrılık' },
    { type: 'start',        icon: 'rocket_launch',  label: 'Yeni Başlangıç',  sub: 'Girişim, proje, taşınma' },
    { type: 'signature',    icon: 'draw',           label: 'İmza / Sözleşme', sub: 'Bağlayıcı karar, anlaşma' }
  ];

  var wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="ael-orb"><div id="ael-orb-dot"></div></div>
    <div id="ael-tooltip">
      <div id="ael-tooltip-title">Decision Sphere</div>
      <div id="ael-tooltip-sub">Numerical decision analysis</div>
    </div>
    <div id="ael-overlay">
      <div id="ael-modal">
        <div id="ael-header">
          <div id="ael-header-icon"><div class="dot"></div></div>
          <div id="ael-header-info">
            <div id="ael-header-name">Decision Sphere</div>
            <div id="ael-header-status">Numerical decision analysis</div>
          </div>
          <button id="ael-close">&#10005;</button>
        </div>
        <div id="ael-period"></div>
        <div id="ael-actions">
          <div id="ael-actions-label">Ne hakkında karar veriyorsun?</div>
          <div id="ael-actions-grid">
            ${ACTIONS.map(function(a) {
              return '<button class="ael-action-btn" data-action="' + a.type + '">' +
                '<span class="material-symbols-outlined ael-action-icon">' + a.icon + '</span>' +
                '<div><div class="ael-action-label">' + a.label + '</div>' +
                '<div class="ael-action-sub">' + a.sub + '</div></div></button>';
            }).join('')}
          </div>
        </div>
        <div id="ael-result">
          <div id="ael-result-card">
            <div class="ael-score-row">
              <div>
                <div id="ael-score-label"></div>
                <span id="ael-risk-badge"></span>
              </div>
              <div id="ael-score-num"></div>
            </div>
            <div id="ael-score-bar"><div id="ael-score-fill"></div></div>
            <div id="ael-reason"></div>
            <div id="ael-directive"></div>
            <div id="ael-warning"></div>
            <div id="ael-rationale"></div>
          </div>
        </div>
        <div id="ael-chat"></div>
        <div id="ael-input-area">
          <textarea id="ael-input" placeholder="Bir karar türü sor veya açıklama iste..." rows="1"></textarea>
          <button id="ael-send"><span class="material-symbols-outlined">send</span></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════
  var chatMessages = [];
  var isLoading = false;
  var currentResult = null;
  var currentAction = null;
  var personalPeriod = { day: null, month: null, year: null };
  var mobileFirstTap = false;
  var mobileTimer = null;

  // ═══════════════════════════════════════════════════════════
  // KİŞİSEL DÖNEM HESABI
  // ═══════════════════════════════════════════════════════════
  function loadPeriod() {
    if (window.NumerologyContext) {
      var data = null;
      try { data = JSON.parse(localStorage.getItem('numerael_user_data')); } catch(e) {}
      if (data && data.birthDate) {
        personalPeriod.year = window.NumerologyContext.calcPersonalYear(data.birthDate);
        personalPeriod.month = window.NumerologyContext.calcPersonalMonth(data.birthDate);
        personalPeriod.day = window.NumerologyContext.calcPersonalDay(data.birthDate);
      }
    }
    renderPeriodTags();
  }

  function renderPeriodTags() {
    var el = document.getElementById('ael-period');
    if (!el) return;
    if (!personalPeriod.day) {
      el.innerHTML = '<div style="padding:4px 0;font-size:11px;color:rgba(255,255,255,0.2);font-family:Space Grotesk,sans-serif;">Doğum tarihi tanımlı değil</div>';
      return;
    }
    var tags = [
      { l: 'Yıl', v: personalPeriod.year },
      { l: 'Ay', v: personalPeriod.month },
      { l: 'Gün', v: personalPeriod.day }
    ];
    el.innerHTML = tags.map(function(t) {
      return '<div class="ael-period-tag">' +
        '<span class="ael-period-label">' + t.l + '</span>' +
        '<span class="ael-period-val">' + t.v + '</span></div>';
    }).join('');
  }

  // ═══════════════════════════════════════════════════════════
  // ORB DAVRANIŞI
  // ═══════════════════════════════════════════════════════════
  var orb = document.getElementById('ael-orb');
  var tooltip = document.getElementById('ael-tooltip');

  // Desktop: hover tooltip
  orb.addEventListener('mouseenter', function() {
    if ('ontouchstart' in window) return;
    tooltip.classList.add('show');
  });
  orb.addEventListener('mouseleave', function() {
    tooltip.classList.remove('show');
  });

  // Click / Tap
  orb.addEventListener('click', function(e) {
    e.preventDefault();
    // Mobile: first tap shows tooltip, second tap opens
    if ('ontouchstart' in window) {
      if (!mobileFirstTap) {
        mobileFirstTap = true;
        tooltip.classList.add('show');
        clearTimeout(mobileTimer);
        mobileTimer = setTimeout(function() {
          tooltip.classList.remove('show');
          mobileFirstTap = false;
        }, 1200);
        return;
      }
      tooltip.classList.remove('show');
      mobileFirstTap = false;
      clearTimeout(mobileTimer);
    }
    aelOpen();
  });

  // ═══════════════════════════════════════════════════════════
  // MODAL AÇ / KAPAT
  // ═══════════════════════════════════════════════════════════
  window.aelOpen = function() {
    loadPeriod();
    var overlay = document.getElementById('ael-overlay');
    var modal = document.getElementById('ael-modal');
    overlay.style.display = 'flex';
    setTimeout(function() { modal.style.transform = 'translateY(0)'; }, 10);

    // Focus input on open — no greeting text
    setTimeout(function() { document.getElementById('ael-input').focus(); }, 400);
  };

  window.aelClose = function() {
    var modal = document.getElementById('ael-modal');
    modal.style.transform = 'translateY(100%)';
    setTimeout(function() {
      document.getElementById('ael-overlay').style.display = 'none';
    }, 350);
  };

  document.getElementById('ael-close').addEventListener('click', aelClose);
  document.getElementById('ael-overlay').addEventListener('click', function(e) {
    if (e.target === this) aelClose();
  });

  // ═══════════════════════════════════════════════════════════
  // AKSİYON SEÇİMİ → ENGINE ÇAĞRISI
  // ═══════════════════════════════════════════════════════════
  var actionBtns = document.querySelectorAll('.ael-action-btn');
  actionBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var action = this.dataset.action;
      if (!personalPeriod.day) {
        addAelMessage('Doğum tarihi tanımlı değil. Sayısal analiz için doğum tarihi gerekli.');
        return;
      }
      if (!window.DecisionTiming) {
        addAelMessage('Zamanlama motoru yüklenemedi.');
        return;
      }

      // Seçili stili
      actionBtns.forEach(function(b) { b.classList.remove('selected'); });
      this.classList.add('selected');

      // Engine çağrısı (deterministik)
      currentAction = action;
      currentResult = window.DecisionTiming.decide({
        action_type: action,
        personal_day: personalPeriod.day,
        personal_month: personalPeriod.month,
        personal_year: personalPeriod.year
      });

      renderResult(currentResult);

      // Orb'a sonuç işareti
      document.getElementById('ael-orb').classList.add('has-result');

      // Chat'e özet mesaj ekle
      var label = window.DecisionTiming.ACTION_LABELS[action] || action;
      addAelMessage(
        label.charAt(0).toUpperCase() + label.slice(1) + ': ' + currentResult.score + '/100\n' +
        'Risk: ' + currentResult.risk_level + '\n' +
        '→ ' + currentResult.action_directive
      );
    });
  });

  // ═══════════════════════════════════════════════════════════
  // SONUÇ RENDER
  // ═══════════════════════════════════════════════════════════
  function renderResult(r) {
    var resultEl = document.getElementById('ael-result');
    resultEl.style.display = 'block';

    // Renk belirleme
    var color, bgColor;
    if (r.score >= 80) { color = '#4ade80'; bgColor = 'rgba(74,222,128,0.06)'; }
    else if (r.score >= 60) { color = '#60a5fa'; bgColor = 'rgba(96,165,250,0.06)'; }
    else if (r.score >= 40) { color = 'rgba(255,255,255,0.5)'; bgColor = 'rgba(255,255,255,0.02)'; }
    else { color = '#f87171'; bgColor = 'rgba(248,113,113,0.06)'; }

    document.getElementById('ael-result-card').style.background = bgColor;
    document.getElementById('ael-result-card').style.borderColor = color.replace(')', ',0.2)').replace('rgba', 'rgba').replace('rgb', 'rgba');

    document.getElementById('ael-score-label').textContent = r.label;
    document.getElementById('ael-score-label').style.color = color;
    document.getElementById('ael-score-num').textContent = r.score;
    document.getElementById('ael-score-num').style.color = color;

    document.getElementById('ael-score-fill').style.width = r.score + '%';
    document.getElementById('ael-score-fill').style.background = color;

    document.getElementById('ael-reason').textContent = r.main_reason;

    // Risk badge
    var badge = document.getElementById('ael-risk-badge');
    badge.textContent = 'Risk: ' + r.risk_level;
    if (r.risk_level === 'yüksek') { badge.style.background = 'rgba(239,68,68,0.12)'; badge.style.color = '#f87171'; }
    else if (r.risk_level === 'orta') { badge.style.background = 'rgba(255,255,255,0.06)'; badge.style.color = 'rgba(255,255,255,0.5)'; }
    else { badge.style.background = 'rgba(74,222,128,0.1)'; badge.style.color = '#4ade80'; }

    // Aksiyon direktifi
    var dirEl = document.getElementById('ael-directive');
    dirEl.textContent = r.action_directive;
    if (r.score < 45) {
      dirEl.style.background = 'rgba(239,68,68,0.1)';
      dirEl.style.color = '#f87171';
    } else if (r.score <= 65) {
      dirEl.style.background = 'rgba(251,191,36,0.1)';
      dirEl.style.color = '#fbbf24';
    } else {
      dirEl.style.background = 'rgba(74,222,128,0.1)';
      dirEl.style.color = '#4ade80';
    }

    // Uyarı
    var warnEl = document.getElementById('ael-warning');
    if (r.warning) {
      warnEl.textContent = r.warning;
      warnEl.style.display = 'block';
    } else {
      warnEl.style.display = 'none';
    }

    // Decision Rationale
    var ratEl = document.getElementById('ael-rationale');
    if (r.decision_rationale) {
      ratEl.textContent = r.decision_rationale;
      ratEl.style.display = 'block';
    } else {
      ratEl.style.display = 'none';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // CHAT — AEL SADECE AÇIKLAR, KARAR ALMAZ
  // ═══════════════════════════════════════════════════════════
  function addAelMessage(text) {
    var chat = document.getElementById('ael-chat');
    var div = document.createElement('div');
    div.className = 'ael-msg ael-msg-ael';
    div.innerHTML = '<div class="ael-msg-avatar"><div class="dot"></div></div>' +
      '<div class="ael-msg-bubble">' + text.replace(/\n/g, '<br>') + '</div>';
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    chatMessages.push({ role: 'assistant', content: text });
  }

  function addUserMessage(text) {
    var chat = document.getElementById('ael-chat');
    var div = document.createElement('div');
    div.className = 'ael-msg ael-msg-user';
    div.innerHTML = '<div class="ael-msg-bubble">' + text + '</div>';
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    chatMessages.push({ role: 'user', content: text });
  }

  function showTyping() {
    var chat = document.getElementById('ael-chat');
    var div = document.createElement('div');
    div.className = 'ael-msg ael-msg-ael';
    div.id = 'ael-typing';
    div.innerHTML = '<div class="ael-msg-avatar"><div class="dot"></div></div>' +
      '<div class="ael-typing"><div class="ael-typing-dot"></div><div class="ael-typing-dot"></div><div class="ael-typing-dot"></div></div>';
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById('ael-typing');
    if (t) t.remove();
  }

  // Decision Sphere system prompt — EXPLAINS decisions, does NOT make them
  function buildAelSystem() {
    var sys = 'Sen Decision Sphere, bir sayısal karar zamanlama açıklama sistemisin. ' +
      'Kararları SEN ALMIYORSUN. Kararlar deterministik bir motor tarafından alınıyor. ' +
      'Senin görevin motorun çıktısını kullanıcıya AÇIKLAMAK.\n\n' +
      'KURALLAR:\n' +
      '- Skoru, etiketi veya riski DEĞİŞTİREMEZSİN.\n' +
      '- "Evren", "ruhsal", "kozmik", "kader", "manifestasyon", "enerji" (metafiziksel) gibi ifadeler YASAK.\n' +
      '- Bunların yerine "sayısal etki", "olasılık eğilimi", "karar zamanlaması", "analitik eğilim" kullan.\n' +
      '- Açıklamaları SAYISAL nedenlere dayandır (ör: "Kişisel Gün 8 olduğu için...").\n' +
      '- Türkçe yaz.\n' +
      '- Motivasyonel dil KULLANMA. Sadece analitik açıklama yap.\n' +
      '- Metafor, spiritüel çerçeveleme, gelecek vaadi YASAK.\n' +
      '- Zamanlama mantığı dışında tavsiye verme.\n' +
      '- Kullanıcı soru sorarsa Decision Rationale bölümünü referans alarak açıkla.\n' +
      '- Kullanıcı farklı bir karar türü sorarsa, mevcut sonucu referans al ama yeni motor çağrısı yapmadığını belirt.\n' +
      '- Asla kehanet, astroloji, tarot dili veya spiritüel çerçeveleme kullanma.\n';

    if (currentResult && currentAction) {
      sys += '\nMEVCUT MOTOR ÇIKTISI:\n' +
        '- Aksiyon: ' + currentAction + '\n' +
        '- Skor: ' + currentResult.score + '/100\n' +
        '- Etiket: ' + currentResult.label + '\n' +
        '- Risk: ' + currentResult.risk_level + '\n' +
        '- Direktif: ' + currentResult.action_directive + '\n' +
        '- Sebep: ' + currentResult.main_reason + '\n' +
        (currentResult.warning ? '- Uyarı: ' + currentResult.warning + '\n' : '') +
        '- Decision Rationale: ' + currentResult.decision_rationale + '\n' +
        '- Kişisel Gün: ' + personalPeriod.day + '\n' +
        '- Kişisel Ay: ' + personalPeriod.month + '\n' +
        '- Kişisel Yıl: ' + personalPeriod.year + '\n';
    } else {
      sys += '\nHenüz bir motor çıktısı yok. Kullanıcıdan önce bir karar alanı seçmesini iste.\n';
    }

    return sys;
  }

  // ═══════════════════════════════════════════════════════════
  // NATURAL LANGUAGE → ACTION TYPE INFERENCE
  // ═══════════════════════════════════════════════════════════
  var ACTION_KEYWORDS = {
    job:          ['iş', 'kariyer', 'mülakat', 'terfi', 'teklif', 'çalış', 'pozisyon', 'başvur'],
    money:        ['para', 'finans', 'yatırım', 'alım', 'satım', 'borsa', 'kredi', 'maaş'],
    relationship: ['ilişki', 'sevgili', 'evlilik', 'ayrılık', 'uzlaş', 'konuşma', 'partner', 'tanış'],
    start:        ['başla', 'girişim', 'proje', 'taşın', 'aç', 'kur', 'yeni'],
    signature:    ['imza', 'sözleşme', 'anlaşma', 'kontrat', 'bağlayıcı', 'noter']
  };

  function inferActionType(text) {
    var lower = text.toLowerCase();
    var scores = {};
    for (var action in ACTION_KEYWORDS) {
      scores[action] = 0;
      ACTION_KEYWORDS[action].forEach(function(kw) {
        if (lower.indexOf(kw) !== -1) scores[action]++;
      });
    }
    var best = null, bestScore = 0;
    for (var a in scores) {
      if (scores[a] > bestScore) { best = a; bestScore = scores[a]; }
    }
    return bestScore > 0 ? best : null;
  }

  async function sendAelMessage() {
    if (isLoading) return;
    var input = document.getElementById('ael-input');
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    document.getElementById('ael-send').disabled = true;
    isLoading = true;

    addUserMessage(text);

    // Auto-detect action type from natural language query
    var inferred = inferActionType(text);
    if (inferred && personalPeriod.day && window.DecisionTiming && !currentResult) {
      // Auto-trigger decision timing for inferred action
      currentAction = inferred;
      currentResult = window.DecisionTiming.decide({
        action_type: inferred,
        personal_day: personalPeriod.day,
        personal_month: personalPeriod.month,
        personal_year: personalPeriod.year
      });
      renderResult(currentResult);
      document.getElementById('ael-orb').classList.add('has-result');

      // Highlight matching action button
      actionBtns.forEach(function(b) {
        b.classList.toggle('selected', b.dataset.action === inferred);
      });
    }

    showTyping();

    try {
      var apiMessages = [{ role: 'system', content: buildAelSystem() }];
      // Son 6 mesajı gönder
      chatMessages.slice(-6).forEach(function(m) {
        apiMessages.push({ role: m.role, content: m.content });
      });

      var response = await fetch(API_BASE + '/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: apiMessages,
          max_tokens: 300,
          temperature: 0.5
        })
      });
      var data = await response.json();
      hideTyping();

      if (data.choices && data.choices[0]) {
        addAelMessage(data.choices[0].message.content);
      } else {
        addAelMessage('Yanıt alınamadı. Tekrar dene.');
      }
    } catch(e) {
      hideTyping();
      addAelMessage('Bağlantı hatası. Tekrar dene.');
    }

    isLoading = false;
    document.getElementById('ael-send').disabled = false;
    input.focus();
  }

  // ═══════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════
  document.getElementById('ael-send').addEventListener('click', sendAelMessage);

  document.getElementById('ael-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAelMessage();
    }
  });

  document.getElementById('ael-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

})();
