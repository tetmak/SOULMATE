# Soulnum (SOULMATE) — Uygulama Tanıtım Dosyası

> Bu dosya, herhangi bir yapay zeka asistanına projeyi tanıtmak ve bağlam sağlamak amacıyla hazırlanmıştır.
> Son güncelleme: 2026-03-01

---

## 1. Proje Özeti

**Soulnum**, Türkçe numeroloji, enerji rehberliği ve ruh eşi eşleştirme üzerine kurulu kapsamlı bir mobil uygulamadır. Pisagor numeroloji sistemi üzerine inşa edilmiş olup, kullanıcılara kişisel numeroloji analizleri, günlük ruhsal rehberlik, uyumluluk hesaplamaları, topluluk etkileşimi ve yapay zeka destekli içerik sunar.

### Temel Bilgiler

| Bilgi | Detay |
|-------|-------|
| **Uygulama Adı** | Soulnum |
| **Paket Adı** | `com.numerael.soulmate` |
| **Dil Desteği** | 8 dil (Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Arapça, Rusça, Portekizce) |
| **Platform** | iOS, Android (Capacitor), Web |
| **Frontend** | Vanilla HTML/CSS/JavaScript (framework yok) |
| **CSS** | Tailwind CSS (JIT runtime) |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Serverless API** | Vercel Functions |
| **AI Motoru** | OpenAI gpt-4o-mini |
| **Ödeme** | Paddle (web), Google Play Billing (Android native) |
| **Production URL** | https://soulmate-kohl.vercel.app |

---

## 2. Mimari Yapı

### 2.1 Frontend Mimarisi

Uygulama **framework kullanmayan** saf HTML/JS mimarisine sahiptir:

- **~39 HTML sayfası** proje kökünde, her biri kendi inline `<script>` bloklarına sahip
- **Paylaşılan JS modülleri** `<script src="js/...">` tag'leriyle yüklenir — bundler veya import sistemi yok
- Tüm JavaScript `var` kullanır ve `window` objesine bağlanır — ES module kullanılmaz
- **Tailwind CSS** runtime JIT (`js/tailwind.min.js`) ile stillendirilir
- **Supabase JS SDK v2** bundle olarak (`js/supabase.min.js`) dahil edilir

### 2.2 Backend Mimarisi

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend        │────▶│  Vercel API       │────▶│   OpenAI         │
│   (HTML/JS)       │     │  (Serverless)     │     │   gpt-4o-mini    │
│                   │     └──────────────────┘     └──────────────────┘
│                   │
│                   │────▶┌──────────────────────────────────────────┐
│                   │     │           Supabase                       │
│                   │     │  ┌────────┐ ┌────────┐ ┌──────────────┐ │
│                   │     │  │  Auth  │ │Database│ │   Storage    │ │
│                   │     │  │(Email+ │ │(Postgre│ │  (Avatars)   │ │
│                   │     │  │Google) │ │  SQL)  │ │              │ │
│                   │     │  └────────┘ └────────┘ └──────────────┘ │
│                   │     │  ┌──────────────────────────────────┐   │
│                   │     │  │         Realtime                  │   │
│                   │     │  │  (Mesajlar, Bildirimler, Bağ.)   │   │
│                   │     │  └──────────────────────────────────┘   │
└──────────────────┘     └──────────────────────────────────────────┘
```

### 2.3 Native Sarmalama (Capacitor)

- **Android**: Capacitor Android v8.1.0, compileSdk 36, `https://` scheme
- **iOS**: Xcode projesi, `Soulnum://` scheme, `contentInset: automatic`
- **webDir**: `www/` — build sonrası HTML/JS buraya kopyalanır
- **Splash Screen**: `#0a0a1a` arka plan, 2 saniye, immersive mod
- **Status Bar**: Dark stil, `#0a0a1a` arka plan

### 2.4 Capacitor Eklentileri

| Eklenti | Kullanim |
|---------|----------|
| `@capacitor/splash-screen` | Uygulama acilis ekrani |
| `@capacitor/status-bar` | Durum cubugu yonetimi |
| `@capacitor/camera` | Avatar fotografı secimi |
| `PlayBillingPlugin` | Google Play Billing Library (native bridge) |

---

## 3. Sayfa Yapisi ve Navigasyon

### 3.1 Kullanici Akisi

```
Splash → Kayit/Giris → Onboarding → Dogum Formu → Ana Sayfa
                                                       │
                    ┌──────────┬──────────┬─────────────┤
                    ▼          ▼          ▼             ▼
              Numeroloji   Cosmic     NuFest        Profil
              Analiz       Match      Portal        Ayarlar
                │            │          │             │
                ▼            ▼          ▼             ▼
              Uyumluluk   Eslesmeler  Topluluk     Baglantilar
              Karsilastir  Harita     Niyetler     Mesajlasma
```

### 3.2 Alt Navigasyon (Bottom Nav)

