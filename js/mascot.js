(function() {
    'use strict';

    var MASCOT_TYPES = {
        'default':   'assets/lottie/mascot-default.json',
        'celebrate': 'assets/lottie/mascot-celebrate.json',
        'excited':   'assets/lottie/mascot-excited.json',
        'thinking':  'assets/lottie/mascot-thinking.json',
        'wave':      'assets/lottie/mascot-wave.json',
        'sad':       'assets/lottie/mascot-sad.json',
        'winner':    'assets/lottie/mascot-winner.json'
    };

    /**
     * Mascot'u bir container'a yükle
     * @param {string|HTMLElement} target - Element ID veya element
     * @param {string} type - Mascot tipi: default, celebrate, excited, thinking, wave, sad, winner
     * @param {object} opts - { loop, autoplay, size }
     * @returns {object|null} lottie animation instance
     */
    function loadMascot(target, type, opts) {
        if (typeof lottie === 'undefined') {
            console.warn('[Mascot] lottie-web not loaded');
            return null;
        }

        var container = typeof target === 'string' ? document.getElementById(target) : target;
        if (!container) {
            console.log('[Mascot] Container not found:', target);
            return null;
        }

        opts = opts || {};
        var animPath = MASCOT_TYPES[type] || MASCOT_TYPES['default'];

        var anim = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: opts.loop !== undefined ? opts.loop : true,
            autoplay: opts.autoplay !== undefined ? opts.autoplay : true,
            path: animPath
        });

        // Bounce on click
        container.style.cursor = 'pointer';
        container.style.transition = 'transform 0.3s ease';
        container.addEventListener('click', function() {
            container.style.transform = 'scale(1.15)';
            setTimeout(function() { container.style.transform = 'scale(1)'; }, 300);
        });

        anim.addEventListener('data_failed', function() {
            console.error('[Mascot] Failed to load:', type);
            container.style.display = 'none';
        });

        anim.addEventListener('DOMLoaded', function() {
            console.log('[Mascot] Loaded:', type);
        });

        return anim;
    }

    /**
     * Mascot + speech bubble HTML oluştur ve hedef elementin önüne/sonuna ekle
     * @param {string} targetId - Hangi elementin yanına eklenecek
     * @param {string} type - Mascot tipi
     * @param {string} message - Konuşma balonu mesajı
     * @param {object} opts - { position: 'before'|'after', size: 80, bubbleClass: '' }
     */
    function injectMascot(targetId, type, message, opts) {
        opts = opts || {};
        var target = document.getElementById(targetId);
        if (!target) return null;

        var size = opts.size || 90;
        var wrapper = document.createElement('div');
        wrapper.className = 'mascot-section flex items-end gap-3 px-4 py-4';
        wrapper.innerHTML =
            '<div class="shrink-0" style="width:' + size + 'px;height:' + size + 'px;">' +
                '<div id="mascot-inject-' + type + '" style="width:' + size + 'px;height:' + size + 'px;"></div>' +
            '</div>' +
            (message ? '<div class="flex-1 relative bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md p-3 shadow-lg border border-slate-200/50 dark:border-white/10 mb-2">' +
                '<div class="absolute -left-2 bottom-4 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-white/90 dark:border-r-white/10 border-b-[8px] border-b-transparent"></div>' +
                '<p class="text-slate-800 dark:text-white text-sm font-medium leading-snug">' + message + '</p>' +
            '</div>' : '');

        if (opts.position === 'before') {
            target.parentNode.insertBefore(wrapper, target);
        } else {
            target.parentNode.insertBefore(wrapper, target.nextSibling);
        }

        return loadMascot('mascot-inject-' + type, type, opts);
    }

    /**
     * Tam ekran celebration overlay (winner, analiz tamamlandı vs.)
     * @param {string} type - Mascot tipi
     * @param {string} message - Mesaj
     * @param {number} duration - Kaç ms gösterilecek (0 = kalıcı)
     */
    function showCelebration(type, message, duration) {
        var overlay = document.createElement('div');
        overlay.id = 'mascot-celebration';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.4s ease;';

        overlay.innerHTML =
            '<div id="mascot-celeb-anim" style="width:180px;height:180px;"></div>' +
            (message ? '<p class="text-white text-lg font-bold mt-4 text-center px-8 animate-pulse">' + message + '</p>' : '') +
            '<button id="mascot-celeb-close" class="mt-6 px-6 py-2 bg-primary text-slate-900 rounded-full font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">Devam Et</button>';

        document.body.appendChild(overlay);

        // Fade in
        requestAnimationFrame(function() {
            overlay.style.opacity = '1';
        });

        var anim = loadMascot('mascot-celeb-anim', type, { loop: true });

        // Close
        var closeBtn = document.getElementById('mascot-celeb-close');
        function close() {
            overlay.style.opacity = '0';
            setTimeout(function() { overlay.remove(); }, 400);
        }
        closeBtn.addEventListener('click', close);

        if (duration && duration > 0) {
            setTimeout(close, duration);
        }

        return { anim: anim, close: close };
    }

    // Auto-init: sayfada mascot-container varsa otomatik yükle
    function autoInit() {
        var container = document.getElementById('mascot-container');
        if (container) {
            var type = container.getAttribute('data-mascot') || 'default';
            loadMascot(container, type);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }

    // Global API
    window.soulnumMascot = {
        load: loadMascot,
        inject: injectMascot,
        celebrate: showCelebration,
        types: MASCOT_TYPES
    };
})();
