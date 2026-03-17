/**
 * Lunar Utils — Shared moon phase calculation module
 * Extracted from lunar_phase_energy_tracker.html for reuse
 */
(function() {
    'use strict';

    var PHASE_NAMES_TR = {
        'New Moon': 'Yeni Ay',
        'Waxing Crescent': 'Hilal (Büyüyen)',
        'First Quarter': 'İlk Dördün',
        'Waxing Gibbous': 'Şişkin Ay (Büyüyen)',
        'Full Moon': 'Dolunay',
        'Waning Gibbous': 'Şişkin Ay (Küçülen)',
        'Last Quarter': 'Son Dördün',
        'Waning Crescent': 'Hilal (Küçülen)'
    };

    var PHASE_ICONS = {
        'New Moon': '🌑',
        'Waxing Crescent': '🌒',
        'First Quarter': '🌓',
        'Waxing Gibbous': '🌔',
        'Full Moon': '🌕',
        'Waning Gibbous': '🌖',
        'Last Quarter': '🌗',
        'Waning Crescent': '🌘'
    };

    var PHASE_TIPS_TR = {
        'New Moon': 'Yeni başlangıçlar için ideal bir gün. Niyetlerini belirle ve içsel yolculuğuna odaklan.',
        'Waxing Crescent': 'Tohumların filizleniyor. Planlarını harekete geçir, motivasyonunu koru.',
        'First Quarter': 'Karar zamanı. Engellerle yüzleş ve kararlılığını göster.',
        'Waxing Gibbous': 'Detayları incele, ince ayar yap. Hedefine yaklaşıyorsun.',
        'Full Moon': 'Enerjiler doruğunda! Duygusal farkındalık ve tamamlanma zamanı.',
        'Waning Gibbous': 'Minnettarlık zamanı. Öğrendiklerini paylaş ve yansıt.',
        'Last Quarter': 'Bırakma zamanı. Artık işe yaramayan şeyleri serbest bırak.',
        'Waning Crescent': 'Dinlen ve yenilen. İç huzurunu bul, yeni döngüye hazırlan.'
    };

    function moonAge(date) {
        var known = new Date(2000, 0, 6);
        return (((date - known) / 86400000) % 29.53058867 + 29.53058867) % 29.53058867;
    }

    function getMoon(date) {
        var age = moonAge(date);
        var illum = Math.round((1 - Math.cos((age / 29.53058867) * 2 * Math.PI)) / 2 * 100);
        var phase = 'Waning Crescent';
        if (age < 1.85) phase = 'New Moon';
        else if (age < 7.38) phase = 'Waxing Crescent';
        else if (age < 9.22) phase = 'First Quarter';
        else if (age < 14.77) phase = 'Waxing Gibbous';
        else if (age < 16.61) phase = 'Full Moon';
        else if (age < 22.15) phase = 'Waning Gibbous';
        else if (age < 23.99) phase = 'Last Quarter';
        return { phase: phase, age: age.toFixed(1), illum: illum };
    }

    window.lunarUtils = {
        getMoon: getMoon,
        moonAge: moonAge,
        getPhaseNameTR: function(phase) { return PHASE_NAMES_TR[phase] || phase; },
        getPhaseIcon: function(phase) { return PHASE_ICONS[phase] || '🌙'; },
        getPhaseTipTR: function(phase) { return PHASE_TIPS_TR[phase] || ''; }
    };
})();
