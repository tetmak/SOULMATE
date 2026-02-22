# Session Context — RevenueCat Paywall Integration

Bu dosya, yeni bir Claude Code oturumuna bağlam aktarmak için hazırlanmıştır.

---

## Proje Bilgisi

- **Proje:** SOULMATE (Numerael) — Capacitor + Android native uygulama
- **Branch:** `claude/revenucat-paywall-integration-4zW1N`
- **Teknolojiler:** HTML/JS (vanilla), Supabase, Capacitor, RevenueCat, Paddle (web)
- **Android build:** Gradle 8.13, compileSdk 36, Java 21

---

## Yapılan Değişiklikler (Bu Oturumda)

### 1. `android/app/build.gradle`
- Kotlin stdlib duplicate class hatası düzeltildi (`kotlin-stdlib-jdk7` ve `jdk8` exclude)
- Kullanılmayan `flatDir` repository bloğu kaldırıldı

### 2. `js/auth.js` (Satır 115-141)
- **Sorun:** `DOMContentLoaded`'da hemen `getSession()` çağırılıyordu → Supabase session henüz recover olmadan `null` dönüyordu → zincirleme redirect: cosmic_match → sign_up → home
- **Çözüm:** `onAuthStateChange(INITIAL_SESSION)` event bekleniyor, 3s fallback timeout var
- `checkSession()` fonksiyonu değişmedi, sadece çağrılma zamanlaması değişti

### 3. `js/premium.js`
- `platformInit()` artık `platformReady` promise'ine atanıyor (satır 471)
- `checkPremiumStatus()` artık `await platformReady` yapıyor (satır 155) — RC init'in bitmesini bekliyor
- Supabase subscriptions sorgusu `.single()` → `.maybeSingle()` (satır 171)
- Native'de RC başarısız olunca Paddle CDN yüklenmesi kaldırıldı (native'de Paddle çalışmaz)
- `waitReady()` metodu eklendi (satır 515)

### 4. `cosmic_match.html`
- Debug paneli ve tüm debug kodları kaldırıldı
- `initMain()` try/catch ile sarıldı (satır 446-484)

---

## Devam Eden / Çözülmemiş Sorun

### Cosmic Match sayfası hâlâ anasayfaya yönlendiriyor olabilir
- Dosya değişiklikleri yapıldı ve Android assets'e kopyalandı
- Kullanıcı henüz test edemedi (son test hâlâ eski dosyaları kullanıyordu)
- **ÖNEMLİ:** `android/app/src/main/assets/public/` klasörü `.gitignore`'da. Web dosyaları değişince bu klasör otomatik güncellenmez. Ya `npx cap sync android` çalıştırılmalı ya da dosyalar manuel kopyalanmalı.

### RevenueCat API Key'leri placeholder
- `js/revenuecat.js` satır 21-22'de API key'ler `appl_XXXXXXXXXXXXXXXXXXXXXXX` ve `goog_XXXXXXXXXXXXXXXXXXXXXXX` olarak duruyor
- Bu yüzden `initRevenueCat()` her zaman `false` dönüyor
- Gerçek key'ler olmadan RC çalışmaz, premium kontrol sadece Supabase fallback'ine düşer

---

## Önemli Dosya Konumları

| Dosya | Açıklama |
|-------|----------|
| `js/auth.js` | Auth + session yönetimi, checkSession redirect logic |
| `js/premium.js` | Premium kontrol, Paddle (web), RevenueCat bridge, paywall UI |
| `js/revenuecat.js` | RevenueCat native entegrasyon (Capacitor Purchases plugin) |
| `js/discovery-engine.js` | Cosmic Match eşleşme motoru, streak, reveal sistemi |
| `cosmic_match.html` | Eşleşme sayfası UI + logic |
| `android/app/build.gradle` | Android build config |
| `android/app/src/main/assets/public/` | Capacitor web assets (gitignore'da) |

---

## Capacitor Sync Akışı (Kritik)

```
1. Web dosyalarını değiştir (js/, *.html)
2. npx cap sync android          ← ZORUNLU
3. Android Studio → Clean + Run
```

`npx cap sync` yapılmadan Android'de eski dosyalar çalışır. Alternatif olarak dosyalar doğrudan `android/app/src/main/assets/public/` altına kopyalanabilir.

---

## Auth Redirect Akışı (Mevcut)

```
DOMContentLoaded
  ├── auth.js: onAuthStateChange bekle → INITIAL_SESSION → checkSession()
  │     ├── session var + auth page → home'a yönlendir
  │     ├── session var + protected page → localStorage hydrate
  │     └── session yok + protected page → sign_up'a yönlendir
  │
  └── cosmic_match.html handler:
        ├── await getSession() → userId al
        ├── userId yok → sign_up'a yönlendir
        ├── user data yok → birth_form'a yönlendir
        └── OK → initMain()
              ├── await premium.checkStatus() (RC + Supabase)
              ├── streak güncelle
              ├── günlük eşleşme bul
              ├── radar render
              └── geçmiş eşleşmeler render
```

---

## Premium Kontrol Akışı (Mevcut)

```
premium.checkStatus()
  ├── 1. localStorage cache kontrolü (sync, hızlı)
  ├── 2. await platformReady (RC veya Paddle init bitmesini bekle)
  ├── 3. RC native + ready → checkEntitlements()
  └── 4. Supabase subscriptions tablosu (fallback)
```
