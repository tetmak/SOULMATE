(function() {
    'use strict';

    function init() {
        if (typeof lottie === 'undefined') {
            console.warn('[Mascot] lottie-web not loaded');
            return;
        }

        // Sayfada mascot-container varsa oraya yükle (Duolingo tarzı, inline)
        var container = document.getElementById('mascot-container');
        if (!container) {
            console.log('[Mascot] No mascot-container found on this page');
            return;
        }

        var animPath = 'assets/lottie/mascot.json';

        var anim = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: animPath
        });

        // Tıklama — bounce efekti
        container.style.cursor = 'pointer';
        container.style.transition = 'transform 0.3s ease';
        container.addEventListener('click', function() {
            container.style.transform = 'scale(1.2)';
            setTimeout(function() {
                container.style.transform = 'scale(1)';
            }, 300);
        });

        // Hata kontrolü
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
