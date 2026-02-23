# Claude Code Kurulum ve Devam Rehberi

## 1. Claude Code Kurulumu (PC)

```bash
# Node.js 18+ gerekli (zaten var olmalı)
npm install -g @anthropic-ai/claude-code
```

## 2. Projeyi Hazırla

```bash
# Proje dizinine git
cd C:\Users\SENIN_KULLANICI_ADIN\...\SOULMATE

# Son değişiklikleri çek
git pull origin main

# Feature branch'e geç
git checkout claude/read-session-context-IgRjm
git pull origin claude/read-session-context-IgRjm
```

## 3. Claude Code'u Başlat

```bash
claude
```

## 4. Claude Code'a Söylenecek Mesaj

Aşağıdaki mesajı yapıştır:

```
Uyum analizi sayfası (relationship_compatibility_analysis.html) skorları göstermiyor.
Tüm barlar "—", isimler "Sen" ve "Partner" olarak kalıyor, "Kozmik bağ hesaplanıyor..."
yazısı takılı. compatibility-engine.js yükleniyor ama initCompatAnalysis çalışmıyor gibi.

Lütfen:
1. npm run cap:build çalıştır
2. Sorunu tespit edip düzelt
3. Android emülatörde test edilebilir hale getir
```

## Mevcut Durum

- **Branch**: `claude/read-session-context-IgRjm`
- **Sorun**: Uyum analizi sayfasında JS engine skorları doldurmıyor
- **Yapılan**: Cache-busting (?v=2), fallback init, sağlam sayfa tespiti eklendi
- **Test edilmedi**: Henüz gerçek cihazda/emülatörde test edilemedi

## Hızlı Komutlar

```bash
# Web build + native sync (tek komut)
npm run cap:build

# Sadece web build
npm run build

# Sadece native sync
npm run cap:sync

# Android Studio aç
npm run cap:open:android
```
