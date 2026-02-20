# Kader Premium — RevenueCat Kurulum Rehberi

## 1. Hesaplar

### RevenueCat
1. https://app.revenuecat.com adresinde hesap oluştur
2. Yeni proje: "Kader" adıyla oluştur

### Stripe
1. https://dashboard.stripe.com adresinde hesap oluştur
2. Stripe API key'lerini al (publishable + secret)

## 2. RevenueCat'te Stripe Bağlantısı
1. RevenueCat Dashboard → Project Settings → Billing
2. "Connect Stripe" → Stripe hesabını bağla

## 3. Web Billing Platform Ekle
1. RevenueCat Dashboard → Project Settings → Apps
2. "+ New" → "Web" seç
3. Ayarları doldur:
   - **App Name:** Kader
   - **Default Currency:** TRY
   - **Support Email:** senin@email.com
4. Kaydet → **Web Billing Public API Key** kopyala (`rcb_` ile başlar)

## 4. Ürünler Oluştur
1. RevenueCat Dashboard → Products
2. İki ürün oluştur:

   | Identifier | Fiyat | Süre |
   |---|---|---|
   | `kader_premium_monthly` | ₺79.99 | 1 ay |
   | `kader_premium_yearly` | ₺599.99 | 1 yıl |

## 5. Entitlement Oluştur
1. RevenueCat Dashboard → Entitlements
2. "+ New" → Identifier: `premium`
3. Her iki ürünü bu entitlement'a bağla

## 6. Offering Oluştur
1. RevenueCat Dashboard → Offerings
2. "default" offering'i düzenle (veya yeni oluştur)
3. İki paket ekle:
   - **Monthly:** `kader_premium_monthly` ürünü
   - **Annual:** `kader_premium_yearly` ürünü

## 7. API Key'i Koda Ekle
`js/premium.js` dosyasını aç, `RC_API_KEY` değerini değiştir:

```javascript
var RC_API_KEY = 'rcb_SENIN_API_KEYIN_BURAYA';
```

Opsiyonel — Web Purchase Link oluşturduysanız:
```javascript
var RC_PURCHASE_LINK = 'https://billing.revenuecat.com/SENIN_LINKIN';
```

## 8. Webhook Kurulumu (Otomatik Abonelik Senkronizasyonu)

Webhook, abonelik olaylarını (yenileme, iptal, süre bitimi) otomatik olarak
Supabase veritabanına yazar. Bu sayede client-side kontrole bağımlı kalmazsınız.

### 8a. Vercel Environment Variables
Vercel Dashboard → Settings → Environment Variables → şunları ekle:

| Variable | Değer | Açıklama |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Dashboard → Settings → API → service_role key |
| `REVENUECAT_WEBHOOK_AUTH_KEY` | kendin belirle | Webhook güvenlik anahtarı (rastgele uzun string) |

### 8b. RevenueCat Dashboard'da Webhook Ekle
1. RevenueCat Dashboard → Project Settings → Integrations → Webhooks
2. "+ New" tıkla
3. Ayarlar:
   - **URL:** `https://SENIN_DOMAIN.vercel.app/api/revenuecat-webhook`
   - **Authorization Header:** `Bearer REVENUECAT_WEBHOOK_AUTH_KEY_DEGERIN`
4. Kaydet

### 8c. Webhook Olayları
Webhook otomatik olarak şu olayları işler:
- `INITIAL_PURCHASE` → Yeni abonelik oluşturur
- `RENEWAL` → Aboneliği yeniler
- `CANCELLATION` → İptal olarak işaretler (süre sonuna kadar aktif kalır)
- `EXPIRATION` → Süresi dolmuş olarak işaretler
- `BILLING_ISSUE` → Ödeme sorunu — iptal olarak işaretler
- `UNCANCELLATION` → İptal geri alınır, tekrar aktif

## 9. Test
1. Uygulamayı aç → Premium sayfasına git
2. Konsolu aç, kontrol et: `[Premium] RevenueCat başlatıldı`
3. "Premium'a Geç" butonuna bas
4. Stripe test kartı kullan: `4242 4242 4242 4242`
5. Ödeme sonrası premium aktif olmalı

## 10. Canlıya Alma
- Stripe'ta canlı moduna geç (test → live)
- RevenueCat'te Production API key kullan
- `premium.js`'teki API key'i production key ile değiştir
- Vercel env variable'ları production değerlerle güncelle

## Dev Tools (Konsol)
```javascript
premium.simulate(30)  // 30 günlük premium simüle et (sadece test)
premium.clear()       // Premium'u temizle
premium.isReady()     // RC SDK durumu
premium.isPremium()   // Premium durumu
```

## Mimari

```
Kullanıcı → Paywall/Store → premium.startPurchase()
                               ↓
                    RC Web Purchase Link (varsa)
                    VEYA RC SDK purchase() → Stripe Checkout
                               ↓
                    Ödeme başarılı → localStorage + Supabase güncelle
                               ↓
                    RevenueCat Webhook → /api/revenuecat-webhook
                               ↓
                    Supabase subscriptions tablosu güncelle
                    (yenileme, iptal, süre bitimi otomatik)
```

## Premium Durum Kontrolü (3 Katmanlı)
1. **RevenueCat SDK** — Gerçek zamanlı entitlement kontrolü
2. **localStorage** — Offline cache (hızlı erişim)
3. **Supabase** — Server-side yedek (webhook ile güncel tutuluyor)

## Notlar
- RevenueCat SDK ödeme formunu otomatik render eder (Stripe Elements)
- Apple Pay ve Google Pay desteği Stripe Dashboard'dan aktif edilir
- SDK client-side çalışır, API key güvenlidir (public key)
- Webhook sayesinde abonelik durumu server-side güncellenir
- İptal edilen abonelik expires_at tarihine kadar aktif kalır