4 ana sekme:
1. **Ana Sayfa** (`mystic_numerology_home_1.html`) — Bubble menu ile tum ozelliklere erisim
2. **NuConnect** (`cosmic_match.html`) — Gunluk eslesmeler ve harita
3. **NuFest** (`manifest_community.html`) — Topluluk niyet akisi
4. **Profil** (`profile_soul_journey.html`) — Kisisel profil ve baglanti yonetimi

### 3.3 Tum Sayfalar (38 adet)

#### Giris Akisi
| Sayfa | Amac |
|-------|------|
| `index.html` | Splash'e yonlendirme |
| `mystic_splash_screen.html` | Giris splash ekrani |
| `branded_celestial_splash_screen.html` | Markali splash ekrani |
| `mystic_sign_up_screen.html` | Email/sifre kayit + Google OAuth |
| `cosmic_onboarding_welcome.html` | Onboarding carousel |
| `data-ready_birth_form.html` | Dogum tarihi ve isim formu |

#### Numeroloji ve Analiz
| Sayfa | Amac |
|-------|------|
| `mystic_numerology_home_1.html` | Ana sayfa hub'i |
| `name_numerology_breakdown_1.html` | Kisisel numeroloji analizi (Life Path, Karmic Bond) |
| `name_numerology_breakdown_2.html` | Cift uyumluluk detay (karmik bag) |
| `name_numerology_breakdown_3.html` | Cift uyumluluk ozet |
| `daily_spiritual_guide.html` | Gunluk ruhsal rehber (AI destekli) |
| `daily_number_deep_dive.html` | Gunluk sayi derinlemesine analiz |
| `numerology_meaning_chart.html` | Numeroloji anlam tablosu (1-33) |
| `letter_vibration_detail.html` | Harf titresim detayi |
| `cosmic_energy_calendar_2.html` | Kozmik enerji takvimi |
| `lunar_phase_energy_tracker.html` | Ay fazi enerji takibi |

#### Uyumluluk
| Sayfa | Amac |
|-------|------|
| `compatibility_input_form.html` | Partner isim/dogum tarihi girisi |
| `relationship_compatibility_analysis.html` | Cok boyutlu uyumluluk analizi |
| `friendship_dynamics.html` | Arkadaslik dinamigi analizi |
| `past_reading_archive_detail.html` | Gecmis okuma arsivi |

#### Cosmic Match ve Sosyal
| Sayfa | Amac |
|-------|------|
| `cosmic_match.html` | Gunluk eslesmeler + sehir haritasi |
| `connections_shared_readings.html` | Baglantilar ve paylasilan okumalar |
| `messaging.html` | 1-1 gercek zamanli mesajlasma |
| `kisi_profil.html` | Diger kullanicilarin profili |
| `soul_mate_loading.html` | Eslestirme yukleme ekrani |

#### Manifest (NuFest) Portal
| Sayfa | Amac |
|-------|------|
| `manifest_portal.html` | Niyet olusturma hub'i |
| `manifest_community.html` | Topluluk niyet akisi + begeni |
| `cosmic_manifest_portal.html` | Eski niyet portali (legacy) |

#### Gamification
| Sayfa | Amac |
|-------|------|
| `leaderboard.html` | Haftalik siralama |
| `numerology_quiz.html` | Numeroloji quiz (solo/duel) |
| `wheel_of_destiny.html` | Kader carki (odul cekimi) |
| `wheel_reward_success.html` | Cark odul ekrani |

#### Premium ve Ayarlar
| Sayfa | Amac |
|-------|------|
| `premium_checkout_summary.html` | Odeme ozeti |
| `premium_crystal_store.html` | Premium ozellikler vitrini |
| `app_settings_preferences.html` | Dil, tema, hesap ayarlari |
| `profile_soul_journey.html` | Profil ve ruh yolculugu |

#### Sistem
| Sayfa | Amac |
|-------|------|
| `cosmic_calculation_loading.html` | Hesaplama yukleme ekrani |
| `kader_app_ui_design_system_2.html` | Dahili UI tasarim referansi |

---

## 4. JavaScript Modulleri

### 4.1 Modul Listesi (27 dosya)

