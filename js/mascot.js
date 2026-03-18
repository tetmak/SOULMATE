(function() {
    'use strict';

    var MASCOT_SIZE = 90;
    var MASCOT_BOTTOM = 80; // bottom-nav üstünde
    var MASCOT_RIGHT = 16;

    function init() {
        if (typeof lottie === 'undefined') {
            console.warn('[Mascot] lottie-web not loaded');
            return;
        }

        // Container oluştur
        var container = document.createElement('div');
        container.id = 'soulnum-mascot';
        container.style.cssText = [
            'position: fixed',
            'bottom: ' + MASCOT_BOTTOM + 'px',
            'right: ' + MASCOT_RIGHT + 'px',
            'width: ' + MASCOT_SIZE + 'px',
            'height: ' + MASCOT_SIZE + 'px',
            'z-index: 9999',
            'cursor: pointer',
            'transition: transform 0.3s ease',
            'filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.3))',
            'pointer-events: auto'
        ].join(';');

        document.body.appendChild(container);

        // Lottie animasyonu yükle
        var isNative = window.location.protocol === 'capacitor:' ||
                       window.location.protocol === 'ionic:' ||
                       window.location.hostname === 'localhost' ||
                       window.location.protocol === 'file:' ||
                       (typeof window.Capacitor !== 'undefined' &&
                        window.Capacitor.isNativePlatform &&
                        window.Capacitor.isNativePlatform());

        var basePath = isNative ? '' : '';
        var animPath = basePath + 'assets/lottie/mascot.json';

        var anim = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: animPath
        });

        // Hover efekti
        container.addEventListener('mouseenter', function() {
            container.style.transform = 'scale(1.15)';
        });
        container.addEventListener('mouseleave', function() {
            container.style.transform = 'scale(1)';
        });

        // Tıklama — bounce efekti
        container.addEventListener('click', function() {
            container.style.transform = 'scale(1.3)';
            setTimeout(function() {
                container.style.transform = 'scale(1)';
            }, 200);
        });

        // Animasyon hata kontrolü
        anim.addEventListener('data_failed', function() {
            console.error('[Mascot] Lottie animation load failed');
            container.style.display = 'none';
        });

        anim.addEventListener('DOMLoaded', function() {
            console.log('[Mascot] Animation loaded successfully');
        });

        window.soulnumMascot = {
            show: function() { container.style.display = 'block'; },
            hide: function() { container.style.display = 'none'; },
            anim: anim
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
