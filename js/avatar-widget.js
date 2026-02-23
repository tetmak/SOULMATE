/**
 * SOULNUM — Avatar Widget UI
 * Sağ alt köşede kayan orb → konuşma sırasında genişleyen canvas widget.
 */
(function() {
  'use strict';

  var COLLAPSED_SIZE = 64;  // px
  var EXPANDED_SIZE = 220;  // px
  var AUTO_COLLAPSE_DELAY = 3000; // ms
  var Z_INDEX = 490;

  var container = null;
  var canvas = null;
  var isExpanded = false;
  var collapseTimer = null;
  var isInitialized = false;

  // Widget DOM oluştur
  function createWidgetDOM() {
    // Container
    container = document.createElement('div');
    container.id = 'avatar-widget';
    container.style.cssText =
      'position:fixed;bottom:80px;right:16px;z-index:' + Z_INDEX + ';' +
      'width:' + COLLAPSED_SIZE + 'px;height:' + COLLAPSED_SIZE + 'px;' +
      'border-radius:50%;overflow:hidden;cursor:pointer;' +
      'transition:all 0.35s cubic-bezier(0.4,0,0.2,1);' +
      'background:radial-gradient(circle at 30% 30%,#2d1b69,#1a0e3a 60%,#0d0520);' +
      'box-shadow:0 0 20px rgba(139,92,246,0.3),0 0 40px rgba(139,92,246,0.1);' +
      'border:2px solid rgba(139,92,246,0.4);';

    // Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'avatar-canvas';
    canvas.width = EXPANDED_SIZE;
    canvas.height = EXPANDED_SIZE;
    canvas.style.cssText =
      'width:100%;height:100%;display:block;opacity:0;' +
      'transition:opacity 0.3s ease;';

    // Orb ikonu (kapalı durumda görünür)
    var orbIcon = document.createElement('div');
    orbIcon.id = 'avatar-orb-icon';
    orbIcon.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'display:flex;align-items:center;justify-content:center;' +
      'transition:opacity 0.3s ease;';
    orbIcon.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(196,181,253,0.9)" stroke-width="1.5">' +
        '<circle cx="12" cy="8" r="4"/>' +
        '<path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7"/>' +
        '<circle cx="12" cy="12" r="11" stroke-dasharray="4 3"/>' +
      '</svg>';

    container.appendChild(canvas);
    container.appendChild(orbIcon);

    // Tıklama
    container.addEventListener('click', function(e) {
      e.stopPropagation();
      if (isExpanded) {
        collapse();
      } else {
        expand();
      }
    });

    // Pulse animasyonu ekle
    var style = document.createElement('style');
    style.textContent =
      '@keyframes avatar-orb-pulse{' +
        '0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.3),0 0 40px rgba(139,92,246,0.1)}' +
        '50%{box-shadow:0 0 25px rgba(139,92,246,0.5),0 0 50px rgba(139,92,246,0.2)}' +
      '}' +
      '#avatar-widget:not(.expanded){animation:avatar-orb-pulse 3s ease-in-out infinite}' +
      '#avatar-widget.speaking{' +
        'box-shadow:0 0 30px rgba(236,72,153,0.4),0 0 60px rgba(139,92,246,0.3)!important;' +
        'border-color:rgba(236,72,153,0.6)!important;' +
      '}';
    document.head.appendChild(style);

    document.body.appendChild(container);
  }

  function expand() {
    if (!container || isExpanded) return;
    isExpanded = true;
    clearCollapseTimer();

    container.classList.add('expanded');
    container.style.width = EXPANDED_SIZE + 'px';
    container.style.height = EXPANDED_SIZE + 'px';
    container.style.borderRadius = '20px';

    // Canvas göster, orb ikonu gizle
    canvas.style.opacity = '1';
    var orbIcon = document.getElementById('avatar-orb-icon');
    if (orbIcon) orbIcon.style.opacity = '0';
  }

  function collapse() {
    if (!container || !isExpanded) return;
    isExpanded = false;

    container.classList.remove('expanded');
    container.style.width = COLLAPSED_SIZE + 'px';
    container.style.height = COLLAPSED_SIZE + 'px';
    container.style.borderRadius = '50%';

    // Canvas gizle, orb ikonu göster
    canvas.style.opacity = '0';
    var orbIcon = document.getElementById('avatar-orb-icon');
    if (orbIcon) orbIcon.style.opacity = '1';
  }

  function clearCollapseTimer() {
    if (collapseTimer) {
      clearTimeout(collapseTimer);
      collapseTimer = null;
    }
  }

  function scheduleCollapse() {
    clearCollapseTimer();
    collapseTimer = setTimeout(function() {
      collapse();
    }, AUTO_COLLAPSE_DELAY);
  }

  // Public API
  var AvatarWidget = {
    init: function() {
      if (isInitialized) return;
      isInitialized = true;

      createWidgetDOM();

      // Canvas'ı renderer'a ver
      if (window.AvatarRenderer) {
        window.AvatarRenderer.init(canvas);
      }

      console.log('[Avatar] Widget hazır');
    },

    expand: function() {
      expand();
    },

    collapse: function() {
      collapse();
    },

    onSpeakStart: function() {
      expand();
      clearCollapseTimer();
      if (container) container.classList.add('speaking');
    },

    onSpeakEnd: function() {
      if (container) container.classList.remove('speaking');
      scheduleCollapse();
    },

    isExpanded: function() {
      return isExpanded;
    },

    getCanvas: function() {
      return canvas;
    },

    destroy: function() {
      clearCollapseTimer();
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      container = null;
      canvas = null;
      isExpanded = false;
      isInitialized = false;
    }
  };

  window.AvatarWidget = AvatarWidget;
})();
