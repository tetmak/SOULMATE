# Plan: Bölge (Region) Sistemi — Manifest Community Filtreleme

## Genel Bakış
Kullanıcılar giriş yaparken dil + bölge seçecek (zorunlu). Manifest Community sayfasında seçtikleri bölgedeki manifestleri görecek, başka bölgelere de geçebilecek.

---

## Adım 1: Veritabanı — `profiles` ve `manifests` tablolarına `region` kolonu ekle

**Yeni SQL migration dosyası:** `sql/region_migration.sql`

```sql
-- profiles tablosuna region kolonu
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);

-- manifests tablosuna region kolonu (filtreleme için JOIN'siz hızlı sorgu)
ALTER TABLE manifests ADD COLUMN IF NOT EXISTS region TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_manifests_region ON manifests(region);
```

Bu migration'ı Supabase SQL Editor'da çalıştırman gerekecek.

---

## Adım 2: Giriş Sayfası — Zorunlu Bölge Seçimi

**Dosya:** `mystic_sign_up_screen.html`

- Mevcut dil seçici butonunun yanına (veya altına) bir **bölge seçici** butonu ekle
- Dil seçildiğinde otomatik olarak bölge önerisi yap (TR→Türkiye, PT→Portekiz, EN→ABD)
- Kullanıcı bölgesini değiştirebilsin (overlay popup — dil seçici ile aynı pattern)
- **Bölge seçilmeden kayıt butonu disabled** olacak
- Seçilen bölge `localStorage` key: `numerael_user_region`

**Bölge Listesi (12-15 ana bölge):**
- 🇹🇷 Türkiye
- 🇺🇸 Amerika (USA)
- 🇬🇧 İngiltere (UK)
- 🇩🇪 Almanya
- 🇫🇷 Fransa
- 🇪🇸 İspanya
- 🇵🇹 Portekiz
- 🇧🇷 Brezilya
- 🇸🇦 Suudi Arabistan
- 🇷🇺 Rusya
- 🇳🇱 Hollanda
- 🇮🇹 İtalya
- 🌍 Diğer (Other)

**Dil → Varsayılan Bölge Eşlemesi:**
| Dil | Varsayılan Bölge |
|-----|------------------|
| tr  | Türkiye          |
| en  | Amerika          |
| de  | Almanya          |
| fr  | Fransa           |
| es  | İspanya          |
| pt  | Portekiz         |
| ar  | Suudi Arabistan  |
| ru  | Rusya            |

---

## Adım 3: Doğum Formu — Bölgeyi Supabase'e Kaydet

**Dosya:** `data-ready_birth_form.html`

- Profil kaydederken `region` alanını da ekle:
```javascript
await window.supabaseClient.from('profiles').upsert({
    ...mevcut alanlar,
    region: localStorage.getItem('numerael_user_region') || null
});
```

- Ayrıca `numerael_user_data` localStorage'a da region ekle

---

## Adım 4: Manifest Oluşturma — Region Otomatik Ekle

**Dosya:** `js/manifest-engine.js` → `save()` fonksiyonu

- Manifest kaydederken kullanıcının bölgesini otomatik ekle:
```javascript
var userRegion = localStorage.getItem('numerael_user_region') || 'other';
await sb().from('manifests').insert({
    ...mevcut alanlar,
    region: userRegion
});
```

---

## Adım 5: Manifest Community — Bölge Filtre Butonu

**Dosya:** `manifest_community.html`

### UI Değişikliği:
- Sağ üst header'a 🌍 ikonu olan yuvarlak buton ekle (info butonunun yanına)
- Tıklayınca overlay açılsın (dil seçici ile aynı stil)
- Overlay'da bölge listesi + "Tümü" seçeneği
- Aktif bölge altın çerçeve ile işaretli
- Varsayılan: kullanıcının kendi bölgesi

### Filtre Mekanizması:
- Yeni global değişken: `var currentRegion = localStorage.getItem('numerael_user_region') || 'all';`
- `loadFromSupabase()` → `manifestEngine.loadFeed(currentSort, currentCat, currentRegion, 100)`

**Dosya:** `js/manifest-engine.js` → `loadFeed()` fonksiyonu

- Yeni parametre: `region`
- Sorguya filtre ekle:
```javascript
if (region && region !== 'all') {
    query = query.eq('region', region);
}
```

---

## Adım 6: Mevcut Kullanıcılar İçin — Geriye Dönük Uyum

- Ayarlar sayfasında (`app_settings_preferences.html`) bölge değiştirme seçeneği ekle
- Bölgesi olmayan kullanıcılar: manifest_community'de "Tümü" gösterilir
- Bölgesi olmayan manifestler: her bölgede görünür (region IS NULL)

---

## Değişecek Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `sql/region_migration.sql` | **YENİ** — DB migration |
| `mystic_sign_up_screen.html` | Bölge seçici butonu + overlay + zorunlu kontrol |
| `data-ready_birth_form.html` | Profil kayıt sırasında region ekle |
| `js/manifest-engine.js` | save() + loadFeed() region desteği |
| `manifest_community.html` | Bölge filtre butonu + overlay + state yönetimi |
| `app_settings_preferences.html` | Bölge değiştirme seçeneği |
