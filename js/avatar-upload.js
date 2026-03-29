/**
 * NUMERAEL — Avatar Upload Module
 * Fotoğraf seçme (native: Capacitor Camera, web: file input)
 * + canvas resize + Supabase Storage upload.
 */
(function() {
    'use strict';

    var MAX_SIZE = 800;
    var QUALITY = 0.8;

    // ─── Platform detection ─────────────────────────────────
    function isNative() {
        return window.location.protocol === 'capacitor:' ||
               window.location.protocol === 'ionic:' ||
               window.location.hostname === 'localhost' ||
               window.location.protocol === 'file:' ||
               (typeof window.Capacitor !== 'undefined' &&
                window.Capacitor.isNativePlatform &&
                window.Capacitor.isNativePlatform());
    }

    // ─── Image resize (canvas) ──────────────────────────────
    function resizeImage(dataUrl, callback) {
        var img = new Image();
        img.onload = function() {
            var w = img.width;
            var h = img.height;
            if (w > MAX_SIZE || h > MAX_SIZE) {
                if (w > h) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
                else { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }
            }
            var canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL('image/jpeg', QUALITY));
        };
        img.onerror = function() { callback(null); };
        img.src = dataUrl;
    }

    // ─── DataURL → Blob ─────────────────────────────────────
    function dataUrlToBlob(dataUrl) {
        var parts = dataUrl.split(',');
        var mime = parts[0].match(/:(.*?);/)[1];
        var bstr = atob(parts[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    }

    // ─── Fotoğraf seç (native veya web) ─────────────────────
    function pickPhoto() {
        if (isNative() && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera) {
            var Camera = window.Capacitor.Plugins.Camera;
            return Camera.getPhoto({
                quality: 80,
                allowEditing: true,
                resultType: 'dataUrl',
                source: 'prompt',
                width: MAX_SIZE,
                height: MAX_SIZE
            }).then(function(result) {
                return result.dataUrl;
            });
        }

        // Web: file input — mobile-compatible approach
        // KRITIK: setTimeout kullanma! Mobil tarayıcılar user gesture zincirini kırar.
        // capture attribute kullanma — bazı tarayıcılarda sessizce başarısız olur.
        return new Promise(function(resolve, reject) {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            // capture kaldırıldı — kullanıcı kamera veya galeri seçebilsin
            input.style.cssText = 'position:fixed;top:0;left:0;opacity:0.01;width:1px;height:1px;pointer-events:none;';
            document.body.appendChild(input);

            var cleaned = false;
            function cleanup() {
                if (cleaned) return;
                cleaned = true;
                setTimeout(function() { try { document.body.removeChild(input); } catch(e) {} }, 500);
            }

            input.onchange = function() {
                var file = input.files[0];
                cleanup();
                if (!file) { reject(new Error('No file selected')); return; }
                var reader = new FileReader();
                reader.onload = function() { resolve(reader.result); };
                reader.onerror = function() { reject(new Error('File could not be read')); };
                reader.readAsDataURL(file);
            };

            // Direkt click — setTimeout KULLANMA (user gesture zinciri kırılır)
            input.click();
        });
    }

    // ─── Supabase Storage'a yükle ───────────────────────────
    function uploadAvatar(userId, dataUrl) {
        if (!window.supabaseClient) {
            return Promise.reject(new Error('Supabase bağlantısı yok'));
        }

        return new Promise(function(resolve, reject) {
            resizeImage(dataUrl, function(resized) {
                if (!resized) { reject(new Error('Görsel işlenemedi')); return; }

                var blob = dataUrlToBlob(resized);
                var filePath = userId + '/avatar.jpg';

                window.supabaseClient.storage
                    .from('avatars')
                    .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true })
                    .then(function(result) {
                        if (result.error) { reject(result.error); return; }

                        var urlResult = window.supabaseClient.storage
                            .from('avatars')
                            .getPublicUrl(filePath);

                        var publicUrl = urlResult.data.publicUrl + '?t=' + Date.now();

                        // profiles tablosunu güncelle
                        var p1 = window.supabaseClient.from('profiles').update({
                            avatar_url: publicUrl,
                            updated_at: new Date().toISOString()
                        }).eq('id', userId);

                        // discovery_profiles tablosunu güncelle
                        var p2 = window.supabaseClient.from('discovery_profiles').update({
                            avatar_url: publicUrl,
                            updated_at: new Date().toISOString()
                        }).eq('user_id', userId);

                        Promise.all([p1, p2]).then(function() {
                            // localStorage cache güncelle
                            try {
                                var ud = JSON.parse(localStorage.getItem('numerael_user_data') || '{}');
                                ud.avatarUrl = publicUrl;
                                localStorage.setItem('numerael_user_data', JSON.stringify(ud));
                            } catch(e) {}

                            console.log('[Avatar] Upload başarılı:', publicUrl);
                            resolve(publicUrl);
                        }).catch(function(err) {
                            console.warn('[Avatar] DB güncelleme hatası:', err);
                            resolve(publicUrl); // URL yine de dön
                        });
                    })
                    .catch(reject);
            });
        });
    }

    // ─── Tam akış: seç + yükle ──────────────────────────────
    function changeAvatar(userId) {
        return pickPhoto().then(function(dataUrl) {
            if (!dataUrl) return null;
            return uploadAvatar(userId, dataUrl);
        });
    }

    // ─── Multi-photo: belirtilen index'e fotoğraf yükle ────
    var MAX_PHOTOS = 4;

    function uploadPhoto(userId, dataUrl, index) {
        if (!window.supabaseClient) return Promise.reject(new Error('Supabase yok'));
        if (index < 0 || index >= MAX_PHOTOS) return Promise.reject(new Error('Geçersiz index'));

        return new Promise(function(resolve, reject) {
            resizeImage(dataUrl, function(resized) {
                if (!resized) { reject(new Error('Görsel işlenemedi')); return; }

                var blob = dataUrlToBlob(resized);
                var filePath = userId + '/photo_' + index + '.jpg';

                window.supabaseClient.storage
                    .from('avatars')
                    .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true })
                    .then(function(result) {
                        if (result.error) { reject(result.error); return; }

                        var urlResult = window.supabaseClient.storage.from('avatars').getPublicUrl(filePath);
                        var publicUrl = urlResult.data.publicUrl + '?t=' + Date.now();

                        // Mevcut photos array'ini çek, güncelle, kaydet
                        window.supabaseClient.from('profiles').select('photos').eq('id', userId).maybeSingle()
                            .then(function(res) {
                                var photos = (res.data && res.data.photos) || [];
                                if (!Array.isArray(photos)) photos = [];
                                // Array'i index boyutuna genişlet
                                while (photos.length <= index) photos.push(null);
                                photos[index] = publicUrl;
                                // null'ları temizleme — sıra korunsun

                                var updates = { photos: photos, updated_at: new Date().toISOString() };
                                // İlk fotoğraf aynı zamanda avatar_url olarak da kaydedilir
                                if (index === 0) updates.avatar_url = publicUrl;

                                var p1 = window.supabaseClient.from('profiles').update(updates).eq('id', userId);
                                var p2 = window.supabaseClient.from('discovery_profiles').update(updates).eq('user_id', userId);

                                Promise.all([p1, p2]).then(function() {
                                    // localStorage cache
                                    try {
                                        var ud = JSON.parse(localStorage.getItem('numerael_user_data') || '{}');
                                        if (index === 0) ud.avatarUrl = publicUrl;
                                        ud.photos = photos;
                                        localStorage.setItem('numerael_user_data', JSON.stringify(ud));
                                    } catch(e) {}
                                    console.log('[Avatar] Photo ' + index + ' upload OK:', publicUrl);
                                    resolve({ url: publicUrl, photos: photos });
                                }).catch(function(err) {
                                    console.warn('[Avatar] DB update error:', err);
                                    resolve({ url: publicUrl, photos: photos });
                                });
                            }).catch(reject);
                    }).catch(reject);
            });
        });
    }

    function deletePhoto(userId, index) {
        if (!window.supabaseClient) return Promise.reject(new Error('Supabase yok'));

        var filePath = userId + '/photo_' + index + '.jpg';

        return window.supabaseClient.storage.from('avatars').remove([filePath])
            .then(function() {
                return window.supabaseClient.from('profiles').select('photos').eq('id', userId).maybeSingle();
            })
            .then(function(res) {
                var photos = (res.data && res.data.photos) || [];
                if (!Array.isArray(photos)) photos = [];
                if (index < photos.length) photos[index] = null;
                // Trailing null'ları kaldır
                while (photos.length > 0 && photos[photos.length - 1] === null) photos.pop();

                var updates = { photos: photos, updated_at: new Date().toISOString() };
                // İlk fotoğraf silindiyse avatar_url'i de güncelle
                if (index === 0) {
                    var firstValid = null;
                    for (var i = 0; i < photos.length; i++) { if (photos[i]) { firstValid = photos[i]; break; } }
                    updates.avatar_url = firstValid;
                }

                var p1 = window.supabaseClient.from('profiles').update(updates).eq('id', userId);
                var p2 = window.supabaseClient.from('discovery_profiles').update(updates).eq('user_id', userId);

                return Promise.all([p1, p2]).then(function() {
                    try {
                        var ud = JSON.parse(localStorage.getItem('numerael_user_data') || '{}');
                        ud.photos = photos;
                        if (index === 0) ud.avatarUrl = updates.avatar_url;
                        localStorage.setItem('numerael_user_data', JSON.stringify(ud));
                    } catch(e) {}
                    return photos;
                });
            });
    }

    function getPhotos(userId) {
        if (!window.supabaseClient) return Promise.resolve([]);
        // Önce profiles'dan dene (kendi profilin), sonra discovery_profiles (başkası, public read)
        return window.supabaseClient.from('profiles').select('photos, avatar_url').eq('id', userId).maybeSingle()
            .then(function(res) {
                var d = res.data;
                if (d) {
                    var photos = (d.photos && Array.isArray(d.photos)) ? d.photos : [];
                    if (photos.filter(Boolean).length > 0) return photos;
                    if (d.avatar_url) return [d.avatar_url];
                }
                // profiles'dan bulunamadıysa discovery_profiles'dan dene (public read)
                return window.supabaseClient.from('discovery_profiles').select('photos, avatar_url').eq('user_id', userId).maybeSingle()
                    .then(function(dpRes) {
                        var dp = dpRes.data;
                        if (!dp) return [];
                        var dpPhotos = (dp.photos && Array.isArray(dp.photos)) ? dp.photos : [];
                        if (dpPhotos.filter(Boolean).length > 0) return dpPhotos;
                        if (dp.avatar_url) return [dp.avatar_url];
                        return [];
                    });
            })
            .catch(function() { return []; });
    }

    window.avatarUpload = {
        pickPhoto: pickPhoto,
        uploadAvatar: uploadAvatar,
        changeAvatar: changeAvatar,
        resizeImage: resizeImage,
        isNative: isNative,
        // Multi-photo
        uploadPhoto: uploadPhoto,
        deletePhoto: deletePhoto,
        getPhotos: getPhotos,
        MAX_PHOTOS: MAX_PHOTOS
    };

})();
