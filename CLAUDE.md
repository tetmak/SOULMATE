# CLAUDE.md

Bu dosya Claude Code (claude.ai/code) için proje rehberidir.

## Proje Özeti

**Soulnum (SOULMATE)** — Türkçe numeroloji, enerji rehberliği ve ruh eşi eşleştirme mobil uygulaması. Vanilla HTML/JS frontend, Capacitor ile iOS/Android native sarmalama, Vercel serverless API, Supabase backend.

## Build & Geliştirme Komutları

```bash
# Web asset'lerini www/ dizinine kopyala
npm run build                    # scripts/build.js çalıştırır → HTML, JS, asset'leri www/'ye kopyalar

# Native platformlara sync (web dosyası değiştirdikten sonra ZORUNLU)
npm run cap:sync                 # npx cap sync — www/ → android/app/src/main/assets/public/
npm run cap:build                # build + sync tek adımda

# Native IDE'leri aç
npm run cap:open:android
npm run cap:open:ios
```

**Kritik workflow**: Web dosyaları (HTML, JS) proje kökünde yaşar. Düzenledikten sonra native uygulamada görünmesi için `npm run cap:sync` (veya `npm run cap:build`) çalıştırılmalıdır. `www/` dizini `.gitignore`'da.

## Mimari

### Frontend (Framework yok)
- ~39 HTML sayfası proje kökünde, her biri kendi inline `<script>` bloklarına sahip
- Paylaşılan JS modülleri `<script src="js/...">` tag'leriyle yüklenir (bundler/import yok)
- Tüm JS `var` kullanır ve `window` objesine bağlar — ES module yok
- Tailwind CSS runtime JIT (`js/tailwind.min.js`)
- Supabase JS SDK v2 bundle olarak (`js/supabase.min.js`)

### JS Modülleri (`js/`)

| Modül | Export | Rol |
|-------|--------|-----|
| `supabase-config.js` | `window.supabaseClient` | Supabase client oluşturur — her şeyden önce yüklenmeli |
| `auth.js` | `window.auth` | Kayıt/giriş/çıkış, session recovery (`INITIAL_SESSION`), sayfa yönlendirme |
| `premium.js` | `window.premium` | Abonelik yönetimi: Paddle (web) + Play Billing (native), paywall UI, feature gate |
| `play-billing.js` | `window.billing` | Google Play Billing Library doğrudan entegrasyon (native Android satın alma) |
| `api-base.js` | `window.__NUMERAEL_API_BASE` | API base URL — web'de boş, native'de Vercel URL |
| `numerology-engine.js` | `window.NumerologyEngine` | Pisagor numeroloji hesaplamaları (Türkçe karakter desteği), AI analiz |
| `discovery-engine.js` | `window.DiscoveryEngine` | Cosmic Match: günlük eşleştirme, streak sistemi, reveal gating |
| `compatibility-engine.js` | `window.CompatibilityEngine` | İki kişi arası çok boyutlu uyumluluk skorlama + AI analiz |
| `ai-content.js` | — | Tüm sayfalarda AI içerik üretimi (OpenAI gpt-4o-mini) |
| `numerology-ai.js` | `window.NumerologyAI` | Decision Sphere: sayısal karar zamanlama chatbot'u |
| `gamification-engine.js` | `window.GamificationEngine` | XP, rütbe, günlük görev, rozet, leaderboard, kozmik sandık |
| `notification-engine.js` | `window.NotificationEngine` | Uygulama içi bildirimler (Supabase realtime) |
| `connection-engine.js` | `window.ConnectionEngine` | Kullanıcılar arası bağlantı istekleri ve mesajlaşma |
| `decision-timing-engine.js` | `window.DecisionTimingEngine` | Deterministik karar zamanlama motoru |
| `numerology-context-engine.js` | `window.NumerologyContextEngine` | Kişisel yıl/ay/gün hesaplama, bağlam zenginleştirme |
| `profile.js` | `window.profile` | Profil CRUD, Life Path hesaplama, connections yönetimi |
| `avatar.js` | `window.avatarUtil` | Avatar URL çözümleme, cinsiyete göre varsayılan avatar |
| `avatar-upload.js` | `window.avatarUpload` | Fotoğraf seçme (Capacitor Camera / file input) + Supabase Storage upload |
| `bottom-nav.js` | — | Alt navigasyon barı |
| `accordion-ai.js` | — | Accordion AI içerik yükleme |

