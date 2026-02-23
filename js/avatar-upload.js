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

        // Web: hidden file input
        return new Promise(function(resolve, reject) {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/jpeg,image/png,image/webp';
            input.style.display = 'none';
            document.body.appendChild(input);
            input.onchange = function() {
                var file = input.files[0];
                document.body.removeChild(input);
                if (!file) { reject(new Error('Dosya seçilmedi')); return; }
                var reader = new FileReader();
                reader.onload = function() { resolve(reader.result); };
                reader.onerror = function() { reject(new Error('Dosya okunamadı')); };
                reader.readAsDataURL(file);
            };
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

    window.avatarUpload = {
        pickPhoto: pickPhoto,
        uploadAvatar: uploadAvatar,
        changeAvatar: changeAvatar,
        resizeImage: resizeImage,
        isNative: isNative
    };

})();
