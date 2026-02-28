/**
 * NUMERAEL — Türkiye 81 İl + İstanbul/Ankara/İzmir İlçe Koordinatları
 * Cosmic Match harita özelliği için kullanılır.
 * Export: window.TURKISH_CITIES
 *
 * Yapı: { name, lat, lng } veya { name, districts: [{ name, lat, lng }] }
 * İlçeli şehirler doğrudan seçilemez, ilçe seçilir.
 */
(function() {
    'use strict';

    window.TURKISH_CITIES = [
        { name: 'Adana', lat: 37.0000, lng: 35.3213 },
        { name: 'Adıyaman', lat: 37.7648, lng: 38.2786 },
        { name: 'Afyonkarahisar', lat: 38.7507, lng: 30.5567 },
        { name: 'Ağrı', lat: 39.7191, lng: 43.0503 },
        { name: 'Aksaray', lat: 38.3687, lng: 34.0370 },
        { name: 'Amasya', lat: 40.6499, lng: 35.8353 },
        { name: 'Ankara', districts: [
            { name: 'Altındağ', lat: 39.9597, lng: 32.8742 },
            { name: 'Çankaya', lat: 39.8900, lng: 32.8600 },
            { name: 'Etimesgut', lat: 39.9500, lng: 32.6700 },
            { name: 'Gölbaşı', lat: 39.7800, lng: 32.8000 },
            { name: 'Keçiören', lat: 39.9700, lng: 32.8600 },
            { name: 'Mamak', lat: 39.9300, lng: 32.9100 },
            { name: 'Pursaklar', lat: 40.0500, lng: 32.9000 },
            { name: 'Sincan', lat: 39.9700, lng: 32.5800 },
            { name: 'Yenimahalle', lat: 39.9700, lng: 32.8100 }
        ]},
        { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
        { name: 'Ardahan', lat: 41.1105, lng: 42.7022 },
        { name: 'Artvin', lat: 41.1828, lng: 41.8183 },
        { name: 'Aydın', lat: 37.8560, lng: 27.8416 },
        { name: 'Balıkesir', lat: 39.6484, lng: 27.8826 },
        { name: 'Bartın', lat: 41.6344, lng: 32.3375 },
        { name: 'Batman', lat: 37.8812, lng: 41.1351 },
        { name: 'Bayburt', lat: 40.2552, lng: 40.2249 },
        { name: 'Bilecik', lat: 40.0567, lng: 30.0665 },
        { name: 'Bingöl', lat: 38.8854, lng: 40.4966 },
        { name: 'Bitlis', lat: 38.3938, lng: 42.1232 },
        { name: 'Bolu', lat: 40.7360, lng: 31.6113 },
        { name: 'Burdur', lat: 37.7203, lng: 30.2908 },
        { name: 'Bursa', lat: 40.1885, lng: 29.0610 },
        { name: 'Çanakkale', lat: 40.1553, lng: 26.4142 },
        { name: 'Çankırı', lat: 40.6013, lng: 33.6134 },
        { name: 'Çorum', lat: 40.5506, lng: 34.9556 },
        { name: 'Denizli', lat: 37.7765, lng: 29.0864 },
        { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
        { name: 'Düzce', lat: 40.8438, lng: 31.1565 },
        { name: 'Edirne', lat: 41.6818, lng: 26.5623 },
        { name: 'Elazığ', lat: 38.6810, lng: 39.2264 },
        { name: 'Erzincan', lat: 39.7500, lng: 39.5000 },
        { name: 'Erzurum', lat: 39.9054, lng: 41.2658 },
        { name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
        { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
        { name: 'Giresun', lat: 40.9128, lng: 38.3895 },
        { name: 'Gümüşhane', lat: 40.4386, lng: 39.5086 },
        { name: 'Hakkari', lat: 37.5833, lng: 43.7333 },
        { name: 'Hatay', lat: 36.4018, lng: 36.3498 },
        { name: 'Iğdır', lat: 39.9167, lng: 44.0500 },
        { name: 'Isparta', lat: 37.7648, lng: 30.5566 },
        { name: 'İstanbul', districts: [
            { name: 'Adalar', lat: 40.8761, lng: 29.0906 },
            { name: 'Arnavutköy', lat: 41.1853, lng: 28.7394 },
            { name: 'Ataşehir', lat: 40.9833, lng: 29.1167 },
            { name: 'Avcılar', lat: 40.9794, lng: 28.7217 },
            { name: 'Bağcılar', lat: 41.0386, lng: 28.8572 },
            { name: 'Bahçelievler', lat: 41.0000, lng: 28.8617 },
            { name: 'Bakırköy', lat: 40.9819, lng: 28.8772 },
            { name: 'Başakşehir', lat: 41.0933, lng: 28.8000 },
            { name: 'Bayrampaşa', lat: 41.0464, lng: 28.9117 },
            { name: 'Beşiktaş', lat: 41.0422, lng: 29.0083 },
            { name: 'Beykoz', lat: 41.1167, lng: 29.0833 },
            { name: 'Beylikdüzü', lat: 41.0039, lng: 28.6428 },
            { name: 'Beyoğlu', lat: 41.0370, lng: 28.9769 },
            { name: 'Büyükçekmece', lat: 41.0217, lng: 28.5900 },
            { name: 'Çatalca', lat: 41.1433, lng: 28.4600 },
            { name: 'Çekmeköy', lat: 41.0333, lng: 29.1833 },
            { name: 'Esenler', lat: 41.0439, lng: 28.8756 },
            { name: 'Esenyurt', lat: 41.0333, lng: 28.6833 },
            { name: 'Eyüpsultan', lat: 41.0483, lng: 28.9339 },
            { name: 'Fatih', lat: 41.0186, lng: 28.9397 },
            { name: 'Gaziosmanpaşa', lat: 41.0633, lng: 28.9117 },
            { name: 'Güngören', lat: 41.0200, lng: 28.8833 },
            { name: 'Kadıköy', lat: 40.9927, lng: 29.0230 },
            { name: 'Kağıthane', lat: 41.0833, lng: 28.9667 },
            { name: 'Kartal', lat: 40.9000, lng: 29.1833 },
            { name: 'Küçükçekmece', lat: 41.0042, lng: 28.7694 },
            { name: 'Maltepe', lat: 40.9333, lng: 29.1333 },
            { name: 'Pendik', lat: 40.8781, lng: 29.2321 },
            { name: 'Sancaktepe', lat: 41.0028, lng: 29.2333 },
            { name: 'Sarıyer', lat: 41.1667, lng: 29.0500 },
            { name: 'Silivri', lat: 41.0736, lng: 28.2464 },
            { name: 'Sultanbeyli', lat: 40.9622, lng: 29.2622 },
            { name: 'Sultangazi', lat: 41.1069, lng: 28.8672 },
            { name: 'Şile', lat: 41.1756, lng: 29.6128 },
            { name: 'Şişli', lat: 41.0602, lng: 28.9877 },
            { name: 'Tuzla', lat: 40.8167, lng: 29.3000 },
            { name: 'Ümraniye', lat: 41.0167, lng: 29.1167 },
            { name: 'Üsküdar', lat: 41.0236, lng: 29.0153 },
            { name: 'Zeytinburnu', lat: 41.0042, lng: 28.9028 }
        ]},
        { name: 'İzmir', districts: [
            { name: 'Bayraklı', lat: 38.4628, lng: 27.1639 },
            { name: 'Bornova', lat: 38.4700, lng: 27.2200 },
            { name: 'Buca', lat: 38.3886, lng: 27.1750 },
            { name: 'Çiğli', lat: 38.5000, lng: 27.0600 },
            { name: 'Gaziemir', lat: 38.3200, lng: 27.1300 },
            { name: 'Karabağlar', lat: 38.3800, lng: 27.1200 },
            { name: 'Karşıyaka', lat: 38.4600, lng: 27.1100 },
            { name: 'Konak', lat: 38.4192, lng: 27.1287 },
            { name: 'Menemen', lat: 38.6100, lng: 27.0700 },
            { name: 'Torbalı', lat: 38.1600, lng: 27.3600 }
        ]},
        { name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371 },
        { name: 'Karabük', lat: 41.2061, lng: 32.6204 },
        { name: 'Karaman', lat: 37.1759, lng: 33.2287 },
        { name: 'Kars', lat: 40.6013, lng: 43.0975 },
        { name: 'Kastamonu', lat: 41.3887, lng: 33.7827 },
        { name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
        { name: 'Kilis', lat: 36.7184, lng: 37.1212 },
        { name: 'Kırıkkale', lat: 39.8468, lng: 33.5153 },
        { name: 'Kırklareli', lat: 41.7333, lng: 27.2167 },
        { name: 'Kırşehir', lat: 39.1425, lng: 34.1709 },
        { name: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
        { name: 'Konya', lat: 37.8746, lng: 32.4932 },
        { name: 'Kütahya', lat: 39.4167, lng: 29.9833 },
        { name: 'Malatya', lat: 38.3552, lng: 38.3095 },
        { name: 'Manisa', lat: 38.6191, lng: 27.4289 },
        { name: 'Mardin', lat: 37.3212, lng: 40.7245 },
        { name: 'Mersin', lat: 36.8121, lng: 34.6415 },
        { name: 'Muğla', lat: 37.2153, lng: 28.3636 },
        { name: 'Muş', lat: 38.9462, lng: 41.7539 },
        { name: 'Nevşehir', lat: 38.6939, lng: 34.6857 },
        { name: 'Niğde', lat: 37.9667, lng: 34.6833 },
        { name: 'Ordu', lat: 40.9839, lng: 37.8764 },
        { name: 'Osmaniye', lat: 37.0742, lng: 36.2464 },
        { name: 'Rize', lat: 41.0201, lng: 40.5234 },
        { name: 'Sakarya', lat: 40.6940, lng: 30.4358 },
        { name: 'Samsun', lat: 41.2928, lng: 36.3313 },
        { name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969 },
        { name: 'Siirt', lat: 37.9333, lng: 41.9500 },
        { name: 'Sinop', lat: 42.0231, lng: 35.1531 },
        { name: 'Sivas', lat: 39.7477, lng: 37.0179 },
        { name: 'Şırnak', lat: 37.4187, lng: 42.4918 },
        { name: 'Tekirdağ', lat: 41.0027, lng: 27.5127 },
        { name: 'Tokat', lat: 40.3167, lng: 36.5500 },
        { name: 'Trabzon', lat: 41.0015, lng: 39.7178 },
        { name: 'Tunceli', lat: 39.1079, lng: 39.5401 },
        { name: 'Uşak', lat: 38.6823, lng: 29.4082 },
        { name: 'Van', lat: 38.4891, lng: 43.3800 },
        { name: 'Yalova', lat: 40.6500, lng: 29.2667 },
        { name: 'Yozgat', lat: 39.8181, lng: 34.8147 },
        { name: 'Zonguldak', lat: 41.4564, lng: 31.7987 }
    ];

    // Yardımcı: şehir adından koordinat bul (ilçeli şehirler dahil)
    window.lookupTurkishCity = function(cityName) {
        if (!cityName) return null;
        var name = cityName.trim();
        for (var i = 0; i < window.TURKISH_CITIES.length; i++) {
            var c = window.TURKISH_CITIES[i];
            if (c.districts) {
                for (var j = 0; j < c.districts.length; j++) {
                    if (c.name + ' - ' + c.districts[j].name === name) return c.districts[j];
                }
            } else {
                if (c.name === name) return c;
            }
        }
        return null;
    };

    // Yardımcı: select elementi doldur (optgroup ile)
    window.populateCitySelect = function(selectEl) {
        if (!selectEl || !window.TURKISH_CITIES) return;
        window.TURKISH_CITIES.forEach(function(c) {
            if (c.districts) {
                var group = document.createElement('optgroup');
                group.label = c.name;
                c.districts.forEach(function(d) {
                    var opt = document.createElement('option');
                    opt.value = c.name + ' - ' + d.name;
                    opt.textContent = d.name;
                    group.appendChild(opt);
                });
                selectEl.appendChild(group);
            } else {
                var opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = c.name;
                selectEl.appendChild(opt);
            }
        });
    };

})();
