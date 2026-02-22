# RevenueCat Paywall Integration - Sorun Giderme Logu

## 1. Kotlin Duplicate Class Hatası

**Sorun:** Android build sırasında `kotlin-stdlib-1.8.22` ile `kotlin-stdlib-jdk7-1.6.21` ve `kotlin-stdlib-jdk8-1.6.21` arasında duplicate class hatası.

**Çözüm:** `android/app/build.gradle`'a eklendi:
```groovy
configurations.all {
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
    exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
}
```

---

## 2. flatDir Uyarısı

**Sorun:** `Using flatDir should be avoided because it doesn't support any meta-data formats.`

**Çözüm:** `android/app/build.gradle`'daki `flatDir` bloğu kaldırıldı. İlgili `libs` dizinleri zaten mevcut değildi (boş referans).

---

## 3. Cosmic Match Sayfası Anasayfaya Dönüyor

**Sorun:** Cosmic Match sayfası açılınca debug paneli görünüyor, ardından otomatik olarak anasayfaya yönlendiriliyor.

**Debug Paneli Çıktısı:**
```
Platform: android
Capacitor.isNative: true
window.revenuecat: EXISTS
window.premium: EXISTS
RC.isNative(): true
RC.isReady(): false
premium.isPremium(): false
premium.isNative(): true
localStorage premium: NULL
Capacitor Plugins: SystemBars, SplashScreen, Purchases, CapacitorCookies, WebView, StatusBar, CapacitorHttp
Purchases plugin: EXISTS
```

### Tespit Edilen Sorunlar:

#### 3a. Auth.js Session Race Condition (Ana Sorun)
`auth.js`'deki `DOMContentLoaded` handler'ı `getSession()` çağırıyordu. Supabase henüz session'ı localStorage'dan recover etmeden `null` döndürüyordu. Bu zincirleme redirect'e neden oluyordu:
- `cosmic_match.html` → `mystic_sign_up_screen.html` (session null)
- `mystic_sign_up_screen.html` → `mystic_numerology_home_1.html` (session recover oldu, auth page'de session var → home'a yönlendir)

**Çözüm:** `auth.js`'de `onAuthStateChange(INITIAL_SESSION)` event'i bekleniyor:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    if (window.supabaseClient && window.supabaseClient.auth) {
        var done = false;
        var sub = window.supabaseClient.auth.onAuthStateChange(function(event) {
            if (done) return;
            if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                done = true;
                try { sub.data.subscription.unsubscribe(); } catch(e) {}
                auth.checkSession();
            }
        });
        setTimeout(function() {
            if (!done) {
                done = true;
                try { sub.data.subscription.unsubscribe(); } catch(e) {}
                auth.checkSession();
            }
        }, 3000);
    } else {
        auth.checkSession();
    }
});
```

#### 3b. RevenueCat Init Zamanlama Sorunu
`premium.js`'deki `platformInit()` async IIFE olarak çalışıyor ama `checkPremiumStatus()` bunun bitmesini beklemiyordu. `RC.isReady()` her zaman `false` dönüyordu.

**Çözüm:** `platformInit()` sonucu `platformReady` promise'ine atandı, `checkPremiumStatus()` bunu await ediyor:
```javascript
var platformReady = (async function platformInit() { ... })();

async function checkPremiumStatus() {
    if (isPremium()) return true;
    try { await platformReady; } catch(e) {}
    // ... RC ve Supabase kontrolleri
}
```

#### 3c. Supabase `.single()` Hatası
`checkPremiumStatus()` içinde `subscriptions` tablosundan `.single()` ile sorgu yapılıyordu. Satır yokken `.single()` hata fırlatıyordu.

**Çözüm:** `.single()` → `.maybeSingle()` olarak değiştirildi.

#### 3d. Native'de Gereksiz Paddle Yüklemesi
RevenueCat başarısız olunca (XXXX placeholder API key) native ortamda Paddle CDN'den yüklenmeye çalışıyordu. Paddle web checkout olduğu için native'de çalışmaz.

**Çözüm:** Native ortamda Paddle fallback kaldırıldı:
```javascript
if (isNative && window.revenuecat) {
    var rcOk = await window.revenuecat.init();
    if (!rcOk) {
        console.warn('[Premium] RevenueCat başlatılamadı — native ortamda Paddle kullanılamaz');
    }
}
```

#### 3e. initMain() Hata Yakalama Eksikliği
`cosmic_match.html`'deki `initMain()` fonksiyonu try/catch olmadan çalışıyordu. Herhangi bir async hata sayfayı çökertebiliyordu.

**Çözüm:** `initMain()` try/catch ile sarıldı.

---

## 4. Android Assets Sync Sorunu

**Sorun:** Yapılan JS/HTML değişiklikleri Android cihazda yansımıyordu. Debug paneli hâlâ görünüyordu.

**Neden:** `npx cap sync android` çalıştırılmadan Android Studio'da sadece Clean/Build yapılmıştı. Capacitor uygulamalarında web dosyaları `android/app/src/main/assets/public/` klasöründedir. Bu dosyalar `npx cap sync` ile güncellenir; Gradle build sadece Java/Kotlin tarafını derler.

**Çözüm:** Güncel web dosyaları doğrudan assets klasörüne kopyalandı:
```bash
cp cosmic_match.html android/app/src/main/assets/public/
cp js/auth.js android/app/src/main/assets/public/js/
cp js/premium.js android/app/src/main/assets/public/js/
```

**Not:** Bu dosyalar `.gitignore`'da olduğu için commit edilemiyor. Normal akışta `npx cap sync android` komutu bu kopyalamayı otomatik yapar.

---

## Değişen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `android/app/build.gradle` | Kotlin exclude + flatDir kaldırıldı |
| `js/auth.js` | onAuthStateChange ile session bekleme |
| `js/premium.js` | platformReady promise, maybeSingle, native Paddle kaldırıldı |
| `cosmic_match.html` | Debug panel kaldırıldı, try/catch eklendi |

## Önemli Not: Capacitor Web → Android Akışı

```
Web dosyaları (js/, *.html) değiştirilir
        ↓
npx cap sync android    ← BU ADIM ZORUNLU
        ↓
android/app/src/main/assets/public/ güncellenir
        ↓
Android Studio → Clean + Run
```

`npx cap sync` yapılmadan Android Studio'da build yapmak eski web dosyalarını kullanır.