### Backend

#### Supabase
- **Auth**: Email/password + Google OAuth
- **Session key**: `numerael-auth-token`
- **URL**: `https://cxkyyifqxbwidseofbgk.supabase.co`

#### Veritabanı Tabloları (PostgreSQL)

| Tablo | Amaç |
|-------|-------|
| `profiles` | Kullanıcı profilleri (full_name, birth_date, gender, avatar_url) |
| `subscriptions` | Premium abonelik durumu (plan, status, expires_at, payment_provider) |
| `discovery_profiles` | Cosmic Match opt-in profilleri (numeroloji sayıları, avatar_url dahil) |
| `daily_matches` | Günlük eşleştirmeler (user_id, matched_user_id, score, revealed) |
| `user_streaks` | Giriş streak'leri ve reveal kredileri |
| `user_gamification` | Gamification profili (NBP, XP, rütbe, rozet, haftalık XP) |
| `leaderboard_history` | Haftalık leaderboard snapshot'ları |
| `quiz_results` | Quiz sonuçları (solo/duel) |
| `connection_requests` | Arkadaşlık istekleri (pending/accepted/rejected) |
| `connections` | Bidirectional bağlantılar |
| `messages` | Kullanıcılar arası mesajlar (realtime) |
| `notifications` | Bildirimler (connection_request, new_message, limit_hit) |

#### Supabase Storage
- **`avatars` bucket**: Kullanıcı profil fotoğrafları. RLS ile her kullanıcı kendi klasörüne yazar/okur.

Tüm tablolarda RLS (Row Level Security) aktif. SQL şemaları:
- `supabase_cosmic_match_migration.sql`
- `sql/connection_messaging_schema.sql`
- `sql/notifications_schema.sql`
- `sql/avatar_storage_migration.sql`

#### Vercel Serverless API (`api/`)

