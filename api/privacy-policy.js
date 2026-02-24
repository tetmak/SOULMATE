module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Numerael — Gizlilik Politikası</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px; background: #0f0a1a; color: #d1d5db; line-height: 1.7; }
  h1 { color: #a78bfa; font-size: 24px; border-bottom: 1px solid rgba(139,92,246,0.3); padding-bottom: 12px; }
  h2 { color: #c4b5fd; font-size: 18px; margin-top: 28px; }
  a { color: #8b5cf6; }
  .updated { color: #6b7280; font-size: 13px; }
</style>
</head>
<body>
<h1>Numerael — Gizlilik Politikası</h1>
<p class="updated">Son güncelleme: 24 Şubat 2026</p>

<h2>1. Toplanan Veriler</h2>
<p>Numerael uygulaması aşağıdaki bilgileri toplar:</p>
<ul>
  <li><strong>Hesap bilgileri:</strong> E-posta adresi (kayıt ve giriş için)</li>
  <li><strong>Profil bilgileri:</strong> Ad-soyad, doğum tarihi, cinsiyet (numeroloji hesaplamaları için)</li>
  <li><strong>Uygulama kullanım verileri:</strong> Tercihler, analiz geçmişi, bağlantılar</li>
</ul>

<h2>2. Verilerin Kullanım Amacı</h2>
<ul>
  <li>Kişiselleştirilmiş numeroloji analizleri sunmak</li>
  <li>Kullanıcılar arası uyumluluk hesaplamaları yapmak</li>
  <li>Uygulama deneyimini iyileştirmek</li>
  <li>Abonelik ve ödeme işlemlerini yönetmek</li>
</ul>

<h2>3. Veri Paylaşımı</h2>
<p>Kişisel verileriniz üçüncü taraflarla <strong>pazarlama amacıyla paylaşılmaz</strong>. Veriler yalnızca şu hizmet sağlayıcılarla işlenir:</p>
<ul>
  <li><strong>Supabase:</strong> Veritabanı ve kimlik doğrulama</li>
  <li><strong>OpenAI:</strong> AI destekli analiz içerikleri (anonim veri)</li>
  <li><strong>Google Play:</strong> Abonelik ve ödeme işlemleri</li>
</ul>

<h2>4. Veri Güvenliği</h2>
<p>Tüm veriler şifreli bağlantı (HTTPS/TLS) üzerinden iletilir. Veritabanı erişimi satır düzeyinde güvenlik (Row Level Security) ile korunur. Her kullanıcı yalnızca kendi verilerine erişebilir.</p>

<h2>5. Kullanıcı Hakları</h2>
<p>Aşağıdaki haklara sahipsiniz:</p>
<ul>
  <li>Verilerinize erişim talep etme</li>
  <li>Verilerinizin düzeltilmesini isteme</li>
  <li>Hesabınızı ve tüm verilerinizi silme</li>
  <li>Veri taşınabilirliği talep etme</li>
</ul>

<h2>6. Çocukların Gizliliği</h2>
<p>Numerael 18 yaş altındaki kullanıcılara yönelik değildir ve bilerek 18 yaş altı kullanıcılardan veri toplamaz.</p>

<h2>7. Değişiklikler</h2>
<p>Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama içinden bildirilir.</p>

<h2>8. İletişim</h2>
<p>Gizlilik ile ilgili sorularınız için: <a href="mailto:numerael.app@gmail.com">numerael.app@gmail.com</a></p>
</body>
</html>`);
};