| Modul | Global Export | Rol |
|-------|-------------|-----|
| `supabase-config.js` | `window.supabaseClient` | Supabase client olusturma — her seyden once yuklenir |
| `auth.js` | `window.auth` | Kayit/giris/cikis, session recovery, sayfa yonlendirme |
| `api-base.js` | `window.__NUMERAEL_API_BASE` | API base URL — web'de bos, native'de Vercel URL |
| `premium.js` | `window.premium` | Abonelik yonetimi, paywall UI, feature gate |
| `play-billing.js` | `window.billing` | Google Play Billing Library native bridge |
| `numerology-engine.js` | `window.NumerologyEngine` | Pisagor numeroloji hesaplamalari (Turkce karakter destegi) |
| `numerology-ai.js` | `window.NumerologyAI` | Decision Sphere: sayisal karar zamanlama chatbot'u |
| `numerology-context-engine.js` | `window.NumerologyContextEngine` | Kisisel yil/ay/gun hesaplama, baglam zenginlestirme |
| `discovery-engine.js` | `window.DiscoveryEngine` | Cosmic Match: gunluk eslestirme, streak sistemi, reveal |
| `compatibility-engine.js` | `window.CompatibilityEngine` | Cok boyutlu uyumluluk skorlama + AI analiz |
| `gamification-engine.js` | `window.GamificationEngine` | XP, rutbe, gunluk gorev, rozet, leaderboard, kozmik sandik |
| `manifest-engine.js` | `window.ManifestEngine` | Niyet CRUD + topluluk akisi + begeni sistemi |
| `connection-engine.js` | `window.ConnectionEngine` | Baglanti istekleri, arkadas yonetimi, kullanici arama |
| `notification-engine.js` | `window.NotificationEngine` | Gercek zamanli bildirimler (Supabase realtime) |
| `decision-timing-engine.js` | `window.DecisionTimingEngine` | Deterministik karar zamanlama motoru |
| `profile.js` | `window.profile` | Profil CRUD, Life Path hesaplama |
| `avatar.js` | `window.avatarUtil` | Avatar URL cozumleme, cinsiyete gore varsayilan avatar |
| `avatar-upload.js` | `window.avatarUpload` | Fotograf secme (Camera/file input) + Supabase Storage upload |
| `ai-content.js` | — | Sayfa bazli AI icerik uretimi (tum sayfalarda) |
| `accordion-ai.js` | — | Accordion UI ile lazy-loaded AI icerik |
| `bottom-nav.js` | — | Alt navigasyon bari |
| `i18n-engine.js` | `window.i18n` | 8 dil destegi, 350+ ceviri anahtari |
| `theme-engine.js` | `window.themeEngine` | Light/dark mod gecisi + sistem tercihi |
| `soulmate-share.js` | — | Web Share API ile kart paylasimi |
| `turkish-cities.js` | `window.TURKISH_CITIES` | 81 il koordinat veritabani (harita icin) |
| `tailwind.min.js` | — | Tailwind CSS JIT runtime |
| `supabase.min.js` | — | Supabase JS SDK v2 bundle |

### 4.2 Modul Yukleme Sirasi

```html
<!-- 1. Altyapi -->
<script src="js/supabase.min.js"></script>
<script src="js/supabase-config.js"></script>
<script src="js/api-base.js"></script>
<script src="js/auth.js"></script>

<!-- 2. i18n ve Tema -->
<script src="js/i18n-engine.js"></script>
<script src="js/theme-engine.js"></script>

<!-- 3. Is Mantigi (sayfa bazli) -->
<script src="js/numerology-engine.js"></script>
<script src="js/compatibility-engine.js"></script>
<script src="js/discovery-engine.js"></script>
<!-- ... -->

<!-- 4. UI -->
<script src="js/bottom-nav.js"></script>
```

### 4.3 Kod Kurallari

- **JS stili**: `var` kullanilir, `let`/`const` tercih edilmez
- **Modul pattern**: IIFE — `(function() { 'use strict'; ... })()`
- **Global export**: `window.moduleName = { ... }` formatinda
- **ES module yok**: Tum moduller script tag ile yuklenir
- **Native API cagrilari**: `API_BASE + '/api/...'` pattern'i
- **Turkce karakter regex**: `[A-ZCGIIÖŞÜ]` pattern'i kullanilir

---

## 5. Veritabani Semasi (Supabase PostgreSQL)

### 5.1 Tablo Listesi

#### profiles
Kullanici temel bilgileri.
```sql
id          UUID PRIMARY KEY (auth.uid ile eslesen)
full_name   TEXT
birth_date  DATE
gender      TEXT ('male'/'female')
avatar_url  TEXT
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

#### subscriptions
Premium abonelik durumu.
```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES profiles(id)
plan             TEXT ('monthly'/'yearly')
status           TEXT ('active'/'canceled'/'past_due')
expires_at       TIMESTAMPTZ
payment_provider TEXT ('paddle'/'play_store')
paddle_subscription_id TEXT
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

