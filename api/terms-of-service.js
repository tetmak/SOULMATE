module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Numerael — Kullanım Koşulları</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px; background: #0f0a1a; color: #d1d5db; line-height: 1.7; }
  h1 { color: #a78bfa; font-size: 24px; border-bottom: 1px solid rgba(139,92,246,0.3); padding-bottom: 12px; }
  h2 { color: #c4b5fd; font-size: 18px; margin-top: 28px; }
  a { color: #8b5cf6; }
  .updated { color: #6b7280; font-size: 13px; }
</style>
</head>
<body>
<h1>Numerael — Kullanım Koşulları</h1>
<p class="updated">Son güncelleme: 25 Şubat 2026</p>

<h2>1. Hizmet Tanımı</h2>
<p>Numerael, numeroloji tabanlı kişisel analiz, uyumluluk hesaplama ve enerji rehberliği sunan bir mobil uygulamadır. Uygulama eğlence ve kişisel gelişim amaçlıdır; profesyonel danışmanlık yerine geçmez.</p>

<h2>2. Hesap Oluşturma</h2>
<ul>
  <li>Uygulamayı kullanmak için geçerli bir e-posta adresiyle hesap oluşturmanız gerekir.</li>
  <li>Hesap bilgilerinizin doğruluğundan ve güvenliğinden siz sorumlusunuz.</li>
  <li>18 yaşından küçük kullanıcılar uygulamayı kullanamazlar.</li>
</ul>

<h2>3. Kullanım Kuralları</h2>
<p>Uygulamayı kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
<ul>
  <li>Başkalarının haklarını ihlal etmemek</li>
  <li>Yanıltıcı veya sahte bilgi paylaşmamak</li>
  <li>Uygulamanın güvenliğini tehlikeye atacak eylemlerden kaçınmak</li>
  <li>Uygulamayı ticari amaçla kopyalamamak veya dağıtmamak</li>
</ul>

<h2>4. Abonelik ve Ödeme</h2>
<ul>
  <li><strong>Ücretsiz Plan:</strong> Temel özelliklerle sınırlı erişim sağlar.</li>
  <li><strong>Premium Plan:</strong> Aylık veya yıllık abonelikle tüm özelliklere erişim.</li>
  <li>Abonelikler otomatik olarak yenilenir; iptal işlemi mevcut dönemin sonunda geçerli olur.</li>
  <li>Ödeme işlemleri Google Play, Apple App Store veya Paddle üzerinden gerçekleştirilir.</li>
  <li>İade politikaları ilgili platform kurallarına tabidir.</li>
</ul>

<h2>5. Fikri Mülkiyet</h2>
<p>Numerael uygulamasındaki tüm içerik, tasarım, algoritma ve markalar Numerael'e aittir. Kullanıcılar, kişisel kullanım dışında bu içerikleri kopyalayamaz, dağıtamaz veya ticari amaçla kullanamazlar.</p>

<h2>6. AI İçerik Sorumluluk Reddi</h2>
<p>Uygulama yapay zeka destekli içerik üretmektedir. Bu içerikler:</p>
<ul>
  <li>Eğlence ve ilham amaçlıdır</li>
  <li>Profesyonel psikolojik, tıbbi veya finansal tavsiye niteliği taşımaz</li>
  <li>Kesin veya bilimsel doğruluk iddiasında değildir</li>
</ul>

<h2>7. Sorumluluk Sınırı</h2>
<p>Numerael, uygulamadaki numeroloji analizleri ve AI içeriklerinin doğruluğu konusunda garanti vermez. Uygulama "olduğu gibi" sunulmakta olup, kullanımdan doğan sonuçlardan Numerael sorumlu tutulamaz.</p>

<h2>8. Hesap Askıya Alma ve Fesih</h2>
<p>Kullanım koşullarını ihlal eden hesaplar uyarı yapılarak veya yapılmaksızın askıya alınabilir veya silinebilir. Kullanıcılar istedikleri zaman hesaplarını silme hakkına sahiptir.</p>

<h2>9. Değişiklikler</h2>
<p>Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler uygulama içinden bildirilir. Uygulamayı kullanmaya devam etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.</p>

<h2>10. İletişim</h2>
<p>Sorularınız için: <a href="mailto:numerael.app@gmail.com">numerael.app@gmail.com</a></p>
</body>
</html>`);
};
