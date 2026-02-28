/**
 * i18n Engine — Multi-Language Support
 * localStorage key: numerael_language
 * Supported: tr, en, de, fr, es, ar, ru, pt
 *
 * Usage:
 *   HTML: <span data-i18n="signup.title">Sign Up</span>
 *   HTML placeholder: <input data-i18n-placeholder="signup.name_placeholder" placeholder="Enter your name">
 *   JS: window.i18n.t('signup.title')
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'numerael_language';
    var DEFAULT_LANG = 'tr';

    // ─── TRANSLATIONS ─────────────────────────────────────────────
    var T = {};

    // ═══ TURKISH (Default) ═══
    T.tr = {
        // Common
        'common.loading': 'Yükleniyor...',
        'common.error': 'Hata',
        'common.success': 'Başarılı',
        'common.cancel': 'İptal',
        'common.save': 'Kaydet',
        'common.send': 'Gönder',
        'common.close': 'Kapat',
        'common.back': 'Geri',
        'common.next': 'İleri',
        'common.yes': 'Evet',
        'common.no': 'Hayır',
        'common.ok': 'Tamam',
        'common.search': 'Ara',
        'common.open': 'AÇ',

        // Signup/Login
        'signup.title': 'Kayıt Ol',
        'signup.login_title': 'Giriş Yap',
        'signup.headline': 'Yıldızlara doğru yolculuğuna başla',
        'signup.subtitle': 'Kozmik haritanı aç ve sayılarının ardındaki sırları keşfet.',
        'signup.fullname': 'Ad Soyad',
        'signup.fullname_placeholder': 'Doğum adınızı girin',
        'signup.email': 'E-posta',
        'signup.email_placeholder': 'ruhun@kozmos.com',
        'signup.password': 'Şifre Oluştur',
        'signup.password_login': 'Şifre',
        'signup.btn_signup': 'Ruh Hesabı Oluştur',
        'signup.btn_login': 'Numantic\'e Giriş Yap',
        'signup.toggle_login': 'Zaten hesabınız var mı?',
        'signup.toggle_signup': 'Hesabınız yok mu?',
        'signup.link_login': 'Giriş Yap',
        'signup.link_signup': 'Kayıt Ol',
        'signup.alert_email_pass': 'Lütfen e-posta ve şifrenizi giriniz.',
        'signup.alert_name': 'Lütfen adınızı giriniz.',
        'signup.select_language': 'Dil Seçin',

        // Home
        'home.celestial_guidance': 'Kozmik Rehberlik',
        'home.greeting': 'Evren seninle uyumda,',
        'home.personal_vibration': 'Kişisel Titreşim',
        'home.deep_insight': 'Derin Analiz',
        'home.cosmic_navigator': 'Kişisel Kozmik Navigator',
        'home.explore_map': 'Haritayı Keşfet',
        'home.soul_mate_analysis': 'Ruh Eşi Analizi',
        'home.soul_mate_desc': 'Yıldızlar, yolların ilahi birleşiminde buluşuyor.',
        'home.unveil_twin': 'İkiz Alevi Keşfet',
        'home.cosmic_match': 'Cosmic Match',
        'home.cosmic_match_desc': 'Kozmik rezonansının frekansına analitik bir bakış.',
        'home.measure_resonance': 'Rezonansı Ölç',
        'home.decision_sphere': 'Karar Küresi',
        'home.decision_sphere_desc': 'İlahi olasılıklar merceğinden gelecek yollarınız için netlik.',
        'home.cast_inquiry': 'Sorgunuzu Yapın',
        'home.lunar_insights': 'Ay Fazı Analizi',
        'home.lunar_desc': 'Azalan hilal, içe bakış davet eder. Artık size hizmet etmeyeni bırakın.',
        'home.explore_cycles': 'Döngüleri Keşfet',
        'home.celestial_forecast': 'Göksel Tahmin',
        'home.celestial_desc': 'Bu hafta ruhsal büyümenizi ve tezahür gücünüzü en üst düzeye çıkarmak için gezegen değişimlerine uyum sağlayın.',
        'home.view_trajectory': 'Yörüngeyi Gör',
        'home.manifest_portal': 'NuFest Portal',
        'home.manifest_desc': 'Uzayın Tuvali — Niyetleriniz kişisel evreninizi aydınlatan yıldızlardır.',
        'home.enter_portal': 'Portala Gir',
        'home.daily_quests': 'Günlük Görevler',
        'home.bonus_chest': '3/3 = Bonus Sandık',

        // Nav
        'nav.home': 'Home',
        'nav.nuconnect': 'NuConnect',
        'nav.nufest': 'NuFest',
        'nav.numatch': 'NuMatch',

        // Bubble menu
        'bubble.compatibility': 'Uyum Analizi',
        'bubble.new_analysis': 'Yeni Analiz',
        'bubble.daily_guide': 'Günlük Rehber',
        'bubble.moon_phase': 'Ay Fazı',
        'bubble.decision_wheel': 'Karar Çarkı',
        'bubble.decision_calendar': 'Karar Takvimi',
        'bubble.nufest': 'NuFest',
        'bubble.profile': 'Profil',

        // Settings
        'settings.title': 'Ayarlar',
        'settings.personal_info': 'Kişisel Bilgiler',
        'settings.fullname': 'Ad Soyad',
        'settings.birthdate': 'Doğum Tarihi',
        'settings.notifications': 'Bildirim Tercihleri',
        'settings.daily_insight': 'Günlük Numeroloji İçgörüsü',
        'settings.lunar_alerts': 'Ay Fazı Uyarıları',
        'settings.system_notif': 'Sistem Bildirimleri',
        'settings.appearance': 'Görünüm',
        'settings.dark_mode': 'Karanlık Mod',
        'settings.dark_active': 'Aktif',
        'settings.dark_inactive': 'Kapalı',
        'settings.language': 'Dil',
        'settings.subscription': 'Abonelik & Faturalandırma',
        'settings.security': 'Güvenlik & Yasal',
        'settings.change_password': 'Şifre Değiştir',
        'settings.privacy_policy': 'Gizlilik Politikası',
        'settings.terms': 'Kullanım Şartları',
        'settings.logout': 'Çıkış Yap',
        'settings.delete_account': 'Hesabı Sil',
        'settings.version_footer': 'Ruhsal verileriniz 256-bit AES korumasıyla şifrelenmektedir.',
        'settings.upgrade': 'Premium\'a Yükselt',
        'settings.manage_sub': 'Aboneliği Yönet',
        'settings.restore': 'Satın Alımları Geri Yükle',
        'settings.free_plan': 'Ücretsiz Plan',
        'settings.free_detail': 'Temel özellikler · Sınırlı kullanım',
        'settings.pw_title': 'Şifre Değiştir',
        'settings.pw_desc': 'E-posta adresinize şifre sıfırlama bağlantısı gönderilecek.',
        'settings.pw_sent': '✓ Şifre sıfırlama bağlantısı e-postanıza gönderildi!',
        'settings.pw_sending': 'Gönderiliyor...',

        // Birth Form
        'birth.title': 'Doğum Bilgileri',
        'birth.headline': 'Doğum Bilgilerinizi Girin',
        'birth.subtitle': 'Doğru veriler ruhsal haritanızı ortaya çıkarır. Her detay sizi kozmosla hizalar.',
        'birth.fullname': 'Ad Soyad',
        'birth.fullname_placeholder': 'Tam adınız',
        'birth.birthdate': 'Doğum Tarihi',
        'birth.day': 'Gün',
        'birth.month': 'Ay',
        'birth.year': 'Yıl',
        'birth.time': 'Doğum Saati',
        'birth.recommended': 'Önerilen',
        'birth.country': 'Doğum Ülkesi',
        'birth.select_country': 'Ülke Seçin',
        'birth.gender': 'Cinsiyet',
        'birth.male': 'Erkek',
        'birth.female': 'Kadın',
        'birth.calculate': 'Haritayı Hesapla',
        'birth.alert_required': 'Lütfen isim ve doğum tarihini giriniz.',

        // Profile
        'profile.title': 'Ruh Yolculuğu',
        'profile.life_path': 'Life Path',
        'profile.expression': 'İfade',
        'profile.soul_urge': 'Ruh Güdüsü',
        'profile.personality': 'Kişilik',
        'profile.name_analysis': 'İsim Analizi',
        'profile.deep_insight': 'Derin Analiz',
        'profile.compat_readings': 'Uyumluluk Okumaları',
        'profile.compat_empty': 'Henüz uyumluluk analizi yok.',
        'profile.compat_hint': 'Alttaki + menüsünden "Ruh Eşi" ile başlayabilirsin.',
        'profile.connection_requests': 'Bağlantı İstekleri',
        'profile.no_requests': 'Bekleyen istek yok',
        'profile.cosmic_match': 'Cosmic Match',
        'profile.discoverable': 'Keşfedilebilir Ol',
        'profile.discoverable_desc': 'Diğer kullanıcılar seni eşleşme radarında görsün',
        'profile.refresh': 'Ruh Analizimi Yenile',
        'profile.go_premium': 'Premium\'a Geç',
        'profile.sign_out': 'Çıkış Yap',

        // Notifications
        'notif.title': 'Bildirimler',
        'notif.empty': 'Yeni bildirim yok',
        'notif.mark_all': 'Tümünü Okundu İşaretle',
        'notif.connection_request': 'sana bağlantı isteği gönderdi',
        'notif.connection_accepted': 'bağlantı isteğini kabul etti',
        'notif.new_message': 'sana yeni bir mesaj gönderdi',

        // Months
        'month.01': 'Ocak', 'month.02': 'Şubat', 'month.03': 'Mart',
        'month.04': 'Nisan', 'month.05': 'Mayıs', 'month.06': 'Haziran',
        'month.07': 'Temmuz', 'month.08': 'Ağustos', 'month.09': 'Eylül',
        'month.10': 'Ekim', 'month.11': 'Kasım', 'month.12': 'Aralık',

        // Vibration themes
        'vib.1': 'BAŞLANGIÇ', 'vib.2': 'DEĞERLENDİRME', 'vib.3': 'İFADE',
        'vib.4': 'YAPI', 'vib.5': 'DEĞİŞİM', 'vib.6': 'DENGELİLİK',
        'vib.7': 'ANALİZ', 'vib.8': 'KONTROL', 'vib.9': 'TAMAMLAMA',
        'vib.11': 'YÜKSEK YOĞUNLUK', 'vib.22': 'USTA İCRA', 'vib.33': 'USTA REHBERLİK',

        // Connections
        'conn.title': 'Ruh Bağlantıları',
        'conn.mark_all_read': 'Tümünü okundu işaretle',
        'conn.soul_connections': 'Ruh Bağlantıları'
    };

    // ═══ ENGLISH ═══
    T.en = {
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.send': 'Send',
        'common.close': 'Close',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.ok': 'OK',
        'common.search': 'Search',
        'common.open': 'OPEN',

        'signup.title': 'Sign Up',
        'signup.login_title': 'Login',
        'signup.headline': 'Begin your journey into the stars',
        'signup.subtitle': 'Unlock your cosmic blueprint and discover the secrets hidden in your numbers.',
        'signup.fullname': 'Full Name',
        'signup.fullname_placeholder': 'Enter your birth name',
        'signup.email': 'Email',
        'signup.email_placeholder': 'your.soul@cosmos.com',
        'signup.password': 'Create Password',
        'signup.password_login': 'Password',
        'signup.btn_signup': 'Create Soul Account',
        'signup.btn_login': 'Login to Numantic',
        'signup.toggle_login': 'Already have an account?',
        'signup.toggle_signup': "Don't have an account?",
        'signup.link_login': 'Login',
        'signup.link_signup': 'Sign Up',
        'signup.alert_email_pass': 'Please enter your email and password.',
        'signup.alert_name': 'Please enter your name.',
        'signup.select_language': 'Select Language',

        'home.celestial_guidance': 'Celestial Guidance',
        'home.greeting': 'The Universe is aligned,',
        'home.personal_vibration': 'Personal Vibration',
        'home.deep_insight': 'Deep Insight',
        'home.cosmic_navigator': 'Personal Cosmic Navigator',
        'home.explore_map': 'Explore Map',
        'home.soul_mate_analysis': 'Soul Mate Analysis',
        'home.soul_mate_desc': 'The stars are converging in a divine union of paths.',
        'home.unveil_twin': 'Unveil Twin Flame',
        'home.cosmic_match': 'Cosmic Match',
        'home.cosmic_match_desc': 'An analytical deep-dive into the frequency of your celestial resonance.',
        'home.measure_resonance': 'Measure Resonance',
        'home.decision_sphere': 'Decision Sphere',
        'home.decision_sphere_desc': 'Clarity for your future paths through the lens of divine probability.',
        'home.cast_inquiry': 'Cast Your Inquiry',
        'home.lunar_insights': 'Lunar Insights',
        'home.lunar_desc': 'The waning crescent invites introspection. Release what no longer serves your higher purpose.',
        'home.explore_cycles': 'Explore Cycles',
        'home.celestial_forecast': 'Celestial Forecast',
        'home.celestial_desc': 'Align with the upcoming planetary shifts to maximize your spiritual growth and manifesting power this week.',
        'home.view_trajectory': 'View Trajectory',
        'home.manifest_portal': 'Manifest Portal',
        'home.manifest_desc': 'The Canvas of Space — Your intentions are the stars that light up your personal universe.',
        'home.enter_portal': 'Enter Portal',
        'home.daily_quests': 'Daily Quests',
        'home.bonus_chest': '3/3 = Bonus Chest',

        'nav.home': 'Home',
        'nav.nuconnect': 'NuConnect',
        'nav.nufest': 'NuFest',
        'nav.numatch': 'NuMatch',

        'bubble.compatibility': 'Compatibility',
        'bubble.new_analysis': 'New Analysis',
        'bubble.daily_guide': 'Daily Guide',
        'bubble.moon_phase': 'Moon Phase',
        'bubble.decision_wheel': 'Destiny Wheel',
        'bubble.decision_calendar': 'Decision Calendar',
        'bubble.nufest': 'NuFest',
        'bubble.profile': 'Profile',

        'settings.title': 'Settings',
        'settings.personal_info': 'Personal Information',
        'settings.fullname': 'Full Name',
        'settings.birthdate': 'Birthdate',
        'settings.notifications': 'Notification Preferences',
        'settings.daily_insight': 'Daily Numerology Insight',
        'settings.lunar_alerts': 'Lunar Phase Alerts',
        'settings.system_notif': 'System Notifications',
        'settings.appearance': 'Appearance',
        'settings.dark_mode': 'Dark Mode',
        'settings.dark_active': 'Active',
        'settings.dark_inactive': 'Off',
        'settings.language': 'Language',
        'settings.subscription': 'Subscription & Billing',
        'settings.security': 'Security & Legal',
        'settings.change_password': 'Change Password',
        'settings.privacy_policy': 'Privacy Policy',
        'settings.terms': 'Terms of Service',
        'settings.logout': 'Log Out',
        'settings.delete_account': 'Delete Account',
        'settings.version_footer': 'Your spiritual data is encrypted using 256-bit AES protection.',
        'settings.upgrade': 'Upgrade to Premium',
        'settings.manage_sub': 'Manage Subscription',
        'settings.restore': 'Restore Purchases',
        'settings.free_plan': 'Free Plan',
        'settings.free_detail': 'Basic features · Limited usage',
        'settings.pw_title': 'Change Password',
        'settings.pw_desc': 'A password reset link will be sent to your email address.',
        'settings.pw_sent': '✓ Password reset link sent to your email!',
        'settings.pw_sending': 'Sending...',

        'birth.title': 'Birth Details',
        'birth.headline': 'Enter Your Birth Details',
        'birth.subtitle': 'Accurate data reveals your spiritual blueprint. Every detail aligns you with the cosmos.',
        'birth.fullname': 'Full Name',
        'birth.fullname_placeholder': 'Your full name',
        'birth.birthdate': 'Date of Birth',
        'birth.day': 'Day',
        'birth.month': 'Month',
        'birth.year': 'Year',
        'birth.time': 'Time of Birth',
        'birth.recommended': 'Recommended',
        'birth.country': 'Birth Country',
        'birth.select_country': 'Select Country',
        'birth.gender': 'Gender',
        'birth.male': 'Male',
        'birth.female': 'Female',
        'birth.calculate': 'Calculate Blueprint',
        'birth.alert_required': 'Please enter name and date of birth.',

        'profile.title': 'Soul Journey',
        'profile.life_path': 'Life Path',
        'profile.expression': 'Expression',
        'profile.soul_urge': 'Soul Urge',
        'profile.personality': 'Personality',
        'profile.name_analysis': 'Name Analysis',
        'profile.deep_insight': 'Deep Insight',
        'profile.compat_readings': 'Compatibility Readings',
        'profile.compat_empty': 'No compatibility analysis yet.',
        'profile.compat_hint': 'Start from the + menu below with "Soul Mate".',
        'profile.connection_requests': 'Connection Requests',
        'profile.no_requests': 'No pending requests',
        'profile.cosmic_match': 'Cosmic Match',
        'profile.discoverable': 'Be Discoverable',
        'profile.discoverable_desc': 'Let other users see you on the matching radar',
        'profile.refresh': 'Refresh My Soul Analysis',
        'profile.go_premium': 'Go Premium',
        'profile.sign_out': 'Sign Out',

        'notif.title': 'Notifications',
        'notif.empty': 'No new notifications',
        'notif.mark_all': 'Mark All as Read',
        'notif.connection_request': 'sent you a connection request',
        'notif.connection_accepted': 'accepted your connection request',
        'notif.new_message': 'sent you a new message',

        'month.01': 'January', 'month.02': 'February', 'month.03': 'March',
        'month.04': 'April', 'month.05': 'May', 'month.06': 'June',
        'month.07': 'July', 'month.08': 'August', 'month.09': 'September',
        'month.10': 'October', 'month.11': 'November', 'month.12': 'December',

        'vib.1': 'INITIATION', 'vib.2': 'EVALUATION', 'vib.3': 'EXPRESSION',
        'vib.4': 'STRUCTURE', 'vib.5': 'CHANGE', 'vib.6': 'STABILITY',
        'vib.7': 'ANALYSIS', 'vib.8': 'CONTROL', 'vib.9': 'COMPLETION',
        'vib.11': 'HIGH INTENSITY', 'vib.22': 'MASTER EXECUTION', 'vib.33': 'MASTER GUIDANCE',

        'conn.title': 'Soul Connections',
        'conn.mark_all_read': 'Mark all as read',
        'conn.soul_connections': 'Soul Connections'
    };

    // ═══ GERMAN ═══
    T.de = {
        'common.loading': 'Laden...',
        'common.error': 'Fehler',
        'common.success': 'Erfolg',
        'common.cancel': 'Abbrechen',
        'common.save': 'Speichern',
        'common.send': 'Senden',
        'common.close': 'Schließen',
        'common.back': 'Zurück',
        'common.next': 'Weiter',
        'common.yes': 'Ja',
        'common.no': 'Nein',
        'common.ok': 'OK',
        'common.search': 'Suchen',
        'common.open': 'ÖFFNEN',

        'signup.title': 'Registrieren',
        'signup.login_title': 'Anmelden',
        'signup.headline': 'Beginne deine Reise zu den Sternen',
        'signup.subtitle': 'Entschlüssle deine kosmische Blaupause und entdecke die Geheimnisse deiner Zahlen.',
        'signup.fullname': 'Vollständiger Name',
        'signup.fullname_placeholder': 'Gib deinen Geburtsnamen ein',
        'signup.email': 'E-Mail',
        'signup.email_placeholder': 'deine.seele@kosmos.com',
        'signup.password': 'Passwort erstellen',
        'signup.password_login': 'Passwort',
        'signup.btn_signup': 'Seelenkonto erstellen',
        'signup.btn_login': 'Bei Numantic anmelden',
        'signup.toggle_login': 'Bereits ein Konto?',
        'signup.toggle_signup': 'Kein Konto?',
        'signup.link_login': 'Anmelden',
        'signup.link_signup': 'Registrieren',
        'signup.alert_email_pass': 'Bitte gib deine E-Mail und dein Passwort ein.',
        'signup.alert_name': 'Bitte gib deinen Namen ein.',
        'signup.select_language': 'Sprache wählen',

        'home.celestial_guidance': 'Himmlische Führung',
        'home.greeting': 'Das Universum ist mit dir,',
        'home.personal_vibration': 'Persönliche Schwingung',
        'home.deep_insight': 'Tiefe Einsicht',
        'home.cosmic_navigator': 'Persönlicher Kosmischer Navigator',
        'home.explore_map': 'Karte erkunden',
        'home.soul_mate_analysis': 'Seelenpartner-Analyse',
        'home.soul_mate_desc': 'Die Sterne vereinen sich in einer göttlichen Verbindung der Wege.',
        'home.unveil_twin': 'Zwillingsflamme enthüllen',
        'home.cosmic_match': 'Cosmic Match',
        'home.cosmic_match_desc': 'Ein analytischer Blick auf die Frequenz deiner himmlischen Resonanz.',
        'home.measure_resonance': 'Resonanz messen',
        'home.decision_sphere': 'Entscheidungssphäre',
        'home.decision_sphere_desc': 'Klarheit für deine Zukunft durch göttliche Wahrscheinlichkeit.',
        'home.cast_inquiry': 'Anfrage stellen',
        'home.lunar_insights': 'Mond-Einblicke',
        'home.lunar_desc': 'Der abnehmende Mond lädt zur Selbstreflexion ein. Lass los, was dir nicht mehr dient.',
        'home.explore_cycles': 'Zyklen erkunden',
        'home.celestial_forecast': 'Himmlische Vorhersage',
        'home.celestial_desc': 'Stimme dich auf die planetaren Verschiebungen ab, um dein spirituelles Wachstum zu maximieren.',
        'home.view_trajectory': 'Verlauf ansehen',
        'home.manifest_portal': 'Manifestations-Portal',
        'home.manifest_desc': 'Die Leinwand des Raums — Deine Intentionen sind die Sterne deines Universums.',
        'home.enter_portal': 'Portal betreten',
        'home.daily_quests': 'Tägliche Aufgaben',
        'home.bonus_chest': '3/3 = Bonus-Truhe',

        'nav.home': 'Home', 'nav.nuconnect': 'NuConnect', 'nav.nufest': 'NuFest', 'nav.numatch': 'NuMatch',
        'bubble.compatibility': 'Kompatibilität', 'bubble.new_analysis': 'Neue Analyse', 'bubble.daily_guide': 'Tagesführer', 'bubble.moon_phase': 'Mondphase', 'bubble.decision_wheel': 'Schicksalsrad', 'bubble.decision_calendar': 'Kalender', 'bubble.nufest': 'NuFest', 'bubble.profile': 'Profil',

        'settings.title': 'Einstellungen', 'settings.personal_info': 'Persönliche Daten', 'settings.fullname': 'Vollständiger Name', 'settings.birthdate': 'Geburtsdatum', 'settings.notifications': 'Benachrichtigungen', 'settings.daily_insight': 'Tägliche Numerologie', 'settings.lunar_alerts': 'Mondphasen-Alarm', 'settings.system_notif': 'Systemmeldungen', 'settings.appearance': 'Erscheinungsbild', 'settings.dark_mode': 'Dunkelmodus', 'settings.dark_active': 'Aktiv', 'settings.dark_inactive': 'Aus', 'settings.language': 'Sprache', 'settings.subscription': 'Abo & Abrechnung', 'settings.security': 'Sicherheit & Recht', 'settings.change_password': 'Passwort ändern', 'settings.privacy_policy': 'Datenschutz', 'settings.terms': 'Nutzungsbedingungen', 'settings.logout': 'Abmelden', 'settings.delete_account': 'Konto löschen', 'settings.version_footer': 'Deine spirituellen Daten sind mit 256-Bit AES verschlüsselt.', 'settings.upgrade': 'Premium holen', 'settings.manage_sub': 'Abo verwalten', 'settings.restore': 'Käufe wiederherstellen', 'settings.free_plan': 'Kostenloser Plan', 'settings.free_detail': 'Grundfunktionen · Begrenzte Nutzung', 'settings.pw_title': 'Passwort ändern', 'settings.pw_desc': 'Ein Passwort-Link wird an deine E-Mail gesendet.', 'settings.pw_sent': '✓ Link gesendet!', 'settings.pw_sending': 'Wird gesendet...',

        'birth.title': 'Geburtsdaten', 'birth.headline': 'Gib deine Geburtsdaten ein', 'birth.subtitle': 'Genaue Daten enthüllen dein spirituelles Profil.', 'birth.fullname': 'Vollständiger Name', 'birth.fullname_placeholder': 'Dein vollständiger Name', 'birth.birthdate': 'Geburtsdatum', 'birth.day': 'Tag', 'birth.month': 'Monat', 'birth.year': 'Jahr', 'birth.time': 'Geburtszeit', 'birth.recommended': 'Empfohlen', 'birth.country': 'Geburtsland', 'birth.select_country': 'Land wählen', 'birth.gender': 'Geschlecht', 'birth.male': 'Männlich', 'birth.female': 'Weiblich', 'birth.calculate': 'Berechnen', 'birth.alert_required': 'Bitte Name und Geburtsdatum eingeben.',

        'profile.title': 'Seelenreise', 'profile.life_path': 'Lebenspfad', 'profile.expression': 'Ausdruck', 'profile.soul_urge': 'Seelendrang', 'profile.personality': 'Persönlichkeit', 'profile.name_analysis': 'Namensanalyse', 'profile.deep_insight': 'Tiefeneinblick', 'profile.compat_readings': 'Kompatibilitätsanalysen', 'profile.compat_empty': 'Noch keine Kompatibilitätsanalyse.', 'profile.compat_hint': 'Starte über das + Menü mit "Seelenpartner".', 'profile.connection_requests': 'Verbindungsanfragen', 'profile.no_requests': 'Keine Anfragen', 'profile.cosmic_match': 'Cosmic Match', 'profile.discoverable': 'Auffindbar sein', 'profile.discoverable_desc': 'Andere Nutzer können dich sehen', 'profile.refresh': 'Analyse aktualisieren', 'profile.go_premium': 'Premium holen', 'profile.sign_out': 'Abmelden',

        'notif.title': 'Benachrichtigungen', 'notif.empty': 'Keine neuen Benachrichtigungen', 'notif.mark_all': 'Alle als gelesen markieren', 'notif.connection_request': 'hat dir eine Verbindungsanfrage gesendet', 'notif.connection_accepted': 'hat deine Anfrage akzeptiert', 'notif.new_message': 'hat dir eine Nachricht gesendet',

        'month.01': 'Januar', 'month.02': 'Februar', 'month.03': 'März', 'month.04': 'April', 'month.05': 'Mai', 'month.06': 'Juni', 'month.07': 'Juli', 'month.08': 'August', 'month.09': 'September', 'month.10': 'Oktober', 'month.11': 'November', 'month.12': 'Dezember',

        'vib.1': 'INITIATION', 'vib.2': 'BEWERTUNG', 'vib.3': 'AUSDRUCK', 'vib.4': 'STRUKTUR', 'vib.5': 'WANDEL', 'vib.6': 'STABILITÄT', 'vib.7': 'ANALYSE', 'vib.8': 'KONTROLLE', 'vib.9': 'VOLLENDUNG', 'vib.11': 'HOHE INTENSITÄT', 'vib.22': 'MEISTER-AUSFÜHRUNG', 'vib.33': 'MEISTER-FÜHRUNG',

        'conn.title': 'Seelenverbindungen', 'conn.mark_all_read': 'Alle als gelesen markieren', 'conn.soul_connections': 'Seelenverbindungen'
    };

    // ═══ FRENCH ═══
    T.fr = {
        'common.loading': 'Chargement...', 'common.error': 'Erreur', 'common.success': 'Succès', 'common.cancel': 'Annuler', 'common.save': 'Enregistrer', 'common.send': 'Envoyer', 'common.close': 'Fermer', 'common.back': 'Retour', 'common.next': 'Suivant', 'common.yes': 'Oui', 'common.no': 'Non', 'common.ok': 'OK', 'common.search': 'Rechercher', 'common.open': 'OUVRIR',

        'signup.title': 'Inscription', 'signup.login_title': 'Connexion', 'signup.headline': 'Commence ton voyage vers les étoiles', 'signup.subtitle': 'Déverrouille ton plan cosmique et découvre les secrets cachés dans tes nombres.', 'signup.fullname': 'Nom complet', 'signup.fullname_placeholder': 'Entre ton nom de naissance', 'signup.email': 'E-mail', 'signup.email_placeholder': 'ton.ame@cosmos.com', 'signup.password': 'Créer un mot de passe', 'signup.password_login': 'Mot de passe', 'signup.btn_signup': 'Créer un compte', 'signup.btn_login': 'Se connecter', 'signup.toggle_login': 'Déjà un compte ?', 'signup.toggle_signup': 'Pas encore de compte ?', 'signup.link_login': 'Connexion', 'signup.link_signup': 'Inscription', 'signup.alert_email_pass': 'Veuillez entrer votre e-mail et mot de passe.', 'signup.alert_name': 'Veuillez entrer votre nom.', 'signup.select_language': 'Choisir la langue',

        'home.celestial_guidance': 'Guidance Céleste', 'home.greeting': "L'Univers est aligné avec toi,", 'home.personal_vibration': 'Vibration Personnelle', 'home.deep_insight': 'Analyse Profonde', 'home.cosmic_navigator': 'Navigateur Cosmique', 'home.explore_map': 'Explorer', 'home.soul_mate_analysis': 'Analyse Âme Sœur', 'home.soul_mate_desc': 'Les étoiles convergent dans une union divine des chemins.', 'home.unveil_twin': 'Révéler la Flamme', 'home.cosmic_match': 'Cosmic Match', 'home.cosmic_match_desc': 'Une plongée analytique dans la fréquence de ta résonance céleste.', 'home.measure_resonance': 'Mesurer la Résonance', 'home.decision_sphere': 'Sphère de Décision', 'home.decision_sphere_desc': 'Clarté pour tes chemins futurs à travers la probabilité divine.', 'home.cast_inquiry': 'Poser ta Question', 'home.lunar_insights': 'Aperçus Lunaires', 'home.lunar_desc': 'Le croissant décroissant invite à l\'introspection. Libère ce qui ne te sert plus.', 'home.explore_cycles': 'Explorer les Cycles', 'home.celestial_forecast': 'Prévisions Célestes', 'home.celestial_desc': 'Aligne-toi avec les changements planétaires pour maximiser ta croissance spirituelle.', 'home.view_trajectory': 'Voir la Trajectoire', 'home.manifest_portal': 'Portail de Manifestation', 'home.manifest_desc': 'La Toile de l\'Espace — Tes intentions sont les étoiles de ton univers.', 'home.enter_portal': 'Entrer dans le Portail', 'home.daily_quests': 'Quêtes Quotidiennes', 'home.bonus_chest': '3/3 = Coffre Bonus',

        'nav.home': 'Home', 'nav.nuconnect': 'NuConnect', 'nav.nufest': 'NuFest', 'nav.numatch': 'NuMatch',
        'bubble.compatibility': 'Compatibilité', 'bubble.new_analysis': 'Nouvelle Analyse', 'bubble.daily_guide': 'Guide Quotidien', 'bubble.moon_phase': 'Phase Lunaire', 'bubble.decision_wheel': 'Roue du Destin', 'bubble.decision_calendar': 'Calendrier', 'bubble.nufest': 'NuFest', 'bubble.profile': 'Profil',

        'settings.title': 'Paramètres', 'settings.personal_info': 'Informations Personnelles', 'settings.fullname': 'Nom complet', 'settings.birthdate': 'Date de naissance', 'settings.notifications': 'Préférences de Notification', 'settings.daily_insight': 'Numérologie Quotidienne', 'settings.lunar_alerts': 'Alertes Lunaires', 'settings.system_notif': 'Notifications Système', 'settings.appearance': 'Apparence', 'settings.dark_mode': 'Mode Sombre', 'settings.dark_active': 'Actif', 'settings.dark_inactive': 'Désactivé', 'settings.language': 'Langue', 'settings.subscription': 'Abonnement & Facturation', 'settings.security': 'Sécurité & Juridique', 'settings.change_password': 'Changer le mot de passe', 'settings.privacy_policy': 'Politique de confidentialité', 'settings.terms': "Conditions d'utilisation", 'settings.logout': 'Déconnexion', 'settings.delete_account': 'Supprimer le compte', 'settings.version_footer': 'Vos données sont chiffrées avec AES 256 bits.', 'settings.upgrade': 'Passer à Premium', 'settings.manage_sub': 'Gérer l\'abonnement', 'settings.restore': 'Restaurer les achats', 'settings.free_plan': 'Plan Gratuit', 'settings.free_detail': 'Fonctions de base · Utilisation limitée', 'settings.pw_title': 'Changer le mot de passe', 'settings.pw_desc': 'Un lien de réinitialisation sera envoyé à votre e-mail.', 'settings.pw_sent': '✓ Lien envoyé !', 'settings.pw_sending': 'Envoi en cours...',

        'birth.title': 'Détails de Naissance', 'birth.headline': 'Entrez vos détails de naissance', 'birth.subtitle': 'Des données précises révèlent votre plan spirituel.', 'birth.fullname': 'Nom complet', 'birth.fullname_placeholder': 'Votre nom complet', 'birth.birthdate': 'Date de naissance', 'birth.day': 'Jour', 'birth.month': 'Mois', 'birth.year': 'Année', 'birth.time': 'Heure de naissance', 'birth.recommended': 'Recommandé', 'birth.country': 'Pays de naissance', 'birth.select_country': 'Choisir le pays', 'birth.gender': 'Genre', 'birth.male': 'Homme', 'birth.female': 'Femme', 'birth.calculate': 'Calculer le Plan', 'birth.alert_required': 'Veuillez entrer nom et date de naissance.',

        'profile.title': 'Voyage de l\'Âme', 'profile.life_path': 'Chemin de Vie', 'profile.expression': 'Expression', 'profile.soul_urge': 'Désir de l\'Âme', 'profile.personality': 'Personnalité', 'profile.name_analysis': 'Analyse du Nom', 'profile.deep_insight': 'Analyse Profonde', 'profile.compat_readings': 'Lectures de Compatibilité', 'profile.compat_empty': 'Pas encore d\'analyse de compatibilité.', 'profile.compat_hint': 'Commence depuis le menu + avec "Âme Sœur".', 'profile.connection_requests': 'Demandes de Connexion', 'profile.no_requests': 'Aucune demande', 'profile.cosmic_match': 'Cosmic Match', 'profile.discoverable': 'Être Découvrable', 'profile.discoverable_desc': 'Les autres utilisateurs peuvent te voir', 'profile.refresh': 'Actualiser mon Analyse', 'profile.go_premium': 'Passer Premium', 'profile.sign_out': 'Déconnexion',

        'notif.title': 'Notifications', 'notif.empty': 'Aucune nouvelle notification', 'notif.mark_all': 'Tout marquer comme lu', 'notif.connection_request': 't\'a envoyé une demande de connexion', 'notif.connection_accepted': 'a accepté ta demande', 'notif.new_message': 't\'a envoyé un message',

        'month.01': 'Janvier', 'month.02': 'Février', 'month.03': 'Mars', 'month.04': 'Avril', 'month.05': 'Mai', 'month.06': 'Juin', 'month.07': 'Juillet', 'month.08': 'Août', 'month.09': 'Septembre', 'month.10': 'Octobre', 'month.11': 'Novembre', 'month.12': 'Décembre',

        'vib.1': 'INITIATION', 'vib.2': 'ÉVALUATION', 'vib.3': 'EXPRESSION', 'vib.4': 'STRUCTURE', 'vib.5': 'CHANGEMENT', 'vib.6': 'STABILITÉ', 'vib.7': 'ANALYSE', 'vib.8': 'CONTRÔLE', 'vib.9': 'ACHÈVEMENT', 'vib.11': 'HAUTE INTENSITÉ', 'vib.22': 'EXÉCUTION MAÎTRE', 'vib.33': 'GUIDANCE MAÎTRE',

        'conn.title': 'Connexions de l\'Âme', 'conn.mark_all_read': 'Tout marquer comme lu', 'conn.soul_connections': 'Connexions de l\'Âme'
    };

    // ═══ SPANISH ═══
    T.es = {
        'common.loading': 'Cargando...', 'common.error': 'Error', 'common.success': 'Éxito', 'common.cancel': 'Cancelar', 'common.save': 'Guardar', 'common.send': 'Enviar', 'common.close': 'Cerrar', 'common.back': 'Atrás', 'common.next': 'Siguiente', 'common.yes': 'Sí', 'common.no': 'No', 'common.ok': 'OK', 'common.search': 'Buscar', 'common.open': 'ABRIR',

        'signup.title': 'Registrarse', 'signup.login_title': 'Iniciar sesión', 'signup.headline': 'Comienza tu viaje hacia las estrellas', 'signup.subtitle': 'Desbloquea tu mapa cósmico y descubre los secretos ocultos en tus números.', 'signup.fullname': 'Nombre completo', 'signup.fullname_placeholder': 'Ingresa tu nombre de nacimiento', 'signup.email': 'Correo electrónico', 'signup.email_placeholder': 'tu.alma@cosmos.com', 'signup.password': 'Crear contraseña', 'signup.password_login': 'Contraseña', 'signup.btn_signup': 'Crear cuenta del alma', 'signup.btn_login': 'Iniciar sesión en Numantic', 'signup.toggle_login': '¿Ya tienes una cuenta?', 'signup.toggle_signup': '¿No tienes cuenta?', 'signup.link_login': 'Iniciar sesión', 'signup.link_signup': 'Registrarse', 'signup.alert_email_pass': 'Por favor, ingresa tu correo y contraseña.', 'signup.alert_name': 'Por favor, ingresa tu nombre.', 'signup.select_language': 'Seleccionar idioma',

        'home.celestial_guidance': 'Guía Celestial', 'home.greeting': 'El Universo está alineado contigo,', 'home.personal_vibration': 'Vibración Personal', 'home.deep_insight': 'Análisis Profundo', 'home.cosmic_navigator': 'Navegador Cósmico Personal', 'home.explore_map': 'Explorar Mapa', 'home.soul_mate_analysis': 'Análisis de Alma Gemela', 'home.soul_mate_desc': 'Las estrellas convergen en una unión divina de caminos.', 'home.unveil_twin': 'Revelar la Llama Gemela', 'home.cosmic_match': 'Cosmic Match', 'home.cosmic_match_desc': 'Un análisis profundo de la frecuencia de tu resonancia celestial.', 'home.measure_resonance': 'Medir Resonancia', 'home.decision_sphere': 'Esfera de Decisión', 'home.decision_sphere_desc': 'Claridad para tus caminos futuros a través de la probabilidad divina.', 'home.cast_inquiry': 'Haz tu Consulta', 'home.lunar_insights': 'Perspectivas Lunares', 'home.lunar_desc': 'La luna menguante invita a la introspección. Libera lo que ya no te sirve.', 'home.explore_cycles': 'Explorar Ciclos', 'home.celestial_forecast': 'Pronóstico Celestial', 'home.celestial_desc': 'Alinéate con los cambios planetarios para maximizar tu crecimiento espiritual.', 'home.view_trajectory': 'Ver Trayectoria', 'home.manifest_portal': 'Portal de Manifestación', 'home.manifest_desc': 'El Lienzo del Espacio — Tus intenciones son las estrellas de tu universo.', 'home.enter_portal': 'Entrar al Portal', 'home.daily_quests': 'Misiones Diarias', 'home.bonus_chest': '3/3 = Cofre Bonus',

        'nav.home': 'Home', 'nav.nuconnect': 'NuConnect', 'nav.nufest': 'NuFest', 'nav.numatch': 'NuMatch',
        'bubble.compatibility': 'Compatibilidad', 'bubble.new_analysis': 'Nuevo Análisis', 'bubble.daily_guide': 'Guía Diaria', 'bubble.moon_phase': 'Fase Lunar', 'bubble.decision_wheel': 'Rueda del Destino', 'bubble.decision_calendar': 'Calendario', 'bubble.nufest': 'NuFest', 'bubble.profile': 'Perfil',

        'settings.title': 'Ajustes', 'settings.personal_info': 'Información Personal', 'settings.fullname': 'Nombre completo', 'settings.birthdate': 'Fecha de nacimiento', 'settings.notifications': 'Preferencias de Notificación', 'settings.daily_insight': 'Numerología Diaria', 'settings.lunar_alerts': 'Alertas Lunares', 'settings.system_notif': 'Notificaciones del Sistema', 'settings.appearance': 'Apariencia', 'settings.dark_mode': 'Modo Oscuro', 'settings.dark_active': 'Activo', 'settings.dark_inactive': 'Desactivado', 'settings.language': 'Idioma', 'settings.subscription': 'Suscripción y Facturación', 'settings.security': 'Seguridad y Legal', 'settings.change_password': 'Cambiar contraseña', 'settings.privacy_policy': 'Política de privacidad', 'settings.terms': 'Términos de servicio', 'settings.logout': 'Cerrar sesión', 'settings.delete_account': 'Eliminar cuenta', 'settings.version_footer': 'Tus datos están cifrados con protección AES de 256 bits.', 'settings.upgrade': 'Obtener Premium', 'settings.manage_sub': 'Gestionar suscripción', 'settings.restore': 'Restaurar compras', 'settings.free_plan': 'Plan Gratuito', 'settings.free_detail': 'Funciones básicas · Uso limitado', 'settings.pw_title': 'Cambiar contraseña', 'settings.pw_desc': 'Se enviará un enlace de restablecimiento a tu correo.', 'settings.pw_sent': '✓ ¡Enlace enviado!', 'settings.pw_sending': 'Enviando...',

        'birth.title': 'Datos de Nacimiento', 'birth.headline': 'Ingresa tus datos de nacimiento', 'birth.subtitle': 'Datos precisos revelan tu mapa espiritual.', 'birth.fullname': 'Nombre completo', 'birth.fullname_placeholder': 'Tu nombre completo', 'birth.birthdate': 'Fecha de nacimiento', 'birth.day': 'Día', 'birth.month': 'Mes', 'birth.year': 'Año', 'birth.time': 'Hora de nacimiento', 'birth.recommended': 'Recomendado', 'birth.country': 'País de nacimiento', 'birth.select_country': 'Seleccionar país', 'birth.gender': 'Género', 'birth.male': 'Masculino', 'birth.female': 'Femenino', 'birth.calculate': 'Calcular Mapa', 'birth.alert_required': 'Por favor ingresa nombre y fecha de nacimiento.',

        'profile.title': 'Viaje del Alma', 'profile.life_path': 'Camino de Vida', 'profile.expression': 'Expresión', 'profile.soul_urge': 'Deseo del Alma', 'profile.personality': 'Personalidad', 'profile.name_analysis': 'Análisis del Nombre', 'profile.deep_insight': 'Análisis Profundo', 'profile.compat_readings': 'Lecturas de Compatibilidad', 'profile.compat_empty': 'Aún no hay análisis de compatibilidad.', 'profile.compat_hint': 'Comienza desde el menú + con "Alma Gemela".', 'profile.connection_requests': 'Solicitudes de Conexión', 'profile.no_requests': 'Sin solicitudes pendientes', 'profile.cosmic_match': 'Cosmic Match', 'profile.discoverable': 'Ser Descubrible', 'profile.discoverable_desc': 'Otros usuarios pueden verte en el radar', 'profile.refresh': 'Actualizar mi Análisis', 'profile.go_premium': 'Obtener Premium', 'profile.sign_out': 'Cerrar sesión',

        'notif.title': 'Notificaciones', 'notif.empty': 'Sin nuevas notificaciones', 'notif.mark_all': 'Marcar todo como leído', 'notif.connection_request': 'te envió una solicitud de conexión', 'notif.connection_accepted': 'aceptó tu solicitud', 'notif.new_message': 'te envió un mensaje',

        'month.01': 'Enero', 'month.02': 'Febrero', 'month.03': 'Marzo', 'month.04': 'Abril', 'month.05': 'Mayo', 'month.06': 'Junio', 'month.07': 'Julio', 'month.08': 'Agosto', 'month.09': 'Septiembre', 'month.10': 'Octubre', 'month.11': 'Noviembre', 'month.12': 'Diciembre',

        'vib.1': 'INICIACIÓN', 'vib.2': 'EVALUACIÓN', 'vib.3': 'EXPRESIÓN', 'vib.4': 'ESTRUCTURA', 'vib.5': 'CAMBIO', 'vib.6': 'ESTABILIDAD', 'vib.7': 'ANÁLISIS', 'vib.8': 'CONTROL', 'vib.9': 'COMPLETACIÓN', 'vib.11': 'ALTA INTENSIDAD', 'vib.22': 'EJECUCIÓN MAESTRA', 'vib.33': 'GUÍA MAESTRA',

        'conn.title': 'Conexiones del Alma', 'conn.mark_all_read': 'Marcar todo como leído', 'conn.soul_connections': 'Conexiones del Alma'
    };

    // ═══ ARABIC ═══
    T.ar = {
        'common.loading': '...جاري التحميل', 'common.error': 'خطأ', 'common.success': 'نجاح', 'common.cancel': 'إلغاء', 'common.save': 'حفظ', 'common.send': 'إرسال', 'common.close': 'إغلاق', 'common.back': 'رجوع', 'common.next': 'التالي', 'common.yes': 'نعم', 'common.no': 'لا', 'common.ok': 'حسناً', 'common.search': 'بحث', 'common.open': 'فتح',

        'signup.title': 'إنشاء حساب', 'signup.login_title': 'تسجيل الدخول', 'signup.headline': 'ابدأ رحلتك نحو النجوم', 'signup.subtitle': 'افتح خريطتك الكونية واكتشف الأسرار المخفية في أرقامك.', 'signup.fullname': 'الاسم الكامل', 'signup.fullname_placeholder': 'أدخل اسم ميلادك', 'signup.email': 'البريد الإلكتروني', 'signup.email_placeholder': 'روحك@الكون.com', 'signup.password': 'إنشاء كلمة مرور', 'signup.password_login': 'كلمة المرور', 'signup.btn_signup': 'إنشاء حساب الروح', 'signup.btn_login': 'تسجيل الدخول', 'signup.toggle_login': 'لديك حساب بالفعل؟', 'signup.toggle_signup': 'ليس لديك حساب؟', 'signup.link_login': 'تسجيل الدخول', 'signup.link_signup': 'إنشاء حساب', 'signup.alert_email_pass': 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.', 'signup.alert_name': 'الرجاء إدخال اسمك.', 'signup.select_language': 'اختر اللغة',

        'home.celestial_guidance': 'التوجيه السماوي', 'home.greeting': 'الكون متناغم معك،', 'home.personal_vibration': 'الذبذبة الشخصية', 'home.deep_insight': 'تحليل عميق', 'home.cosmic_navigator': 'الملاح الكوني الشخصي', 'home.explore_map': 'استكشف الخريطة', 'home.soul_mate_analysis': 'تحليل توأم الروح', 'home.soul_mate_desc': 'النجوم تتقارب في اتحاد إلهي للمسارات.', 'home.unveil_twin': 'اكشف الشعلة التوأم', 'home.cosmic_match': 'Cosmic Match', 'home.cosmic_match_desc': 'غوص تحليلي في تردد رنينك السماوي.', 'home.measure_resonance': 'قياس الرنين', 'home.decision_sphere': 'كرة القرار', 'home.decision_sphere_desc': 'وضوح لمساراتك المستقبلية من خلال الاحتمال الإلهي.', 'home.cast_inquiry': 'اطرح استفسارك', 'home.lunar_insights': 'رؤى قمرية', 'home.lunar_desc': 'الهلال المتناقص يدعو للتأمل الذاتي.', 'home.explore_cycles': 'استكشف الدورات', 'home.celestial_forecast': 'التوقعات السماوية', 'home.celestial_desc': 'تناغم مع التحولات الكوكبية لتعظيم نموك الروحي.', 'home.view_trajectory': 'عرض المسار', 'home.manifest_portal': 'بوابة التجلي', 'home.manifest_desc': 'لوحة الفضاء — نواياك هي النجوم التي تضيء عالمك.', 'home.enter_portal': 'ادخل البوابة', 'home.daily_quests': 'المهام اليومية', 'home.bonus_chest': '3/3 = صندوق إضافي',

        'nav.home': 'Home', 'nav.nuconnect': 'NuConnect', 'nav.nufest': 'NuFest', 'nav.numatch': 'NuMatch',
        'bubble.compatibility': 'التوافق', 'bubble.new_analysis': 'تحليل جديد', 'bubble.daily_guide': 'الدليل اليومي', 'bubble.moon_phase': 'طور القمر', 'bubble.decision_wheel': 'عجلة القدر', 'bubble.decision_calendar': 'التقويم', 'bubble.nufest': 'NuFest', 'bubble.profile': 'الملف الشخصي',

        'settings.title': 'الإعدادات', 'settings.personal_info': 'المعلومات الشخصية', 'settings.fullname': 'الاسم الكامل', 'settings.birthdate': 'تاريخ الميلاد', 'settings.notifications': 'تفضيلات الإشعارات', 'settings.daily_insight': 'رؤية عددية يومية', 'settings.lunar_alerts': 'تنبيهات القمر', 'settings.system_notif': 'إشعارات النظام', 'settings.appearance': 'المظهر', 'settings.dark_mode': 'الوضع الداكن', 'settings.dark_active': 'مفعّل', 'settings.dark_inactive': 'معطّل', 'settings.language': 'اللغة', 'settings.subscription': 'الاشتراك والفوترة', 'settings.security': 'الأمان والقانون', 'settings.change_password': 'تغيير كلمة المرور', 'settings.privacy_policy': 'سياسة الخصوصية', 'settings.terms': 'شروط الخدمة', 'settings.logout': 'تسجيل الخروج', 'settings.delete_account': 'حذف الحساب', 'settings.version_footer': 'بياناتك الروحية مشفرة بحماية AES 256 بت.', 'settings.upgrade': 'الترقية إلى بريميوم', 'settings.manage_sub': 'إدارة الاشتراك', 'settings.restore': 'استعادة المشتريات', 'settings.free_plan': 'الخطة المجانية', 'settings.free_detail': 'ميزات أساسية · استخدام محدود', 'settings.pw_title': 'تغيير كلمة المرور', 'settings.pw_desc': 'سيتم إرسال رابط إعادة التعيين إلى بريدك.', 'settings.pw_sent': '✓ تم إرسال الرابط!', 'settings.pw_sending': '...جاري الإرسال',

        'birth.title': 'بيانات الميلاد', 'birth.headline': 'أدخل بيانات ميلادك', 'birth.subtitle': 'البيانات الدقيقة تكشف خريطتك الروحية.', 'birth.fullname': 'الاسم الكامل', 'birth.fullname_placeholder': 'اسمك الكامل', 'birth.birthdate': 'تاريخ الميلاد', 'birth.day': 'يوم', 'birth.month': 'شهر', 'birth.year': 'سنة', 'birth.time': 'وقت الولادة', 'birth.recommended': 'موصى به', 'birth.country': 'بلد الميلاد', 'birth.select_country': 'اختر البلد', 'birth.gender': 'الجنس', 'birth.male': 'ذكر', 'birth.female': 'أنثى', 'birth.calculate': 'احسب الخريطة', 'birth.alert_required': 'الرجاء إدخال الاسم وتاريخ الميلاد.',

        'profile.title': 'رحلة الروح', 'profile.life_path': 'مسار الحياة', 'profile.expression': 'التعبير', 'profile.soul_urge': 'دافع الروح', 'profile.personality': 'الشخصية', 'profile.name_analysis': 'تحليل الاسم', 'profile.deep_insight': 'تحليل عميق', 'profile.compat_readings': 'قراءات التوافق', 'profile.compat_empty': 'لا يوجد تحليل توافق بعد.', 'profile.compat_hint': 'ابدأ من قائمة + مع "توأم الروح".', 'profile.connection_requests': 'طلبات الاتصال', 'profile.no_requests': 'لا توجد طلبات', 'profile.cosmic_match': 'Cosmic Match', 'profile.discoverable': 'كن قابلاً للاكتشاف', 'profile.discoverable_desc': 'يمكن للمستخدمين الآخرين رؤيتك', 'profile.refresh': 'تحديث تحليلي', 'profile.go_premium': 'الترقية لبريميوم', 'profile.sign_out': 'تسجيل الخروج',

        'notif.title': 'الإشعارات', 'notif.empty': 'لا توجد إشعارات جديدة', 'notif.mark_all': 'تحديد الكل كمقروء', 'notif.connection_request': 'أرسل لك طلب اتصال', 'notif.connection_accepted': 'قبل طلب الاتصال', 'notif.new_message': 'أرسل لك رسالة جديدة',

        'month.01': 'يناير', 'month.02': 'فبراير', 'month.03': 'مارس', 'month.04': 'أبريل', 'month.05': 'مايو', 'month.06': 'يونيو', 'month.07': 'يوليو', 'month.08': 'أغسطس', 'month.09': 'سبتمبر', 'month.10': 'أكتوبر', 'month.11': 'نوفمبر', 'month.12': 'ديسمبر',

        'vib.1': 'بداية', 'vib.2': 'تقييم', 'vib.3': 'تعبير', 'vib.4': 'بنية', 'vib.5': 'تغيير', 'vib.6': 'استقرار', 'vib.7': 'تحليل', 'vib.8': 'سيطرة', 'vib.9': 'اكتمال', 'vib.11': 'كثافة عالية', 'vib.22': 'تنفيذ متقن', 'vib.33': 'توجيه متقن',

        'conn.title': 'روابط الروح', 'conn.mark_all_read': 'تحديد الكل كمقروء', 'conn.soul_connections': 'روابط الروح'
    };

    // ═══ RUSSIAN ═══
    T.ru = {
        'common.loading': 'Загрузка...', 'common.error': 'Ошибка', 'common.success': 'Успех', 'common.cancel': 'Отмена', 'common.save': 'Сохранить', 'common.send': 'Отправить', 'common.close': 'Закрыть', 'common.back': 'Назад', 'common.next': 'Далее', 'common.yes': 'Да', 'common.no': 'Нет', 'common.ok': 'ОК', 'common.search': 'Поиск', 'common.open': 'ОТКРЫТЬ',

        'signup.title': 'Регистрация', 'signup.login_title': 'Вход', 'signup.headline': 'Начни свое путешествие к звездам', 'signup.subtitle': 'Раскрой свой космический чертеж и открой тайны, скрытые в числах.', 'signup.fullname': 'Полное имя', 'signup.fullname_placeholder': 'Введите имя при рождении', 'signup.email': 'Эл. почта', 'signup.email_placeholder': 'твоя.душа@космос.com', 'signup.password': 'Создать пароль', 'signup.password_login': 'Пароль', 'signup.btn_signup': 'Создать аккаунт', 'signup.btn_login': 'Войти в Numantic', 'signup.toggle_login': 'Уже есть аккаунт?', 'signup.toggle_signup': 'Нет аккаунта?', 'signup.link_login': 'Войти', 'signup.link_signup': 'Регистрация', 'signup.alert_email_pass': 'Пожалуйста, введите email и пароль.', 'signup.alert_name': 'Пожалуйста, введите имя.', 'signup.select_language': 'Выберите язык',

        'home.celestial_guidance': 'Небесное Руководство', 'home.greeting': 'Вселенная настроена на тебя,', 'home.personal_vibration': 'Личная Вибрация', 'home.deep_insight': 'Глубокий Анализ', 'home.cosmic_navigator': 'Личный Космический Навигатор', 'home.explore_map': 'Исследовать', 'home.soul_mate_analysis': 'Анализ Родственной Души', 'home.soul_mate_desc': 'Звезды сходятся в божественном союзе путей.', 'home.unveil_twin': 'Раскрыть Близнецовое Пламя', 'home.cosmic_match': 'Cosmic Match', 'home.cosmic_match_desc': 'Аналитическое погружение в частоту вашего небесного резонанса.', 'home.measure_resonance': 'Измерить Резонанс', 'home.decision_sphere': 'Сфера Решений', 'home.decision_sphere_desc': 'Ясность для ваших будущих путей через призму божественной вероятности.', 'home.cast_inquiry': 'Задать Вопрос', 'home.lunar_insights': 'Лунные Озарения', 'home.lunar_desc': 'Убывающий полумесяц приглашает к самоанализу.', 'home.explore_cycles': 'Исследовать Циклы', 'home.celestial_forecast': 'Небесный Прогноз', 'home.celestial_desc': 'Настройтесь на планетарные сдвиги для максимального духовного роста.', 'home.view_trajectory': 'Смотреть Траекторию', 'home.manifest_portal': 'Портал Манифестации', 'home.manifest_desc': 'Холст Пространства — Ваши намерения — звезды вашей вселенной.', 'home.enter_portal': 'Войти в Портал', 'home.daily_quests': 'Ежедневные Задания', 'home.bonus_chest': '3/3 = Бонусный Сундук',

        'nav.home': 'Home', 'nav.nuconnect': 'NuConnect', 'nav.nufest': 'NuFest', 'nav.numatch': 'NuMatch',
        'bubble.compatibility': 'Совместимость', 'bubble.new_analysis': 'Новый Анализ', 'bubble.daily_guide': 'Дневной Гид', 'bubble.moon_phase': 'Фаза Луны', 'bubble.decision_wheel': 'Колесо Судьбы', 'bubble.decision_calendar': 'Календарь', 'bubble.nufest': 'NuFest', 'bubble.profile': 'Профиль',

        'settings.title': 'Настройки', 'settings.personal_info': 'Личная Информация', 'settings.fullname': 'Полное имя', 'settings.birthdate': 'Дата рождения', 'settings.notifications': 'Уведомления', 'settings.daily_insight': 'Ежедневная Нумерология', 'settings.lunar_alerts': 'Лунные Оповещения', 'settings.system_notif': 'Системные Уведомления', 'settings.appearance': 'Внешний Вид', 'settings.dark_mode': 'Темный Режим', 'settings.dark_active': 'Активен', 'settings.dark_inactive': 'Выкл', 'settings.language': 'Язык', 'settings.subscription': 'Подписка и Оплата', 'settings.security': 'Безопасность', 'settings.change_password': 'Сменить пароль', 'settings.privacy_policy': 'Политика конфиденциальности', 'settings.terms': 'Условия использования', 'settings.logout': 'Выйти', 'settings.delete_account': 'Удалить аккаунт', 'settings.version_footer': 'Ваши данные зашифрованы 256-битным AES.', 'settings.upgrade': 'Перейти на Premium', 'settings.manage_sub': 'Управление подпиской', 'settings.restore': 'Восстановить покупки', 'settings.free_plan': 'Бесплатный План', 'settings.free_detail': 'Базовые функции · Ограниченное использование', 'settings.pw_title': 'Сменить пароль', 'settings.pw_desc': 'Ссылка для сброса будет отправлена на ваш email.', 'settings.pw_sent': '✓ Ссылка отправлена!', 'settings.pw_sending': 'Отправка...',

        'birth.title': 'Данные Рождения', 'birth.headline': 'Введите данные рождения', 'birth.subtitle': 'Точные данные раскрывают вашу духовную карту.', 'birth.fullname': 'Полное имя', 'birth.fullname_placeholder': 'Ваше полное имя', 'birth.birthdate': 'Дата рождения', 'birth.day': 'День', 'birth.month': 'Месяц', 'birth.year': 'Год', 'birth.time': 'Время рождения', 'birth.recommended': 'Рекомендуется', 'birth.country': 'Страна рождения', 'birth.select_country': 'Выберите страну', 'birth.gender': 'Пол', 'birth.male': 'Мужской', 'birth.female': 'Женский', 'birth.calculate': 'Рассчитать Карту', 'birth.alert_required': 'Введите имя и дату рождения.',

        'profile.title': 'Путешествие Души', 'profile.life_path': 'Путь Жизни', 'profile.expression': 'Выражение', 'profile.soul_urge': 'Зов Души', 'profile.personality': 'Личность', 'profile.name_analysis': 'Анализ Имени', 'profile.deep_insight': 'Глубокий Анализ', 'profile.compat_readings': 'Анализы Совместимости', 'profile.compat_empty': 'Пока нет анализа совместимости.', 'profile.compat_hint': 'Начните с меню + и "Родственная Душа".', 'profile.connection_requests': 'Запросы на Связь', 'profile.no_requests': 'Нет ожидающих запросов', 'profile.cosmic_match': 'Cosmic Match', 'profile.discoverable': 'Быть Обнаруживаемым', 'profile.discoverable_desc': 'Другие пользователи смогут вас видеть', 'profile.refresh': 'Обновить Анализ', 'profile.go_premium': 'Перейти на Premium', 'profile.sign_out': 'Выйти',

        'notif.title': 'Уведомления', 'notif.empty': 'Нет новых уведомлений', 'notif.mark_all': 'Отметить все как прочитанные', 'notif.connection_request': 'отправил вам запрос на связь', 'notif.connection_accepted': 'принял ваш запрос', 'notif.new_message': 'отправил вам сообщение',

        'month.01': 'Январь', 'month.02': 'Февраль', 'month.03': 'Март', 'month.04': 'Апрель', 'month.05': 'Май', 'month.06': 'Июнь', 'month.07': 'Июль', 'month.08': 'Август', 'month.09': 'Сентябрь', 'month.10': 'Октябрь', 'month.11': 'Ноябрь', 'month.12': 'Декабрь',

        'vib.1': 'ИНИЦИАЦИЯ', 'vib.2': 'ОЦЕНКА', 'vib.3': 'ВЫРАЖЕНИЕ', 'vib.4': 'СТРУКТУРА', 'vib.5': 'ПЕРЕМЕНЫ', 'vib.6': 'СТАБИЛЬНОСТЬ', 'vib.7': 'АНАЛИЗ', 'vib.8': 'КОНТРОЛЬ', 'vib.9': 'ЗАВЕРШЕНИЕ', 'vib.11': 'ВЫСОКАЯ ИНТЕНСИВНОСТЬ', 'vib.22': 'МАСТЕР-ИСПОЛНЕНИЕ', 'vib.33': 'МАСТЕР-РУКОВОДСТВО',

        'conn.title': 'Связи Души', 'conn.mark_all_read': 'Отметить все как прочитанные', 'conn.soul_connections': 'Связи Души'
    };

    // ═══ PORTUGUESE ═══
    T.pt = {
        'common.loading': 'Carregando...', 'common.error': 'Erro', 'common.success': 'Sucesso', 'common.cancel': 'Cancelar', 'common.save': 'Salvar', 'common.send': 'Enviar', 'common.close': 'Fechar', 'common.back': 'Voltar', 'common.next': 'Próximo', 'common.yes': 'Sim', 'common.no': 'Não', 'common.ok': 'OK', 'common.search': 'Buscar', 'common.open': 'ABRIR',

        'signup.title': 'Cadastrar', 'signup.login_title': 'Entrar', 'signup.headline': 'Comece sua jornada rumo às estrelas', 'signup.subtitle': 'Desbloqueie seu mapa cósmico e descubra os segredos ocultos em seus números.', 'signup.fullname': 'Nome completo', 'signup.fullname_placeholder': 'Digite seu nome de nascimento', 'signup.email': 'E-mail', 'signup.email_placeholder': 'sua.alma@cosmos.com', 'signup.password': 'Criar senha', 'signup.password_login': 'Senha', 'signup.btn_signup': 'Criar conta da alma', 'signup.btn_login': 'Entrar no Numantic', 'signup.toggle_login': 'Já tem uma conta?', 'signup.toggle_signup': 'Não tem conta?', 'signup.link_login': 'Entrar', 'signup.link_signup': 'Cadastrar', 'signup.alert_email_pass': 'Por favor, insira seu e-mail e senha.', 'signup.alert_name': 'Por favor, insira seu nome.', 'signup.select_language': 'Selecionar idioma',

        'home.celestial_guidance': 'Orientação Celestial', 'home.greeting': 'O Universo está alinhado com você,', 'home.personal_vibration': 'Vibração Pessoal', 'home.deep_insight': 'Análise Profunda', 'home.cosmic_navigator': 'Navegador Cósmico Pessoal', 'home.explore_map': 'Explorar Mapa', 'home.soul_mate_analysis': 'Análise de Alma Gêmea', 'home.soul_mate_desc': 'As estrelas convergem em uma união divina de caminhos.', 'home.unveil_twin': 'Revelar Chama Gêmea', 'home.cosmic_match': 'Cosmic Match', 'home.cosmic_match_desc': 'Uma análise profunda da frequência de sua ressonância celestial.', 'home.measure_resonance': 'Medir Ressonância', 'home.decision_sphere': 'Esfera de Decisão', 'home.decision_sphere_desc': 'Clareza para seus caminhos futuros através da probabilidade divina.', 'home.cast_inquiry': 'Faça sua Consulta', 'home.lunar_insights': 'Insights Lunares', 'home.lunar_desc': 'A lua minguante convida à introspecção. Liberte o que não te serve mais.', 'home.explore_cycles': 'Explorar Ciclos', 'home.celestial_forecast': 'Previsão Celestial', 'home.celestial_desc': 'Alinhe-se com as mudanças planetárias para maximizar seu crescimento espiritual.', 'home.view_trajectory': 'Ver Trajetória', 'home.manifest_portal': 'Portal de Manifestação', 'home.manifest_desc': 'A Tela do Espaço — Suas intenções são as estrelas do seu universo.', 'home.enter_portal': 'Entrar no Portal', 'home.daily_quests': 'Missões Diárias', 'home.bonus_chest': '3/3 = Baú Bônus',

        'nav.home': 'Home', 'nav.nuconnect': 'NuConnect', 'nav.nufest': 'NuFest', 'nav.numatch': 'NuMatch',
        'bubble.compatibility': 'Compatibilidade', 'bubble.new_analysis': 'Nova Análise', 'bubble.daily_guide': 'Guia Diário', 'bubble.moon_phase': 'Fase Lunar', 'bubble.decision_wheel': 'Roda do Destino', 'bubble.decision_calendar': 'Calendário', 'bubble.nufest': 'NuFest', 'bubble.profile': 'Perfil',

        'settings.title': 'Configurações', 'settings.personal_info': 'Informações Pessoais', 'settings.fullname': 'Nome completo', 'settings.birthdate': 'Data de nascimento', 'settings.notifications': 'Preferências de Notificação', 'settings.daily_insight': 'Numerologia Diária', 'settings.lunar_alerts': 'Alertas Lunares', 'settings.system_notif': 'Notificações do Sistema', 'settings.appearance': 'Aparência', 'settings.dark_mode': 'Modo Escuro', 'settings.dark_active': 'Ativo', 'settings.dark_inactive': 'Desativado', 'settings.language': 'Idioma', 'settings.subscription': 'Assinatura e Faturamento', 'settings.security': 'Segurança e Legal', 'settings.change_password': 'Alterar senha', 'settings.privacy_policy': 'Política de Privacidade', 'settings.terms': 'Termos de Serviço', 'settings.logout': 'Sair', 'settings.delete_account': 'Excluir conta', 'settings.version_footer': 'Seus dados são criptografados com AES de 256 bits.', 'settings.upgrade': 'Obter Premium', 'settings.manage_sub': 'Gerenciar assinatura', 'settings.restore': 'Restaurar compras', 'settings.free_plan': 'Plano Gratuito', 'settings.free_detail': 'Recursos básicos · Uso limitado', 'settings.pw_title': 'Alterar senha', 'settings.pw_desc': 'Um link de redefinição será enviado ao seu e-mail.', 'settings.pw_sent': '✓ Link enviado!', 'settings.pw_sending': 'Enviando...',

        'birth.title': 'Dados de Nascimento', 'birth.headline': 'Insira seus dados de nascimento', 'birth.subtitle': 'Dados precisos revelam seu mapa espiritual.', 'birth.fullname': 'Nome completo', 'birth.fullname_placeholder': 'Seu nome completo', 'birth.birthdate': 'Data de nascimento', 'birth.day': 'Dia', 'birth.month': 'Mês', 'birth.year': 'Ano', 'birth.time': 'Hora de nascimento', 'birth.recommended': 'Recomendado', 'birth.country': 'País de nascimento', 'birth.select_country': 'Selecionar país', 'birth.gender': 'Gênero', 'birth.male': 'Masculino', 'birth.female': 'Feminino', 'birth.calculate': 'Calcular Mapa', 'birth.alert_required': 'Insira nome e data de nascimento.',

        'profile.title': 'Jornada da Alma', 'profile.life_path': 'Caminho de Vida', 'profile.expression': 'Expressão', 'profile.soul_urge': 'Desejo da Alma', 'profile.personality': 'Personalidade', 'profile.name_analysis': 'Análise do Nome', 'profile.deep_insight': 'Análise Profunda', 'profile.compat_readings': 'Leituras de Compatibilidade', 'profile.compat_empty': 'Nenhuma análise de compatibilidade ainda.', 'profile.compat_hint': 'Comece pelo menu + com "Alma Gêmea".', 'profile.connection_requests': 'Solicitações de Conexão', 'profile.no_requests': 'Sem solicitações pendentes', 'profile.cosmic_match': 'Cosmic Match', 'profile.discoverable': 'Ser Descobrível', 'profile.discoverable_desc': 'Outros usuários podem te ver no radar', 'profile.refresh': 'Atualizar minha Análise', 'profile.go_premium': 'Obter Premium', 'profile.sign_out': 'Sair',

        'notif.title': 'Notificações', 'notif.empty': 'Sem novas notificações', 'notif.mark_all': 'Marcar tudo como lido', 'notif.connection_request': 'enviou uma solicitação de conexão', 'notif.connection_accepted': 'aceitou sua solicitação', 'notif.new_message': 'enviou uma nova mensagem',

        'month.01': 'Janeiro', 'month.02': 'Fevereiro', 'month.03': 'Março', 'month.04': 'Abril', 'month.05': 'Maio', 'month.06': 'Junho', 'month.07': 'Julho', 'month.08': 'Agosto', 'month.09': 'Setembro', 'month.10': 'Outubro', 'month.11': 'Novembro', 'month.12': 'Dezembro',

        'vib.1': 'INICIAÇÃO', 'vib.2': 'AVALIAÇÃO', 'vib.3': 'EXPRESSÃO', 'vib.4': 'ESTRUTURA', 'vib.5': 'MUDANÇA', 'vib.6': 'ESTABILIDADE', 'vib.7': 'ANÁLISE', 'vib.8': 'CONTROLE', 'vib.9': 'CONCLUSÃO', 'vib.11': 'ALTA INTENSIDADE', 'vib.22': 'EXECUÇÃO MESTRA', 'vib.33': 'GUIA MESTRE',

        'conn.title': 'Conexões da Alma', 'conn.mark_all_read': 'Marcar tudo como lido', 'conn.soul_connections': 'Conexões da Alma'
    };

    // ─── LANGUAGE METADATA ─────────────────────────────────────────
    var LANGUAGES = [
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷', native: 'Türkçe' },
        { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
        { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
        { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺', native: 'Русский' },
        { code: 'pt', name: 'Português', flag: '🇧🇷', native: 'Português' }
    ];

    // ─── ENGINE ─────────────────────────────────────────────────────

    function getSavedLang() {
        try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch(e) { return DEFAULT_LANG; }
    }

    function saveLang(lang) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch(e) {}
    }

    // Translate a key
    function t(key, fallback) {
        var lang = getSavedLang();
        if (T[lang] && T[lang][key] !== undefined) return T[lang][key];
        if (T[DEFAULT_LANG] && T[DEFAULT_LANG][key] !== undefined) return T[DEFAULT_LANG][key];
        return fallback || key;
    }

    // Apply translations to all data-i18n elements in the DOM
    function applyToDOM(root) {
        var container = root || document;

        // data-i18n → textContent
        var els = container.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var key = els[i].getAttribute('data-i18n');
            var val = t(key);
            if (val && val !== key) {
                els[i].textContent = val;
            }
        }

        // data-i18n-placeholder → placeholder attribute
        var phs = container.querySelectorAll('[data-i18n-placeholder]');
        for (var j = 0; j < phs.length; j++) {
            var pKey = phs[j].getAttribute('data-i18n-placeholder');
            var pVal = t(pKey);
            if (pVal && pVal !== pKey) {
                phs[j].setAttribute('placeholder', pVal);
            }
        }

        // data-i18n-html → innerHTML (for formatted content)
        var htmlEls = container.querySelectorAll('[data-i18n-html]');
        for (var k = 0; k < htmlEls.length; k++) {
            var hKey = htmlEls[k].getAttribute('data-i18n-html');
            var hVal = t(hKey);
            if (hVal && hVal !== hKey) {
                htmlEls[k].innerHTML = hVal;
            }
        }
    }

    // Set language and re-apply
    function setLang(lang) {
        if (!T[lang]) lang = DEFAULT_LANG;
        saveLang(lang);

        // Apply to DOM
        applyToDOM();

        // Set html lang attribute
        document.documentElement.setAttribute('lang', lang);

        // RTL for Arabic
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
        } else {
            document.documentElement.removeAttribute('dir');
        }

        // Dispatch event
        try {
            window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
        } catch(e) {}
    }

    // Initialize on DOM ready
    function init() {
        var lang = getSavedLang();
        document.documentElement.setAttribute('lang', lang);
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
        }
        applyToDOM();
    }

    // Apply on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ─── PUBLIC API ─────────────────────────────────────────────────
    window.i18n = {
        // Get translation for key
        t: t,

        // Get current language code
        current: getSavedLang,

        // Set language
        set: setLang,

        // Get all supported languages
        languages: function() { return LANGUAGES.slice(); },

        // Re-apply translations to DOM (call after dynamic content load)
        apply: applyToDOM,

        // Add custom translations (for extending)
        extend: function(lang, translations) {
            if (!T[lang]) T[lang] = {};
            for (var key in translations) {
                if (translations.hasOwnProperty(key)) {
                    T[lang][key] = translations[key];
                }
            }
        },

        // Get locale string for dates
        getLocale: function() {
            var map = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', ar: 'ar-SA', ru: 'ru-RU', pt: 'pt-BR' };
            return map[getSavedLang()] || 'tr-TR';
        }
    };

})();