| Endpoint | Rol |
|----------|-----|
| `openai.js` | OpenAI proxy — API key server-side eklenir |
| `paddle-webhook.js` | Paddle webhook handler — abonelik olaylarını Supabase'e yazar |
| `revenuecat-webhook.js` | RevenueCat webhook handler (eski, artık frontend'den çağrılmıyor) |
| `delete-account.js` | Hesap silme bilgi sayfası (app store gereksinimi) |
| `privacy-policy.js` | Gizlilik politikası sayfası (app store gereksinimi) |

**Vercel Environment Variables**:
- `OPENAI_API_KEY` — OpenAI API anahtarı
- `SUPABASE_URL` — Supabase proje URL'i
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (webhook'lar için)
- `PADDLE_WEBHOOK_SECRET` — Paddle webhook imza doğrulama
- `REVENUECAT_WEBHOOK_SECRET` — RevenueCat webhook auth key

**Vercel Production URL**: `https://soulmate-kohl.vercel.app`

### Native (Capacitor)
- **App ID**: `com.numerael.soulmate`
- **App Name**: `Soulnum`
- **webDir**: `www`
- **androidScheme**: `https`
- **iOS scheme**: `Soulnum`
- **Android**: Gradle, compileSdk 36, Capacitor Android v8.1.0
- **iOS**: Xcode projesi `ios/App/` altında, `contentInset: automatic`, `preferredContentMode: mobile`
- **Splash Screen**: Arka plan `#0a0a1a`, 2s gösterim, immersive
- **Status Bar**: Dark stil, `#0a0a1a` arka plan

#### Capacitor Eklentileri
- `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`
- `@capacitor/splash-screen`, `@capacitor/status-bar`
- `@capacitor/camera` — Avatar fotoğraf seçimi için
- `PlayBillingPlugin` — Custom native plugin (Google Play Billing Library)

## Ödeme Sistemi

### Dual Platform Yaklaşım
- **Web**: Paddle.js v2 overlay checkout
- **Native (Android)**: Google Play Billing Library (doğrudan, `PlayBillingPlugin` native bridge)
- **Native (iOS)**: Henüz entegre edilmedi

### Paddle (Web)
- **Ortam**: Sandbox (test modu)
- **Client Token**: `test_1917c8739eeec42ab948b39da0d`
- **Aylık Fiyat ID**: `pri_01khyq04yfrd52w6qn8bar13q1`
- **Yıllık Fiyat ID**: `pri_01khyq0rwvw8cttc184xas0h5t`
- **Webhook URL**: `https://soulmate-kohl.vercel.app/api/paddle-webhook`
- **İşlenen olaylar**: subscription.created, subscription.updated, subscription.canceled, subscription.past_due, subscription.activated, transaction.completed

### Google Play Billing (Native Android)
- **Ürünler**: `numerael_premium_monthly`, `numerael_premium_yearly`
- **Entegrasyon**: `js/play-billing.js` → `window.billing` → `PlayBillingPlugin` (Capacitor native bridge)
- **RevenueCat kaldırıldı** — Doğrudan Google Play Billing Library kullanılıyor

### Premium Durum Kontrol Sırası
1. `EVERYONE_IS_PREMIUM` flag (geçici — Google Developer onayı beklenirken `true`)
2. localStorage cache (`numerael_premium`) → hızlı, offline çalışır
3. `window.billing.checkEntitlements()` (Play Billing, sadece native) → gerçek zamanlı store durumu
4. Supabase `subscriptions` tablosu → tüm platformlar için fallback

**NOT**: `EVERYONE_IS_PREMIUM = true` geçici flag'i `premium.js` içinde aktif. Tüm kullanıcılar şu an premium olarak işlem görüyor.

### Fiyatlandırma
- Aylık: ₺79.99/ay
- Yıllık: ₺599.99/yıl (₺49.99/ay — %37 tasarruf)

### Free Limitler
- 3 bağlantı (kendi profil + 2 arkadaş)
- Ayda 2 uyumluluk analizi
- Ayda 5 niyet (manifest portal)
- Günde 1 niyet (tüm kullanıcılar)
- Deep Insight sadece 1. sayfa
- AI günlük rehber: yok
- Cosmic Match reveal: yok
- Friendship Dynamics: yok

### Dev/Test Araçları
```javascript
premium.simulate(30)   // 30 günlük premium simüle et
premium.clear()        // Premium durumunu temizle
premium.isPremium()    // Durum kontrol
```

## Auth & Session Akışı

Sayfalar auth (sign_up, splash, onboarding) veya korumalı olarak sınıflandırılır. `auth.js` her sayfada `DOMContentLoaded`'da çalışır:

1. `onAuthStateChange('INITIAL_SESSION')` event'ini bekler (3s timeout)
2. Session var + auth sayfasında → `mystic_numerology_home_1.html`'e yönlendir
3. Session yok + korumalı sayfada → `mystic_sign_up_screen.html`'e yönlendir

**Kritik**: Sadece `INITIAL_SESSION` event'inde `checkSession()` çağrılır. `SIGNED_IN`/`SIGNED_OUT` event'lerinde çağrılmaz (race condition'ı önlemek için — yeni kullanıcılar birth form'u göremiyordu).

**Auth sayfaları**: `mystic_splash_screen.html`, `cosmic_onboarding_welcome.html`, `mystic_sign_up_screen.html`, `branded_celestial_splash_screen.html`, `index.html`

**Public sayfalar**: Auth sayfaları + `data-ready_birth_form.html`

**authReady promise**: `auth.whenReady()` — diğer sayfalar session kontrolünden önce bunu beklemeli.

## Native Platform Algılama

`api-base.js` ve çoğu engine native ortamı şu şekilde algılar:
```javascript
var isNative = window.location.protocol === 'capacitor:' ||
               window.location.protocol === 'ionic:' ||
               window.location.hostname === 'localhost' ||
               window.location.protocol === 'file:' ||
               (typeof window.Capacitor !== 'undefined' &&
                window.Capacitor.isNativePlatform &&
                window.Capacitor.isNativePlatform());
```
Native'de API çağrıları `https://soulmate-kohl.vercel.app` üzerinden gider.

## AI Entegrasyonu

- **Model**: OpenAI `gpt-4o-mini`
- **Proxy**: Tüm AI çağrıları `/api/openai` serverless endpoint'i üzerinden yapılır (API key server-side)
- **Kullanım alanları**:
  - Kişisel numeroloji analizleri (soul, personality, life path, full)
  - Uyumluluk analizleri (cosmic, soul_urge, personality, life_path, karmic, communication, full_compat)
  - Decision Sphere chatbot (karar zamanlama açıklamaları)
  - Sayfa bazlı dinamik içerik üretimi (ai-content.js)
- **Cache**: localStorage (kalıcı) + sessionStorage (geçici) ile AI yanıtları cache'lenir

## Gamification Sistemi

### Rütbeler (NBP bazlı)
1. Çaylak Kaşif (0 NBP) → Yıldız Öğrencisi (100) → Sayı Savaşçısı (300) → Sayısal Rehber (600) → Usta Numerolog (1000) → Yıldız Bilgesi (2000) → Sayısal Kahin (3500)

### XP Kaynakları
- Uygulama açma: 5 XP, günlük okuma: 10, uyumluluk: 20, arkadaş ekle: 25, streak günü: 15, görev tamamla: 30, tüm görevler: 100 bonus

### NBP = XP × 0.7
- Rütbe yükselmesi ödül verir (premium günleri)
- Her gün 3 rastgele günlük görev atanır
- Tüm görevler tamamlanınca Kozmik Sandık açılır

## Numeroloji Motoru

### Pisagor Sistemi (Türkçe)
```
1: A, J, S, Ş | 2: B, K, T | 3: C, Ç, L, U, Ü | 4: D, M, V
5: E, N, W | 6: F, O, Ö, X | 7: G, Ğ, P, Y | 8: H, Q, Z | 9: I, İ, R
```

### Hesaplanan Sayılar
- **Kader Yolu (Life Path)**: Doğum tarihi rakamlarının toplamı
- **İfade (Expression)**: İsmin tüm harflerinin toplamı
- **Ruh Güdüsü (Soul Urge)**: İsmin sesli harflerinin toplamı
- **Kişilik (Personality)**: İsmin sessiz harflerinin toplamı
- **Üstat Sayılar**: 11, 22, 33 — indirgenmez

### Uyumluluk
- 4 boyutlu skor: Life Path (%35) + Soul Urge (%30) + Personality (%20) + Expression (%15)
- Önceden tanımlı uyum matrisi (1-1 ile 33-33 arası tüm çiftler)

## Sayfa Yapısı & Navigasyon

### Navigasyon Mimarisi
- **Alt navigasyon (bottom-nav)**: Ana Sayfa → Cosmic Match → Manifest (manifest_community.html) → Profil
- **Bubble menü (ana sayfa)**: Manifest Portal (manifest_portal.html), Uyumluluk, Quiz, vb.

### Ana Sayfalar
| Sayfa | Amaç |
|-------|-------|
| `index.html` | Splash'e yönlendirme |
| `mystic_splash_screen.html` | Giriş splash ekranı |
| `branded_celestial_splash_screen.html` | Markalı splash ekranı |
| `mystic_sign_up_screen.html` | Kayıt/giriş |
| `cosmic_onboarding_welcome.html` | Onboarding |
| `data-ready_birth_form.html` | Doğum tarihi/isim formu |
| `mystic_numerology_home_1.html` | Ana sayfa |
| `daily_spiritual_guide.html` | Günlük ruhsal rehber |
| `daily_number_deep_dive.html` | Günlük sayı derinlemesine |
| `cosmic_match.html` | Günlük eşleştirme |
| `cosmic_energy_calendar_2.html` | Kozmik enerji takvimi |
| `name_numerology_breakdown_1.html` | Kişisel numeroloji analizi |
| `name_numerology_breakdown_2.html` | Çift uyumluluk detay (karmik bağ) |
| `name_numerology_breakdown_3.html` | Çift uyumluluk özet |
| `relationship_compatibility_analysis.html` | İlişki uyumluluk analizi |
| `compatibility_input_form.html` | Uyumluluk giriş formu |
| `friendship_dynamics.html` | Arkadaşlık dinamiği analizi |
| `manifest_portal.html` | Manifest Portal ana hub sayfası |
| `manifest_community.html` | Topluluk manifest akışı (bottom nav tab) |
| `cosmic_manifest_portal.html` | Eski niyet portalı (hâlâ mevcut, navigasyondan kaldırıldı) |
| `profile_soul_journey.html` | Profil ve ruh yolculuğu |
| `connections_shared_readings.html` | Bağlantılar ve paylaşılan okumalar |
| `premium_checkout_summary.html` | Premium ödeme özeti |
| `premium_crystal_store.html` | Premium kristal mağaza |
| `app_settings_preferences.html` | Uygulama ayarları |
| `leaderboard.html` | Leaderboard/sıralama |
| `numerology_quiz.html` | Numeroloji quiz |
| `wheel_of_destiny.html` | Kader çarkı |
| `wheel_reward_success.html` | Çark ödül ekranı |
| `lunar_phase_energy_tracker.html` | Ay fazı enerji takibi |
| `messaging.html` | Mesajlaşma |
| `kisi_profil.html` | Kişi profili |
| `numerology_meaning_chart.html` | Numeroloji anlam tablosu |
| `letter_vibration_detail.html` | Harf titreşim detayı |
| `past_reading_archive_detail.html` | Geçmiş okuma arşivi |
| `soul_mate_loading.html` | Eşleşme yükleniyor |
| `cosmic_calculation_loading.html` | Hesaplama yükleniyor |
| `kader_app_ui_design_system_2.html` | UI tasarım sistemi / bildirim şablonları (dahili referans) |

## Vercel Yapılandırması

`vercel.json`: Kök URL (`/`) `mystic_splash_screen.html`'e yönlendirilir.

## localStorage Anahtarları

| Anahtar | İçerik |
|---------|--------|
| `numerael-auth-token` | Supabase session |
| `numerael_user_data` | Kullanıcı profil verisi (name, birthDate, gender) |
| `numerael_premium` | Premium cache (active, plan, expires_at, source) |
| `numerael_gamification` | Gamification state (NBP, XP, quests, badges) |
| `numerael_discovery_opted_in` | Cosmic Match opt-in durumu |
| `numerael_connections_{userId}` | Arkadaş bağlantıları |
| `numerael_compat_data` | Uyumluluk analiz verileri |
| `numerael_compat_ai_v2__*` | Uyumluluk AI cache |
| `numerael_usage_{feature}_{YYYY-MM}` | Aylık feature kullanım sayacı |
| `numerael_usage_{feature}_{YYYY-MM-DD}` | Günlük feature kullanım sayacı |

## Dil

Tüm kullanıcı arayüzü, bazı modüllerdeki değişken isimleri ve dokümantasyon **Türkçe**. Console log prefix'leri İngilizce: `[Premium]`, `[Auth]`, `[Billing]`, `[Avatar]`, `[Gamification]`, `[Discovery]`, `[Streak]`, `[Match]`.

## Kod Kuralları

- **JS stili**: `var` kullan, ES module yok, `window` objesine bağla
- **Yeni modül eklerken**: IIFE pattern `(function() { 'use strict'; ... })()` kullan
- **Global export**: `window.moduleName = { ... }` formatında
- **Native API çağrıları**: Her zaman `API_BASE + '/api/...'` pattern'i kullan
- **Türkçe karakter desteği**: `[A-ZÇĞİIÖŞÜ]` regex pattern'i kullan
- **Supabase RLS**: Yeni tablo eklerken RLS policy'lerini unutma