#### discovery_profiles
Cosmic Match opt-in kullanicilari.
```sql
user_id         UUID PRIMARY KEY
full_name       TEXT
birth_date      DATE
gender          TEXT
life_path       INTEGER
expression_num  INTEGER
soul_urge       INTEGER
personality_num INTEGER
avatar_url      TEXT
discoverable    BOOLEAN DEFAULT true
city            TEXT
city_lat        DOUBLE PRECISION
city_lng        DOUBLE PRECISION
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### daily_matches
Gunluk eslestirme sonuclari.
```sql
id              UUID PRIMARY KEY
user_id         UUID
matched_user_id UUID
score           INTEGER (0-100)
match_date      DATE
revealed        BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ
```

#### user_streaks
Giris serisi ve reveal kredileri.
```sql
user_id          UUID PRIMARY KEY
current_streak   INTEGER DEFAULT 0
longest_streak   INTEGER DEFAULT 0
last_visit_date  DATE
reveal_credits   INTEGER DEFAULT 0
total_reveals    INTEGER DEFAULT 0
```

#### user_gamification
Gamification profili.
```sql
user_id          UUID PRIMARY KEY
nbp              INTEGER DEFAULT 0   -- Numerical Base Points
total_xp         INTEGER DEFAULT 0
rank_id          TEXT DEFAULT 'novice'
unlocked_badges  JSONB DEFAULT '[]'
equipped_frame   TEXT
weekly_xp        INTEGER DEFAULT 0
daily_quests     JSONB  -- Gunluk gorev durumu
quest_streak     INTEGER DEFAULT 0
last_quest_date  DATE
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

#### leaderboard_history
Haftalik siralama snapshot'lari.
```sql
id             UUID PRIMARY KEY
week_start     DATE
user_id        UUID
display_name   TEXT
nbp_snapshot   INTEGER
rank_snapshot  TEXT
position       INTEGER
```

#### connection_requests
Arkadaslik istekleri.
```sql
id          UUID PRIMARY KEY
sender_id   UUID
receiver_id UUID
status      TEXT ('pending'/'accepted'/'rejected')
created_at  TIMESTAMPTZ
```

#### connections
Bidirectional arkadasliklar.
```sql
id       UUID PRIMARY KEY
user_a   UUID
user_b   UUID
created_at TIMESTAMPTZ
```

#### messages
Kullanicilar arasi mesajlar (Realtime).
```sql
id          UUID PRIMARY KEY
sender_id   UUID
receiver_id UUID
content     TEXT
created_at  TIMESTAMPTZ
is_read     BOOLEAN DEFAULT false
```

#### notifications
Uygulama ici bildirimler (Realtime).
```sql
id         UUID PRIMARY KEY
user_id    UUID
type       TEXT ('connection_request'/'new_message'/'limit_hit')
payload    JSONB
is_read    BOOLEAN DEFAULT false
created_at TIMESTAMPTZ
```

#### manifests
Niyet kayitlari.
```sql
id            UUID PRIMARY KEY
user_id       UUID
text          TEXT
category      TEXT ('love'/'money'/'health'/'career'/'spiritual'/'general')
display_name  TEXT
life_path     INTEGER
is_bot        BOOLEAN DEFAULT false
created_at    TIMESTAMPTZ
```

#### manifest_likes
Niyet begenileri.
```sql
id          UUID PRIMARY KEY
manifest_id UUID
user_id     UUID
created_at  TIMESTAMPTZ
```

#### manifest_weekly_champions
Haftalik en populer niyet yazarlari.
```sql
id              UUID PRIMARY KEY
week_start      DATE
rank            INTEGER (1-3)
user_id         UUID
display_name    TEXT
like_count      INTEGER
manifest_count  INTEGER
```

#### quiz_results
Quiz sonuclari.
```sql
id         UUID PRIMARY KEY
user_id    UUID
mode       TEXT ('solo'/'duel')
score      INTEGER
total      INTEGER
created_at TIMESTAMPTZ
```

### 5.2 Guvenlik

- **Tum tablolarda RLS (Row Level Security) aktif**
- Kullanicilar sadece kendi verilerini okur/yazar
- `discovery_profiles` herkese acik okuma (eslestirme icin)
- `manifests` herkese acik okuma (topluluk akisi icin)
- Supabase Realtime: `messages`, `notifications`, `connection_requests` tablolarinda aktif

### 5.3 Storage

- **`avatars` bucket**: Kullanici profil fotograflari
- Dosya limiti: 2MB
- Public okuma, RLS ile kullanici bazli yazma
- Path: `{userId}/avatar.jpg`

---

## 6. Vercel Serverless API

| Endpoint | Method | Amac |
|----------|--------|------|
| `/api/openai` | POST | OpenAI proxy — API key server-side eklenir, tum AI icerigi buradan uretilir |
| `/api/paddle-webhook` | POST | Paddle webhook handler — abonelik olaylarini Supabase'e yazar |
| `/api/revenuecat-webhook` | POST | Eski RevenueCat handler (deprecated) |
| `/api/manifest-cron` | GET | Zamanlanmis sahte manifest uretimi (topluluk akisi icin) |
| `/api/delete-account` | GET | Hesap silme bilgi sayfasi (app store gereksinimleri icin) |
| `/api/privacy-policy` | GET | Gizlilik politikasi (app store gereksinimleri icin) |
| `/api/terms-of-service` | GET | Kullanim kosullari |

