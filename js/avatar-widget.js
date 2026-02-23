/**
 * NUMERAEL — Avatar Widget
 * Floating circular avatar that expands when speaking, contracts when idle.
 * Positioned to not conflict with Decision Sphere orb or bottom nav.
 *
 * Exports: window.AvatarWidget
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // EXCLUDED PAGES (auth, splash, onboarding)
  // ═══════════════════════════════════════════════════════════
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var EXCLUDED = [
    'mystic_splash_screen.html',
    'branded_celestial_splash_screen.html',
    'cosmic_onboarding_welcome.html',
    'mystic_sign_up_screen.html',
    'cosmic_calculation_loading.html',
    'soul_mate_loading.html',
    'data-ready_birth_form.html',
    'index.html'
  ];
  if (EXCLUDED.indexOf(currentPage) !== -1) return;

  // ═══════════════════════════════════════════════════════════
  // CSS
  // ═══════════════════════════════════════════════════════════
  var style = document.createElement('style');
  style.textContent = [
    '/* ─── AVATAR WIDGET ─── */',
    '#avatar-widget {',
    '  position: fixed;',
    '  bottom: 148px;',
    '  right: 18px;',
    '  z-index: 490;',
    '  transition: all 0.4s cubic-bezier(0.34, 1.1, 0.64, 1);',
    '  -webkit-tap-highlight-color: transparent;',
    '  pointer-events: auto;',
    '}',
    '#avatar-widget.minimized {',
    '  width: 52px;',
    '  height: 52px;',
    '  cursor: pointer;',
    '}',
    '#avatar-widget.expanded {',
    '  width: 180px;',
    '  height: 220px;',
    '  right: 12px;',
    '  bottom: 140px;',
    '}',
    '',
    '/* ─── AVATAR CONTAINER (circular when minimized) ─── */',
    '#avatar-face-container {',
    '  width: 52px;',
    '  height: 52px;',
    '  border-radius: 50%;',
    '  overflow: hidden;',
    '  background: radial-gradient(circle at 35% 35%, #1a1a2e, #0a0a1a);',
    '  border: 2px solid rgba(250, 198, 56, 0.3);',
    '  box-shadow: 0 2px 16px rgba(0,0,0,0.5), 0 0 20px rgba(250, 198, 56, 0.08);',
    '  transition: all 0.4s cubic-bezier(0.34, 1.1, 0.64, 1);',
    '  position: relative;',
    '}',
    '#avatar-widget.expanded #avatar-face-container {',
    '  width: 120px;',
    '  height: 120px;',
    '  border-radius: 50%;',
    '  border-color: rgba(250, 198, 56, 0.5);',
    '  box-shadow: 0 4px 24px rgba(0,0,0,0.6), 0 0 30px rgba(250, 198, 56, 0.15);',
    '  margin: 0 auto;',
    '}',
    '',
    '/* ─── PULSE RING (idle) ─── */',
    '#avatar-pulse-ring {',
    '  position: absolute;',
    '  inset: -4px;',
    '  border-radius: 50%;',
    '  border: 1px solid rgba(250, 198, 56, 0.2);',
    '  animation: avatar-pulse 3s ease-in-out infinite;',
    '  pointer-events: none;',
    '}',
    '@keyframes avatar-pulse {',
    '  0%, 100% { transform: scale(1); opacity: 0.5; }',
    '  50% { transform: scale(1.08); opacity: 0.2; }',
    '}',
    '#avatar-widget.expanded #avatar-pulse-ring { display: none; }',
    '#avatar-widget.speaking #avatar-pulse-ring {',
    '  animation: avatar-speak-pulse 0.8s ease-in-out infinite;',
    '  border-color: rgba(250, 198, 56, 0.4);',
    '}',
    '@keyframes avatar-speak-pulse {',
    '  0%, 100% { transform: scale(1); opacity: 0.6; }',
    '  50% { transform: scale(1.12); opacity: 0.3; }',
    '}',
    '',
    '/* ─── SUBTITLE BAR ─── */',
    '#avatar-subtitle-bar {',
    '  display: none;',
    '  margin-top: 8px;',
    '  padding: 8px 12px;',
    '  background: rgba(14, 14, 14, 0.95);',
    '  border: 1px solid rgba(255,255,255,0.08);',
    '  border-radius: 12px;',
    '  backdrop-filter: blur(10px);',
    '  max-width: 220px;',
    '  max-height: 80px;',
    '  overflow-y: auto;',
    '  position: absolute;',
    '  right: 0;',
    '  bottom: calc(100% + 8px);',
    '  text-align: right;',
    '}',
    '#avatar-widget.expanded #avatar-subtitle-bar {',
    '  position: relative;',
    '  bottom: auto;',
    '  right: auto;',
    '  text-align: center;',
    '  margin-top: 10px;',
    '  max-width: 180px;',
    '}',
    '#avatar-subtitle-bar.visible { display: block; }',
    '#avatar-subtitle-text {',
    '  font-size: 11px;',
    '  line-height: 1.4;',
    '  color: rgba(255,255,255,0.75);',
    '  font-family: "Montserrat", sans-serif;',
    '}',
    '#avatar-subtitle-text .spoken-word {',
    '  color: rgba(250, 198, 56, 0.9);',
    '  font-weight: 600;',
    '}',
    '',
    '/* ─── MUTE BUTTON ─── */',
    '#avatar-mute-btn {',
    '  display: none;',
    '  position: absolute;',
    '  top: -4px;',
    '  left: -4px;',
    '  width: 24px;',
    '  height: 24px;',
    '  border-radius: 50%;',
    '  background: rgba(14, 14, 14, 0.9);',
    '  border: 1px solid rgba(255,255,255,0.15);',
    '  color: rgba(255,255,255,0.6);',
    '  font-size: 12px;',
    '  cursor: pointer;',
    '  align-items: center;',
    '  justify-content: center;',
    '  z-index: 2;',
    '  padding: 0;',
    '  line-height: 1;',
    '}',
    '#avatar-widget.speaking #avatar-mute-btn { display: flex; }',
    '#avatar-widget.expanded #avatar-mute-btn {',
    '  top: 0;',
    '  left: calc(50% - 60px - 4px);',
    '}',
    '',
    '/* ─── FADE TRANSITIONS ─── */',
    '#avatar-widget { opacity: 0; animation: avatar-fade-in 0.6s ease 0.5s forwards; }',
    '@keyframes avatar-fade-in {',
    '  from { opacity: 0; transform: translateY(10px); }',
    '  to { opacity: 1; transform: translateY(0); }',
    '}',
    '',
    '/* Scrollbar for subtitle */',
    '#avatar-subtitle-bar::-webkit-scrollbar { width: 2px; }',
    '#avatar-subtitle-bar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }'
  ].join('\n');
  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════
  // DOM CREATION
  // ═══════════════════════════════════════════════════════════
  var widget = null;
  var faceContainer = null;
  var subtitleBar = null;
  var subtitleText = null;
  var muteBtn = null;
  var isExpanded = false;
  var isMuted = false;
  var collapseTimer = null;

  function createDOM() {
    // Main widget container
    widget = document.createElement('div');
    widget.id = 'avatar-widget';
    widget.className = 'minimized';

    // Face container (Canvas goes here)
    var faceWrap = document.createElement('div');
    faceWrap.style.position = 'relative';
    faceWrap.style.display = 'inline-block';

    faceContainer = document.createElement('div');
    faceContainer.id = 'avatar-face-container';

    // Pulse ring
    var pulseRing = document.createElement('div');
    pulseRing.id = 'avatar-pulse-ring';
    faceContainer.appendChild(pulseRing);

    // Mute button
    muteBtn = document.createElement('button');
    muteBtn.id = 'avatar-mute-btn';
    muteBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">volume_up</span>';
    muteBtn.onclick = function(e) {
      e.stopPropagation();
      toggleMute();
    };
    faceWrap.appendChild(muteBtn);

    faceWrap.appendChild(faceContainer);
    widget.appendChild(faceWrap);

    // Subtitle bar
    subtitleBar = document.createElement('div');
    subtitleBar.id = 'avatar-subtitle-bar';
    subtitleText = document.createElement('div');
    subtitleText.id = 'avatar-subtitle-text';
    subtitleBar.appendChild(subtitleText);
    widget.appendChild(subtitleBar);

    // Click handler — minimize on tap when expanded
    widget.addEventListener('click', function() {
      if (isExpanded) {
        collapse();
      }
    });

    document.body.appendChild(widget);
  }

  // ═══════════════════════════════════════════════════════════
  // EXPAND / COLLAPSE
  // ═══════════════════════════════════════════════════════════

  function expand() {
    if (isExpanded) return;
    isExpanded = true;
    if (collapseTimer) {
      clearTimeout(collapseTimer);
      collapseTimer = null;
    }
    widget.classList.remove('minimized');
    widget.classList.add('expanded');
  }

  function collapse() {
    if (!isExpanded) return;
    isExpanded = false;
    widget.classList.remove('expanded');
    widget.classList.add('minimized');
    hideSubtitle();
  }

  function scheduleCollapse(delay) {
    if (collapseTimer) clearTimeout(collapseTimer);
    collapseTimer = setTimeout(function() {
      collapse();
    }, delay || 2000);
  }

  // ═══════════════════════════════════════════════════════════
  // SPEAKING STATE
  // ═══════════════════════════════════════════════════════════

  function onSpeechStart() {
    widget.classList.add('speaking');
    expand();
  }

  function onSpeechEnd() {
    widget.classList.remove('speaking');
    scheduleCollapse(3000);
  }

  // ═══════════════════════════════════════════════════════════
  // SUBTITLE
  // ═══════════════════════════════════════════════════════════

  function showSubtitle(text, highlightIndex) {
    if (!subtitleBar || !subtitleText) return;
    subtitleBar.classList.add('visible');

    var words = text.split(/\s+/);
    var html = '';
    for (var i = 0; i < words.length; i++) {
      if (i === highlightIndex) {
        html += '<span class="spoken-word">' + escapeHtml(words[i]) + '</span> ';
      } else {
        html += escapeHtml(words[i]) + ' ';
      }
    }
    subtitleText.innerHTML = html;

    // Auto-scroll
    subtitleBar.scrollTop = subtitleBar.scrollHeight;
  }

  function hideSubtitle() {
    if (subtitleBar) {
      subtitleBar.classList.remove('visible');
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════════
  // MUTE
  // ═══════════════════════════════════════════════════════════

  function toggleMute() {
    isMuted = !isMuted;
    if (muteBtn) {
      muteBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">' +
        (isMuted ? 'volume_off' : 'volume_up') + '</span>';
    }
    if (isMuted && window.AvatarTTS) {
      window.AvatarTTS.stop();
    }
  }

  // ═══════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════

  function init() {
    if (widget) return; // already initialized
    createDOM();
  }

  function getFaceContainer() {
    return faceContainer;
  }

  function getWidget() {
    return widget;
  }

  function isWidgetMuted() {
    return isMuted;
  }

  function isWidgetExpanded() {
    return isExpanded;
  }

  function destroy() {
    if (widget && widget.parentNode) {
      widget.parentNode.removeChild(widget);
    }
    widget = null;
    faceContainer = null;
    subtitleBar = null;
    subtitleText = null;
    muteBtn = null;
    isExpanded = false;
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  // ─── Export ───
  window.AvatarWidget = {
    init: init,
    expand: expand,
    collapse: collapse,
    onSpeechStart: onSpeechStart,
    onSpeechEnd: onSpeechEnd,
    showSubtitle: showSubtitle,
    hideSubtitle: hideSubtitle,
    getFaceContainer: getFaceContainer,
    getWidget: getWidget,
    isMuted: isWidgetMuted,
    isExpanded: isWidgetExpanded,
    destroy: destroy
  };

})();
