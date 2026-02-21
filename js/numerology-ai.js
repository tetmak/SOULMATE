/**
 * KADER — Numeroloji Üstadı AI Widget
 * Tüm sayfalara eklenir, Anthropic API ile çalışır
 */
(function() {
  'use strict';

  // Native app (Capacitor) ise Vercel production URL'sini kullan
  var _isNative = window.location.protocol === 'capacitor:' ||
                  window.location.protocol === 'ionic:' ||
                  window.location.hostname === 'localhost' ||
                  window.location.protocol === 'file:' ||
                  (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  var API_BASE = _isNative ? 'https://soulmate-kohl.vercel.app' : '';

  // ─── Sayfa context'ini otomatik algıla ───────────────────────────
  function getPageContext() {
    var path = window.location.pathname.split('/').pop() || '';
    var map = {
      'mystic_numerology_home': 'Ana numeroloji sayfası - kullanıcı günlük enerjisine bakıyor',
      'daily_spiritual_guide': 'Günlük rehberlik sayfası - günün enerjisi, affirmasyonlar, ritüeller',
      'lunar_phase_energy_tracker': 'Ay evresi takip sayfası - kullanıcı ay enerjisini inceliyor',
      'cosmic_energy_calendar': 'Kozmik enerji takvimi - ay ve yıl boyunca enerji akışları',
      'relationship_compatibility': 'Ruh eşi uyumluluk analizi - iki kişi arasındaki numerolojik bağ',
      'name_numerology_breakdown': 'İsim numerolojisi - harflerin titreşimi ve yaşam yolu analizi',
      'cosmic_manifest_portal': 'Kozmik niyet portalı - evrene niyet gönderme',
      'wheel_of_destiny': 'Kader Çarkı - günlük kozmik mesaj çekme',
      'profile_soul_journey': 'Ruh yolculuğu profili - kişisel numeroloji haritası',
      'past_reading_archive': 'Geçmiş okumalar arşivi - önceki analizler',
      'premium_crystal_store': 'Kristal mağazası - şifalı taşlar ve enerji araçları',
    };
    for (var key in map) {
      if (path.includes(key)) return map[key];
    }
    return 'Kader numeroloji uygulaması';
  }

  // ─── HTML & CSS Inject ───────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    #ustad-btn {
      position: fixed;
      bottom: 88px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: radial-gradient(135deg, #cfa117 0%, #f7e4a1 50%, #b8860b 100%);
      box-shadow: 0 0 0 0 rgba(207,161,23,0.7);
      border: none;
      cursor: pointer;
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: ustad-pulse 2.5s ease-in-out infinite;
      transition: transform 0.2s;
    }
    #ustad-btn:hover { transform: scale(1.1); }
    #ustad-btn:active { transform: scale(0.95); }
    #ustad-btn .ustad-icon { font-size: 26px; line-height: 1; pointer-events: none; }
    @keyframes ustad-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(207,161,23,0.6); }
      70%  { box-shadow: 0 0 0 14px rgba(207,161,23,0); }
      100% { box-shadow: 0 0 0 0 rgba(207,161,23,0); }
    }

    #ustad-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 400;
      align-items: flex-end;
      justify-content: center;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(6px);
    }
    #ustad-modal {
      width: 100%;
      max-width: 480px;
      height: 80vh;
      background: linear-gradient(180deg, #0d0a1a 0%, #0a0710 100%);
      border-radius: 28px 28px 0 0;
      border-top: 1px solid rgba(207,161,23,0.3);
      display: flex;
      flex-direction: column;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.34,1.1,0.64,1);
      overflow: hidden;
    }
    #ustad-header {
      padding: 16px 20px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .ustad-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: radial-gradient(135deg, #1a0e3a, #2d1660);
      border: 2px solid rgba(207,161,23,0.5);
      box-shadow: 0 0 16px rgba(207,161,23,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .ustad-info { flex: 1; }
    .ustad-name {
      font-size: 15px;
      font-weight: 800;
      background: linear-gradient(135deg, #cfa117, #f7e4a1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-family: Manrope, sans-serif;
    }
    .ustad-status {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      font-family: Manrope, sans-serif;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ustad-dot {
      width: 6px; height: 6px;
      background: #4ade80;
      border-radius: 50%;
      box-shadow: 0 0 6px #4ade80;
    }
    #ustad-close {
      width: 32px; height: 32px;
      background: rgba(255,255,255,0.07);
      border: none; border-radius: 50%;
      color: rgba(255,255,255,0.5);
      cursor: pointer; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    #ustad-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
    }
    #ustad-messages::-webkit-scrollbar { width: 4px; }
    #ustad-messages::-webkit-scrollbar-track { background: transparent; }
    #ustad-messages::-webkit-scrollbar-thumb { background: rgba(207,161,23,0.3); border-radius: 2px; }

    .msg-ustad, .msg-user {
      display: flex;
      gap: 8px;
      max-width: 90%;
      animation: msg-in 0.3s ease;
    }
    .msg-user { align-self: flex-end; flex-direction: row-reverse; }
    .msg-ustad { align-self: flex-start; }
    @keyframes msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .msg-bubble {
      padding: 10px 14px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.55;
      font-family: Manrope, sans-serif;
    }
    .msg-ustad .msg-bubble {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(207,161,23,0.15);
      color: rgba(255,255,255,0.9);
      border-bottom-left-radius: 4px;
    }
    .msg-user .msg-bubble {
      background: linear-gradient(135deg, #cfa117, #b8860b);
      color: #0a0710;
      font-weight: 600;
      border-bottom-right-radius: 4px;
    }
    .msg-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: radial-gradient(135deg, #1a0e3a, #2d1660);
      border: 1px solid rgba(207,161,23,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0; margin-top: 2px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(207,161,23,0.15);
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .typing-dot {
      width: 6px; height: 6px;
      background: rgba(207,161,23,0.7);
      border-radius: 50%;
      animation: typing 1.2s ease-in-out infinite;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    .quick-questions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0 16px 12px;
      flex-shrink: 0;
    }
    .quick-q {
      padding: 7px 14px;
      background: rgba(207,161,23,0.08);
      border: 1px solid rgba(207,161,23,0.25);
      border-radius: 20px;
      font-size: 12px;
      color: rgba(207,161,23,0.9);
      cursor: pointer;
      font-family: Manrope, sans-serif;
      font-weight: 600;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .quick-q:hover { background: rgba(207,161,23,0.18); }

    #ustad-input-area {
      padding: 12px 16px 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      gap: 10px;
      align-items: flex-end;
      flex-shrink: 0;
    }
    #ustad-input {
      flex: 1;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 22px;
      padding: 11px 16px;
      color: white;
      font-size: 14px;
      font-family: Manrope, sans-serif;
      resize: none;
      max-height: 100px;
      min-height: 44px;
      line-height: 1.4;
      outline: none;
      transition: border-color 0.2s;
    }
    #ustad-input:focus { border-color: rgba(207,161,23,0.4); }
    #ustad-input::placeholder { color: rgba(255,255,255,0.25); }
    #ustad-send {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, #cfa117, #b8860b);
      border: none; border-radius: 50%;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;
    }
    #ustad-send:hover { transform: scale(1.05); box-shadow: 0 0 16px rgba(207,161,23,0.4); }
    #ustad-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #ustad-send svg { width: 18px; height: 18px; pointer-events: none; }
  `;
  document.head.appendChild(style);

  // ─── HTML ────────────────────────────────────────────────────────
  var html = `
  <button id="ustad-btn" title="Numeroloji Üstadına Sor">
    <span class="ustad-icon">🔮</span>
  </button>

  <div id="ustad-overlay" onclick="if(event.target===this)ustadClose()">
    <div id="ustad-modal">
      <div id="ustad-header">
        <div class="ustad-avatar">🌙</div>
        <div class="ustad-info">
          <div class="ustad-name">Numeroloji Üstadı</div>
          <div class="ustad-status">
            <div class="ustad-dot"></div>
            Kozmik rehberiniz hazır
          </div>
        </div>
        <button id="ustad-close" onclick="ustadClose()">✕</button>
      </div>

      <div id="ustad-messages"></div>

      <div class="quick-questions" id="ustad-quick"></div>

      <div id="ustad-input-area">
        <textarea id="ustad-input" placeholder="Üstada sor..." rows="1"></textarea>
        <button id="ustad-send" onclick="ustadSend()">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0a0710" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
  `;

  var wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // ─── State ───────────────────────────────────────────────────────
  var messages = [];
  var isLoading = false;
  var pageContext = getPageContext();

  var QUICK_QUESTIONS = [
    'Yaşam yolum ne anlama gelir?',
    'Bugünün enerjisi nasıl?',
    'Ay evresi beni nasıl etkiler?',
    'İsmimin titreşimi nedir?',
    'Ruh eşim kim olabilir?',
    'Bu hafta şansım nasıl?',
  ];

  // ─── Render Quick Questions ──────────────────────────────────────
  var quickEl = document.getElementById('ustad-quick');
  QUICK_QUESTIONS.slice(0, 4).forEach(function(q) {
    var btn = document.createElement('button');
    btn.className = 'quick-q';
    btn.textContent = q;
    btn.onclick = function() {
      document.getElementById('ustad-input').value = q;
      quickEl.style.display = 'none';
      ustadSend();
    };
    quickEl.appendChild(btn);
  });

  // ─── Açılış mesajı ──────────────────────────────────────────────
  function showWelcome() {
    var msgs = document.getElementById('ustad-messages');
    if (msgs.children.length > 0) return;
    addMessage('ustad', 'Merhaba, değerli ruh... 🌟 Ben Numeroloji Üstadı\'yım. Sayıların gizli dili, ay\'ın titreşimleri ve kader haritanla ilgili her sorunuz için buradayım. Ne öğrenmek istersin?');
  }

  // ─── Mesaj ekle ─────────────────────────────────────────────────
  function addMessage(from, text) {
    var msgs = document.getElementById('ustad-messages');
    var div = document.createElement('div');
    div.className = 'msg-' + from;

    if (from === 'ustad') {
      div.innerHTML = `
        <div class="msg-avatar">🌙</div>
        <div class="msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    } else {
      div.innerHTML = `<div class="msg-bubble">${text}</div>`;
    }

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    messages.push({ role: from === 'ustad' ? 'assistant' : 'user', content: text });
  }

  // ─── Typing indicator ────────────────────────────────────────────
  function showTyping() {
    var msgs = document.getElementById('ustad-messages');
    var div = document.createElement('div');
    div.className = 'msg-ustad';
    div.id = 'ustad-typing';
    div.innerHTML = `
      <div class="msg-avatar">🌙</div>
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    var t = document.getElementById('ustad-typing');
    if (t) t.remove();
  }

  // ─── API çağrısı ─────────────────────────────────────────────────
  async function callClaude(userMessage) {
    var systemPrompt = `Sen KADERin Numeroloji Üstadısın. Sayıların kozmik dili, ay evreleri, yaşam yolu sayıları, isim titreşimleri, ruh eşi uyumluluğu ve kader haritaları konularında derin bilgeliğe sahipsin.

Kişiliğin:
- Mistik, bilge ve ağzı laf yapan birisin
- Türkçe konuşuyorsun, zengin ve etkileyici bir dil kullanıyorsun
- "Değerli ruh", "sevgili yolcu", "kıymetli" gibi hitaplar kullanıyorsun
- Cevaplarını sayılar, semboller (🌙✨⭐🔮💫🌟) ve metaforlarla süslüyorsun
- Kesin ve güvenli konuşuyorsun, asla "bilmiyorum" demiyorsun
- Kısa ama çarpıcı yanıtlar veriyorsun (3-6 cümle)
- Her cevabın sonunda kullanıcıyı meraklandıran bir soru veya ipucu bırakıyorsun

Şu an bulunduğun sayfa: ${pageContext}

ÖNEMLİ: Asla "yapay zeka" veya "AI" olduğunu söyleme. Sen gerçek bir numeroloji üstadısın.`;

    var apiMessages = messages.slice(-8).map(function(m) {
      return { role: m.role, content: m.content };
    });
    apiMessages.push({ role: 'user', content: userMessage });

    // API key /api/openai proxy'si tarafından server-side ekleniyor

    var oaiMessages = [{ role: 'system', content: systemPrompt }];
    apiMessages.forEach(function(m) { oaiMessages.push(m); });

    var response = await fetch(API_BASE + '/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: oaiMessages,
        max_tokens: 800,
        temperature: 0.9,
      })
    });

    var data = await response.json();
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    throw new Error('API yanıt vermedi');
  }

  // ─── Gönder ──────────────────────────────────────────────────────
  window.ustadSend = async function() {
    if (isLoading) return;
    var input = document.getElementById('ustad-input');
    var text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    document.getElementById('ustad-quick').style.display = 'none';
    document.getElementById('ustad-send').disabled = true;
    isLoading = true;

    addMessage('user', text);
    showTyping();

    try {
      var reply = await callClaude(text);
      hideTyping();
      addMessage('ustad', reply);
    } catch(e) {
      hideTyping();
      addMessage('ustad', 'Kozmik bağlantıda bir dalgalanma var... Biraz sonra tekrar dener misin? 🌙');
    }

    isLoading = false;
    document.getElementById('ustad-send').disabled = false;
    input.focus();
  };

  // ─── Aç / Kapat ──────────────────────────────────────────────────
  window.ustadOpen = function() {
    var overlay = document.getElementById('ustad-overlay');
    var modal = document.getElementById('ustad-modal');
    overlay.style.display = 'flex';
    setTimeout(function() { modal.style.transform = 'translateY(0)'; }, 10);
    showWelcome();
    setTimeout(function() { document.getElementById('ustad-input').focus(); }, 450);
  };

  window.ustadClose = function() {
    var modal = document.getElementById('ustad-modal');
    modal.style.transform = 'translateY(100%)';
    setTimeout(function() {
      document.getElementById('ustad-overlay').style.display = 'none';
    }, 400);
  };

  document.getElementById('ustad-btn').addEventListener('click', ustadOpen);

  // Enter ile gönder (Shift+Enter = yeni satır)
  document.getElementById('ustad-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ustadSend();
    }
  });

  // Auto-resize textarea
  document.getElementById('ustad-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

})();
