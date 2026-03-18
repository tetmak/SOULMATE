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

    // Sayfa bazlı mascot config — otomatik inject
    var PAGE_CONFIG = {
        'mystic_numerology_home_1.html':           null, // Manuel HTML'de var
        'cosmic_onboarding_welcome.html':          null, // Manuel
        'cosmic_calculation_loading.html':         null, // Manuel
        'soul_mate_loading.html':                  null, // Manuel
        'name_numerology_breakdown_1.html':        null, // Manuel
        'name_numerology_breakdown_2.html':        null, // Manuel
        'name_numerology_breakdown_3.html':        null, // Manuel
        'relationship_compatibility_analysis.html':null, // Manuel
        'cosmic_match.html':                       null, // Manuel (winner JS ile)

        // Günlük sayfalar
        'daily_spiritual_guide.html':    { type: 'default',   msg: 'Bugünün kozmik enerjisi seninle! ✨' },
        'daily_number_deep_dive.html':   { type: 'excited',   msg: 'Sayının derinliklerine inelim! 🔮' },

        // Takvim & Manifest
        'cosmic_energy_calendar_2.html': { type: 'default',   msg: 'Kozmik takvimin hazır! 🌙' },
        'manifest_portal.html':          { type: 'excited',   msg: 'Niyetini evrene göndermeye hazır mısın? ✨' },
        'manifest_community.html':       { type: 'default',   msg: 'Topluluktan ilham al! 💫' },
        'cosmic_manifest_portal.html':   { type: 'default',   msg: 'Niyet portalın açık! 🌟' },

        // Profil & Ayarlar
        'profile_soul_journey.html':     { type: 'default',   msg: 'Ruh yolculuğun harika gidiyor! 💜' },
        'connections_shared_readings.html': { type: 'celebrate', msg: 'Bağlantıların güçleniyor! 🤝' },
        'app_settings_preferences.html': { type: 'default',   msg: 'Deneyimini özelleştir! ⚙️' },
        'kisi_profil.html':              { type: 'default',   msg: 'Kozmik profil kartı! 🌟' },

        // Oyun & Skor
        'leaderboard.html':              { type: 'excited',   msg: 'Sıralamada yükseliyorsun! 🏆' },
        'numerology_quiz.html':          { type: 'excited',   msg: 'Bilgini test etmeye hazır mısın? 🧠' },
        'wheel_of_destiny.html':         { type: 'excited',   msg: 'Kader çarkını çevir! 🎡' },
        'wheel_reward_success.html':     { type: 'winner',    msg: 'Tebrikler, ödülünü kazandın! 🎉' },
        'lunar_phase_energy_tracker.html': { type: 'default', msg: 'Ay enerjisi seninle! 🌙' },

        // Premium
        'premium_checkout_summary.html': { type: 'wave',      msg: 'Premium ile sınırsız keşif! 💎' },
        'premium_crystal_store.html':    { type: 'wave',      msg: 'Kristal mağazaya hoş geldin! 💎' },

        // Mesajlaşma
        'messaging.html':               { type: 'default',    msg: 'Kozmik sohbetler! 💬' },

        // Uyumluluk Formu
        'compatibility_input_form.html': { type: 'thinking',  msg: 'İsimleri gir, kozmik bağı keşfedelim! 🔮' },
        'friendship_dynamics.html':      { type: 'celebrate',  msg: 'Arkadaşlık enerjiniz nasıl? 🤝' },

        // Diğer detay sayfaları
        'numerology_meaning_chart.html': { type: 'default',   msg: 'Sayıların gizli anlamları! 📖' },
        'letter_vibration_detail.html':  { type: 'default',   msg: 'Harflerin titreşim gücü! 🔤' },
        'past_reading_archive_detail.html': { type: 'default', msg: 'Geçmiş okumalarına göz at! 📜' },

        // Doğum formu
        'data-ready_birth_form.html':    { type: 'wave',      msg: 'Kozmik yolculuğun başlıyor! 🌟' }
    };

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

    function showCelebration(type, message, duration) {
        var overlay = document.createElement('div');
        overlay.id = 'mascot-celebration';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.4s ease;';

        overlay.innerHTML =
            '<div id="mascot-celeb-anim" style="width:180px;height:180px;"></div>' +
            (message ? '<p class="text-white text-lg font-bold mt-4 text-center px-8 animate-pulse">' + message + '</p>' : '') +
            '<button id="mascot-celeb-close" class="mt-6 px-6 py-2 bg-primary text-slate-900 rounded-full font-bold text-sm tracking-wider uppercase shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">Devam Et</button>';

        document.body.appendChild(overlay);

        requestAnimationFrame(function() {
            overlay.style.opacity = '1';
        });

        var anim = loadMascot('mascot-celeb-anim', type, { loop: true });

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

    /**
     * Sayfa bazlı otomatik mascot inject
     * Header veya main'den sonra ilk uygun yere mascot + bubble ekler
     */
    function autoInjectForPage() {
        var page = window.location.pathname.split('/').pop() || '';
        var config = PAGE_CONFIG[page];

        // null = manuel HTML'de zaten var, undefined = bilinmeyen sayfa
        if (config === null || config === undefined) return;

        // Inject noktası bul: header sonrası, main başı, veya body'nin ilk child'ı
        var anchor = null;
        var position = 'after';

        // 1. </header> sonrası
        var headers = document.querySelectorAll('header');
        if (headers.length > 0) {
            anchor = headers[headers.length - 1];
            position = 'after';
        }

        // 2. <main> içine ilk child olarak
        if (!anchor) {
            var main = document.querySelector('main');
            if (main && main.firstElementChild) {
                anchor = main.firstElementChild;
                position = 'before';
            } else if (main) {
                anchor = main;
                position = 'inside';
            }
        }

        // 3. Body'nin scrollable content'i
        if (!anchor) {
            var scrollable = document.querySelector('.flex-1.overflow-y-auto, .overflow-y-auto, [class*="overflow-y"]');
            if (scrollable && scrollable.firstElementChild) {
                anchor = scrollable.firstElementChild;
                position = 'before';
            }
        }

        // 4. Fallback: body'deki ilk div
        if (!anchor) {
            var firstDiv = document.body.querySelector('div > div');
            if (firstDiv) {
                anchor = firstDiv;
                position = 'before';
            }
        }

        if (!anchor) {
            console.log('[Mascot] No inject anchor found for', page);
            return;
        }

        var size = 70;
        var wrapper = document.createElement('div');
        wrapper.className = 'mascot-section flex items-end gap-3 px-4 py-3';
        wrapper.style.cssText = 'max-width:480px;margin:0 auto;';

        var animId = 'mascot-auto-' + config.type;
        wrapper.innerHTML =
            '<div class="shrink-0" style="width:' + size + 'px;height:' + size + 'px;">' +
                '<div id="' + animId + '" style="width:' + size + 'px;height:' + size + 'px;"></div>' +
            '</div>' +
            '<div class="flex-1 relative bg-white/90 dark:bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md p-3 shadow-lg border border-slate-200/50 dark:border-white/10 mb-1">' +
                '<div class="absolute -left-2 bottom-3 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white/90 dark:border-r-white/10 border-b-[6px] border-b-transparent"></div>' +
                '<p class="text-slate-800 dark:text-white text-sm font-medium leading-snug">' + config.msg + '</p>' +
            '</div>';

        if (position === 'before') {
            anchor.parentNode.insertBefore(wrapper, anchor);
        } else if (position === 'inside') {
            anchor.prepend(wrapper);
        } else {
            anchor.parentNode.insertBefore(wrapper, anchor.nextSibling);
        }

        loadMascot(animId, config.type, { size: size });
        console.log('[Mascot] Auto-injected', config.type, 'on', page);
    }

    // Auto-init
    function autoInit() {
        // 1. Manuel container varsa yükle
        var container = document.getElementById('mascot-container');
        if (container) {
            var type = container.getAttribute('data-mascot') || 'default';
            loadMascot(container, type);
        }

        // 2. Sayfa config'i varsa otomatik inject
        if (!container) {
            autoInjectForPage();
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