### Ortam Degiskenleri (Vercel)
```
OPENAI_API_KEY           — OpenAI API anahtari
SUPABASE_URL             — Supabase proje URL'i
SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (webhook'lar icin)
PADDLE_WEBHOOK_SECRET     — Paddle webhook imza dogrulama
```

---

## 7. Temel Ozellikler

### 7.1 Numeroloji Motoru (Pisagor Sistemi)

Turkce karakter destekli Pisagor numeroloji hesaplama motoru:

```
1: A, J, S, S    |  2: B, K, T     |  3: C, C, L, U, U
4: D, M, V       |  5: E, N, W     |  6: F, O, O, X
7: G, G, P, Y    |  8: H, Q, Z     |  9: I, I, R
```

**Hesaplanan Sayilar:**
- **Kader Yolu (Life Path)**: Dogum tarihi rakamlarinin toplami
- **Ifade (Expression)**: Ismin tum harflerinin toplami
- **Ruh Gudusu (Soul Urge)**: Ismin sesli harflerinin toplami
- **Kisilik (Personality)**: Ismin sessiz harflerinin toplami
- **Ustat Sayilar**: 11, 22, 33 — asla indirgenmez

**Sayi Arketipleri:**
| Sayi | Arketip | Anlam |
|------|---------|-------|
| 1 | Lider | Bagimsizlik, yenilik, irade |
| 2 | Diplomat | Uyum, isbirligi, sezgi |
| 3 | Yaratici | Ifade, hayal gucu, iletisim |
| 4 | Insaaci | Disiplin, istikrar, caliskanlik |
| 5 | Maceracı | Ozgurluk, degisim, esneklik |
| 6 | Koruyucu | Sevgi, sorumluluk, aile |
| 7 | Mistik | Analiz, inanc, ic dunya |
| 8 | Guc Merkezi | Basari, otorite, maddi dunya |
| 9 | Insancil | Sevecenlik, idealizm, evrensellik |
| 11 | Aydinlatici | Vizyon, ilham, ruhsal uyaniş |
| 22 | Usta Insaaci | Buyuk projeler, pratik deha |
| 33 | Usta Ogretmen | Sifa, fedakarlik, evrensel sevgi |

### 7.2 Uyumluluk Sistemi

4 boyutlu agirlikli skorlama:
- **Life Path**: %35 agirlik
- **Soul Urge**: %30 agirlik
- **Personality**: %20 agirlik
- **Expression**: %15 agirlik

Ham skorlar [28-88] araliginda hesaplanir ve [70-98]% araligina olceklenir. 1-1'den 33-33'e kadar tum ciftler icin onceden tanimlanmis uyum matrisi vardir.

AI destekli analiz turleri:
- Kozmik uyumluluk
- Ruh gudusu uyumu
- Kisilik uyumu
- Kader yolu uyumu
- Karmik bag analizi
- Iletisim analizi
- Tam uyumluluk raporu

### 7.3 Cosmic Match (Gunluk Eslestirme)

- Opt-in kullanicilar arasinda gunluk algoritmik eslestirme
- Uyumluluk skoru bazli siralama
- Reveal (acma) kredi sistemi — streak'le kazanilir
- Her 3 ardisik giris gunu = 1 reveal kredisi
- Minimum skor esigi: %70

**Eslestirme Etiketleri (skora gore):**
| Skor | Etiket |
|------|--------|
| 94+ | Kozmik Ruh Ikizi |
| 89-93 | Kaderin Birlestirdigi |
| 84-88 | Yildiz Bagi |
| 79-83 | Guclu Rezonans |
| 74-78 | Uyumlu Titresim |
| 70-73 | Potansiyel Bag |
| <70 | Kesfedilecek Enerji |

**Sehir Bazli Harita**: Leaflet.js ile Turkiye haritasinda eslesmelerin sehirleri gosterilir (81 il destegi).

### 7.4 Decision Sphere (Karar Zamanlama)

Deterministik karar zamanlama chatbot'u — numerolojiye dayali karar rehberligi:

- **Karar Turleri**: is, para, iliski, baslangic, imza
- **Girdi**: Kisisel Gun, Kisisel Ay, Kisisel Yil sayilari
- **Hesaplama**:
  - Kisisel Yil = Dogum gunu + Dogum ayi + Mevcut yil rakamlari
  - Kisisel Ay = Kisisel Yil + Mevcut ay
  - Kisisel Gun = Kisisel Ay + Mevcut gun
- **Cikti**: Evet/Hayir tavsiyesi (guven 0-100), sebep sablonlari, uyari bayraklari

### 7.5 Gamification Sistemi

**Rutbeler (NBP = XP x 0.7):**
| Rutbe | Gerekli NBP | Odul |
|-------|-------------|------|
| Caylak Kasif | 0 | — |
| Yildiz Ogrencisi | 100 | — |
| Sayi Savascisi | 300 | — |
| Sayisal Rehber | 600 | — |
| Usta Numerolog | 1000 | 1 premium gun |
| Yildiz Bilgesi | 2000 | 1 premium gun |
| Sayisal Kahin | 3500 | 3 premium gun |

