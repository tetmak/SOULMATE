module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Numerael — Hesap Silme</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px 16px; background: #0f0a1a; color: #d1d5db; line-height: 1.7; }
  h1 { color: #a78bfa; font-size: 24px; border-bottom: 1px solid rgba(139,92,246,0.3); padding-bottom: 12px; }
  h2 { color: #c4b5fd; font-size: 18px; margin-top: 28px; }
  a { color: #8b5cf6; }
  .warning { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; margin: 16px 0; }
  .warning strong { color: #f87171; }
  .steps { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); border-radius: 12px; padding: 16px; margin: 16px 0; }
  .steps ol { margin: 8px 0; padding-left: 20px; }
  .steps li { margin: 8px 0; }
  .email-btn { display: inline-block; background: linear-gradient(135deg,#8b5cf6,#ec4899); color: white; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 700; margin-top: 16px; }
</style>
</head>
<body>
<h1>Numerael — Hesap Silme Talebi</h1>

<h2>Hesabınızı Silmek İstiyorsanız</h2>

<div class="steps">
<p><strong>Yöntem 1: Uygulama İçinden</strong></p>
<ol>
  <li>Numerael uygulamasını açın</li>
  <li><strong>Profil</strong> sayfasına gidin</li>
  <li><strong>Ayarlar</strong> butonuna tıklayın</li>
  <li><strong>Hesabı Sil</strong> seçeneğini tıklayın</li>
  <li>Onaylayın</li>
</ol>
</div>

<div class="steps">
<p><strong>Yöntem 2: E-posta ile</strong></p>
<p>Aşağıdaki e-posta adresine kayıtlı e-posta adresinizden hesap silme talebinizi gönderin:</p>
<a class="email-btn" href="mailto:numerael.app@gmail.com?subject=Hesap%20Silme%20Talebi&body=Merhaba%2C%0A%0ANumerael%20hesab%C4%B1m%C4%B1n%20ve%20t%C3%BCm%20verilerimin%20silinmesini%20talep%20ediyorum.%0A%0AKay%C4%B1tl%C4%B1%20e-posta%20adresim%3A%20%0A%0ATeşekkürler.">numerael.app@gmail.com</a>
</div>

<div class="warning">
<strong>⚠️ Dikkat:</strong> Hesabınız silindiğinde aşağıdaki veriler kalıcı olarak kaldırılır:
<ul>
  <li>Profil bilgileriniz (ad, doğum tarihi)</li>
  <li>Numeroloji analizleriniz ve geçmişiniz</li>
  <li>Bağlantılarınız ve mesajlarınız</li>
  <li>Gamification ilerlemeniz (XP, rütbe, rozetler)</li>
  <li>Abonelik bilgileriniz</li>
</ul>
<p>Bu işlem geri alınamaz.</p>
</div>

<h2>İşlem Süresi</h2>
<p>Hesap silme talepleri en geç <strong>7 iş günü</strong> içinde işleme alınır. Aktif aboneliğiniz varsa, önce Google Play üzerinden aboneliğinizi iptal etmeniz önerilir.</p>

<h2>İletişim</h2>
<p>Sorularınız için: <a href="mailto:numerael.app@gmail.com">numerael.app@gmail.com</a></p>
</body>
</html>`);
};