**XP Kaynaklari:**
| Eylem | XP |
|-------|-----|
| Uygulama acma (gunluk) | 5 |
| Gunluk okuma | 10 |
| Uyumluluk analizi | 20 |
| Arkadas ekle | 25 |
| Streak gunu | 15 |
| Gorev tamamla | 30 |
| Tum gorevler (bonus) | 100 |
| Kart paylas | 20 |
| Eslestirme gor | 10 |
| Eslestirme ac (reveal) | 15 |
| Niyet belirle | 10 |
| Cark cevir | 10 |

**Gunluk Gorevler**: Her gun 10 sablondan rastgele 3 gorev atanir. Tumu tamamlaninca Kozmik Sandik acilir.

**Rozetler (8 adet):**
1. Ilk Adim (1 analiz yap)
2. Bag Kurucusu (5 arkadas ekle)
3. Streak Atesi (7 gun seri)
4. Sonmeyen Alev (30 gun seri)
5. Sonsuz Ates (100 gun seri)
6. Uyum Avcisi (10 eslestirme ac)
7. Gorev Avcisi (7 gun ust uste tum gorevler)
8. Sayisal Uyaniş (Kahin rutbesine ulas)

### 7.6 Manifest Portal (NuFest)

**Niyet Olusturma:**
- Metin bazli niyet gunlugu
- Kategoriler: ask, para, saglik, kariyer, ruhsal, genel
- FREE: Gunde 1, ayda 5 niyet
- PREMIUM: Sinirsiz

**Topluluk Akisi:**
- Kronolojik gercek zamanli akis
- Gercek kullanici niyetleri (oncelikli)
- Bot niyetleri (30 onceden tohumlanmis)
- Begeni sistemi (kullanici basina 1 begeni)
- Haftalik sampiyon sistemi (en cok begeni alan 3 kullanici)

### 7.7 Baglanti ve Mesajlasma

- Arkadaslik istegi gonder/kabul et/reddet
- Bidirectional baglanti kaydi
- 1-1 gercek zamanli mesajlasma (Supabase Realtime)
- Bildirim sistemi (yeni mesaj, baglanti istegi, limit uyarisi)
- FREE: 3 baglanti (kendisi + 2), PREMIUM: Sinirsiz

### 7.8 Ek Ozellikler

- **Ay Fazi Enerji Takibi**: Ay evreleri ve enerji rehberligi
- **Kozmik Enerji Takvimi**: Gezegensel rehberlik ve kozmik tahmin
- **Kader Carki**: Rastgele odul cekimi (XP, premium gun, rozet)
- **Numeroloji Quiz**: Solo ve duel modlarinda bilgi yarismasi
- **Kart Paylasimi**: Web Share API ile analiz kartlarini paylasma

---

## 8. Yapay Zeka Entegrasyonu

### 8.1 Model ve Erisim
- **Model**: OpenAI `gpt-4o-mini`
- **Erisim**: Tum AI cagrilari `/api/openai` serverless endpoint uzerinden yapilir
- **API key**: Server-side eklenir (frontend'de gizli)

### 8.2 AI Kullanim Alanlari

| Alan | Aciklama |
|------|----------|
| Kisisel Numeroloji | Life path, soul urge, personality, expression analizi |
| Uyumluluk Analizi | Kozmik, ruh gudusu, kisilik, kader yolu, karmik, iletisim |
| Decision Sphere | Karar zamanlama aciklamalari (chatbot formati) |
| Gunluk Rehber | Kisisel sayi titresimlerine dayali gunluk rehberlik |
| Sayfa Icerigi | Her sayfada dinamik AI icerik uretimi |

### 8.3 Dil Destegi

AI prompt'lari Ingilizce yazilir ve secili dilde yanit uretilmesi icin iki katmanli dil talimat sistemi kullanilir:
1. Sistem mesajinda dil talimati
2. Kullanici mesajinda dil tekrari

```javascript
// Ornek:
var langCode = window.i18n ? window.i18n.getAILang() : '';
// langCode = "IMPORTANT: Respond ONLY in Russian language."
```

### 8.4 Cache Sistemi

- **localStorage**: Kalici cache (kullanici kapansa da durur)
- **sessionStorage**: Gecici cache (sekme kapaninca silinir)
- Cache anahtarlari dil kodu icerir (dil degisince yeni icerik uretilir)

---

## 9. Coklu Dil Destegi (i18n)

### 9.1 Desteklenen Diller

| Kod | Dil | Varsayilan |
|-----|-----|-----------|
| `tr` | Turkce | Evet |
| `en` | Ingilizce | — |
| `de` | Almanca | — |
| `fr` | Fransizca | — |
| `es` | Ispanyolca | — |
| `ar` | Arapca | — |
| `ru` | Rusca | — |
| `pt` | Portekizce | — |

### 9.2 Uygulama Yontemi

**HTML'de:**
```html
<span data-i18n="home.welcome">Hos geldin</span>
<input data-i18n-placeholder="search.placeholder" placeholder="Ara...">
```

**JavaScript'te:**
```javascript
// Statik ceviri (yukleme aninda)
var _t = window.i18n ? window.i18n.t.bind(window.i18n) : function(k,f){return f||k;};
var text = _t('key', 'Fallback');

// Dinamik ceviri (render aninda — dil degisince guncellenir)
function _gt(key, fallback) {
    return window.i18n ? window.i18n.t(key, fallback) : (fallback || key);
}
```

### 9.3 Ceviri Sayisi

350+ ceviri anahtari, kapsayan alanlar:
- Kayit/giris ekranlari
- Ana sayfa ve navigasyon
- Numeroloji terimleri
- Uyumluluk terminolojisi
- Gamification (rutbeler, rozetler, gorevler, oduller)
- Manifest portal
- Bildirimler
- Karmik bag analizi
- Baglam icerik etiketleri
- Hata mesajlari

---

## 10. Odeme Sistemi

### 10.1 Fiyatlandirma

| Plan | Fiyat | Aylik Karsiligi |
|------|-------|-----------------|
| Aylik | 79.99 TL/ay | 79.99 TL |
| Yillik | 599.99 TL/yil | 49.99 TL (%37 tasarruf) |

### 10.2 FREE ve PREMIUM Karsilastirmasi

| Ozellik | FREE | PREMIUM |
|---------|------|---------|
| Baglanti limiti | 3 (kendisi + 2) | Sinirsiz |
| Uyumluluk analizi | Ayda 2 | Sinirsiz |
| Niyet (manifest) | Ayda 5, gunde 1 | Sinirsiz |
| Deep Insight | Sadece 1. sayfa | Tam erisim (3 sayfa) |
| AI gunluk rehber | Yok | Var |
| Cosmic Match reveal | Yok | Var |
| Friendship Dynamics | Yok | Var |

### 10.3 Odeme Altyapisi

**Web (Paddle):**
- Sandbox modu (test)
- Overlay checkout v2
- Webhook: Supabase `subscriptions` tablosunu gunceller
- Olaylar: subscription.created/updated/canceled/past_due/activated, transaction.completed

**Android Native (Google Play Billing):**
- Urunler: `numerael_premium_monthly`, `numerael_premium_yearly`
- Custom native plugin: `PlayBillingPlugin`
- Capacitor bridge: `window.billing`

**Premium Durum Kontrol Sirasi:**
1. `EVERYONE_IS_PREMIUM` flag (gecici test icin `true`)
2. localStorage cache (`numerael_premium`)
3. `window.billing.checkEntitlements()` (sadece native)
4. Supabase `subscriptions` tablosu (fallback)

---

## 11. Tema ve UI/UX

### 11.1 Tasarim Sistemi

- **Framework**: Tailwind CSS (JIT runtime)
- **Font**: Montserrat (display), Material Symbols (ikonlar)
- **Renkler**: Altin (#FAC638 primary), Koyu (#231e0f / #0a0a1a arka plan), Acik (#f8f8f5)
- **Bilesenler**: Kartlar, gradient sinirlar, cam efektleri, shimmer animasyonlari

### 11.2 Tema Modlari

- **Acik (Light)**: Bej/krem tonlari
- **Koyu (Dark)**: Derin lacivert/siyah
- **Sistem**: Cihaz tercihine gore otomatik
- CSS sinif bazli: `<html class="dark">`
- localStorage: `numerael_theme`

### 11.3 Gorsel Stiller

- **Ethereal Glow**: Mor/altin radial gradient'ler
- **Cosmic Cards**: Gradient sinirli kartlar
- **Galaxy Background**: Cok katmanli radial arka plan
- **Shimmer Border**: Animasyonlu gradient mask
- **Aura Glow**: Isiltili halka efektleri
- **Glass Morphism**: Yari seffaf bulanik arka planlar

---

## 12. Kimlik Dogrulama ve Oturum

### 12.1 Yontemler
- Email/sifre (Supabase Auth)
- Google OAuth (Supabase Auth)

### 12.2 Oturum Yonetimi
- **Session key**: `numerael-auth-token` (localStorage)
- `auth.whenReady()` promise'i — diger moduller bu tamamlanmadan calismamalı
- `INITIAL_SESSION` event'i dinlenir (3 saniye timeout)
- Auth sayfalarda oturum varsa → ana sayfaya yonlendirilir
- Korumali sayfalarda oturum yoksa → kayit sayfasina yonlendirilir

### 12.3 Sayfa Siniflari
- **Auth sayfalari**: splash, onboarding, sign_up, index
- **Public sayfalari**: Auth + birth_form
- **Korumali**: Diger tum sayfalar

---

## 13. Native Platform Algilama

```javascript
var isNative = window.location.protocol === 'capacitor:' ||
               window.location.protocol === 'ionic:' ||
               window.location.hostname === 'localhost' ||
               window.location.protocol === 'file:' ||
               (typeof window.Capacitor !== 'undefined' &&
                window.Capacitor.isNativePlatform &&
                window.Capacitor.isNativePlatform());
```

Native ortamda API cagrilari `https://soulmate-kohl.vercel.app` uzerinden gider.

---

## 14. localStorage Anahtarlari

| Anahtar | Icerik |
|---------|--------|
| `numerael-auth-token` | Supabase oturum bilgisi |
| `numerael_language` | Secili dil (tr/en/de/fr/es/ar/ru/pt) |
| `numerael_theme` | Tema tercihi (light/dark/system) |
| `numerael_user_data` | Kullanici profil verisi (isim, dogum tarihi, cinsiyet) |
| `numerael_premium` | Premium cache (active, plan, expires_at, source) |
| `numerael_gamification` | Gamification durumu (NBP, XP, gorevler, rozetler) |
| `numerael_discovery_opted_in` | Cosmic Match opt-in durumu |
| `numerael_connections_{userId}` | Arkadas baglantilari cache |
| `numerael_compat_data` | Uyumluluk analiz verileri |
| `numerael_compat_ai_v2__*` | AI uyumluluk analizi cache |
| `numerael_usage_{feature}_{YYYY-MM}` | Aylik ozellik kullanim sayaci |
| `numerael_usage_{feature}_{YYYY-MM-DD}` | Gunluk ozellik kullanim sayaci |

---

## 15. Build ve Deploy

### 15.1 Gelistirme Komutlari

```bash
# Web asset'lerini www/ dizinine kopyala
npm run build                    # scripts/build.js calistir

# Native platformlara sync
npm run cap:sync                 # npx cap sync
npm run cap:build                # build + sync tek adimda

# Native IDE'leri ac
npm run cap:open:android         # Android Studio
npm run cap:open:ios             # Xcode
```

### 15.2 Deploy Akisi

1. Kod degisiklikleri `main` branch'ine merge edilir
2. Vercel otomatik olarak production'a deploy eder
3. Native icin: `npm run cap:build` → Android Studio/Xcode'dan build

### 15.3 Onemli Notlar

- Web dosyalari (HTML, JS) proje kokunde yasaR
- Duzenledikten sonra `npm run cap:sync` ZORUNLU (native uygulama icin)
- `www/` dizini `.gitignore`'da — version control disinda
- Vercel production: `https://soulmate-kohl.vercel.app`

---

## 16. SQL Migration Dosyalari

| Dosya | Amac |
|-------|------|
| `supabase_cosmic_match_migration.sql` | Cosmic Match tablolari |
| `sql/connection_messaging_schema.sql` | Baglanti ve mesajlasma tablolari |
| `sql/notifications_schema.sql` | Bildirim tablolari |
| `sql/avatar_storage_migration.sql` | Avatar storage bucket ve RLS |
| `sql/discovery_profiles_city_migration.sql` | Sehir kolonlari (city, city_lat, city_lng) |
| `sql/manifest_schema.sql` | Manifest tablolari |

---

## 17. Proje Dosya Yapisi

```
SOULMATE/
├── *.html                    # ~39 sayfa (kok dizinde)
├── js/                       # JavaScript modulleri
│   ├── supabase-config.js
│   ├── auth.js
│   ├── numerology-engine.js
│   ├── discovery-engine.js
│   ├── compatibility-engine.js
│   ├── gamification-engine.js
│   ├── i18n-engine.js
│   ├── theme-engine.js
│   ├── ... (27 dosya)
│   ├── supabase.min.js       # SDK bundle
│   └── tailwind.min.js       # CSS runtime
├── api/                      # Vercel serverless fonksiyonlari
│   ├── openai.js
│   ├── paddle-webhook.js
│   ├── manifest-cron.js
│   └── ...
├── sql/                      # Veritabani migration'lari
├── assets/                   # Gorseller, ikonlar
├── scripts/                  # Build script'leri
│   └── build.js
├── android/                  # Capacitor Android projesi
├── ios/                      # Capacitor iOS projesi
├── www/                      # Build ciktisi (.gitignore'da)
├── capacitor.config.json     # Capacitor yapilandirmasi
├── package.json
├── vercel.json               # Vercel yapilandirmasi
├── CLAUDE.md                 # AI asistan rehberi
└── tanitim.md                # Bu dosya
```

---

> **Not**: Bu dosya projenin 2026-03-01 tarihindeki durumunu yansitmaktadir.
> Guncellenmesi gerektiginde `tanitim.md` dosyasi duzenlenmelidir.
