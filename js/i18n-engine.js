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
        'conn.soul_connections': 'Ruh Bağlantıları',

        // Cosmic Match
        'match.optin_title': 'Kozmik Eşleşme',
        'match.optin_subtitle': 'Numerolojik profilini diğer kullanıcılarla paylaş ve evrenin senin için seçtiği ruh eşlerini keşfet.',
        'match.optin_shared_title': 'Ne paylaşılır?',
        'match.optin_shared_desc': 'Sadece ismin, yaşam yolu ve numerolojik sayıların',
        'match.optin_privacy_title': 'Gizlilik',
        'match.optin_privacy_desc': 'Doğum tarihin ve kişisel verilerin paylaşılmaz',
        'match.optin_toggle_title': 'İstediğin zaman kapat',
        'match.optin_toggle_desc': 'Profil ayarlarından keşfedilebilirliğini kapat',
        'match.select_city_label': 'Şehrini Seç',
        'match.select_province': '\u2014 İl seçin \u2014',
        'match.join_discovery_btn': 'Keşfe Katıl',
        'match.you_label': 'Sen',
        'match.soul_harmony': 'Ruhsal Uyum',
        'match.cosmic_bond': 'Kozmik Bağ',
        'match.reveal_profile': 'Profili Aç',
        'match.no_credits_msg': 'Bugünkü reveal hakkın doldu',
        'match.credits_tomorrow': 'Yarın 5 yeni hak gelecek',
        'match.waiting_match': 'Eşleşme Bekleniyor',
        'match.empty_bond_desc': 'Daha fazla kullanıcı katıldıkça eşleşmeler başlayacak. Kozmik bağın yakında ortaya çıkacak!',
        'match.daily_matches_title': 'Günlük Eşleşmeler',
        'match.cosmic_map_title': 'Kozmik Harita',
        'match.city_btn': 'Şehir',
        'match.save_btn': 'Kaydet',
        'match.map_empty': 'Haritada henüz ruh yok...',
        'match.cosmic_analysis_title': 'Kozmik Analiz',
        'match.harmony_analysis': 'Uyum Analizi',
        'match.past_matches_title': 'Geçmiş Eşleşmeler',
        'match.history_empty': 'Eşleşme geçmişin burada görünecek',
        'match.add_connection': 'Bağlantı Ekle',

        // Connections page
        'connections.notifications': 'Bildirimler',
        'connections.add': 'Ekle',
        'connections.match_connections': 'Eşleşme Bağlantıları',
        'connections.recent_analyses': 'Son Analizler',
        'connections.no_analyses': 'Henüz analiz yapılmadı.',
        'connections.start_new_analysis': '+ Yeni Analiz Başlat',
        'connections.new_analysis_btn': 'Yeni Analiz Başlat',

        // Manifest Community
        'manifest_community.my_manifests_btn': 'Manifestlerim',
        'manifest_community.sort_newest': 'En Yeni',
        'manifest_community.sort_top_rated': 'En Çok Beğenilen',
        'manifest_community.sort_weekly': 'Haftalık',
        'manifest_community.cat_all': 'Tümü',
        'manifest_community.cat_money': 'Para',
        'manifest_community.cat_love': 'Aşk',
        'manifest_community.cat_health': 'Sağlık',
        'manifest_community.cat_career': 'Kariyer',
        'manifest_community.cat_soul': 'Ruh',
        'manifest_community.info_title': 'Manifest Portal',
        'manifest_community.info_desc': 'Topluluk manifestlerini keşfet, ilham al ve kendi niyetlerini evrene gönder.',
        'manifest_community.info_ok_btn': 'Anladım',
        'manifest_community.my_manifests_title': 'Manifestlerim',

        // Manifest Portal
        'manifest_portal.header_title': 'Manifest Portal',
        'manifest_portal.hero_title': 'Uzayın Tuvali',
        'manifest_portal.hero_subtitle': 'Niyetlerin kişisel evrenini aydınlatan yıldızlardır.',
        'manifest_portal.go_premium': 'Premium\'a Geç \u2192',
        'manifest_portal.no_manifest_title': 'Henüz manifest yok',
        'manifest_portal.no_manifest_desc': 'Evren niyetlerini bekliyor. İsteklerini kelimelere dökerek yolculuğuna başla.',
        'manifest_portal.write_manifest_btn': 'Manifest Yaz',
        'manifest_portal.premium_title': 'Premium Avantajı',
        'manifest_portal.premium_desc': 'Premium üyelikle sınırsız manifest oluşturabilir ve kozmik enerji akışını güçlendirebilirsin.',
        'manifest_portal.view_benefits_btn': 'Tüm Avantajları Gör',

        // Breakdown 1
        'breakdown1.header_title': 'İsim Analizi',
        'breakdown1.expression_label': 'İfade',
        'breakdown1.tap_to_calculate': 'Hesaplayı görmek için dokun',
        'breakdown1.soul_urge_title': 'Ruh Güdüsü',
        'breakdown1.soul_urge_badge': 'İç',
        'breakdown1.soul_urge_desc': 'Ruhsal anlayış arayan derin bir hakikat arayıcısı.',
        'breakdown1.personality_title': 'Kişilik',
        'breakdown1.personality_badge': 'Dış',
        'breakdown1.personality_desc': 'Çekingen, analitik ve son derece yetkin olarak algılanır.',
        'breakdown1.life_path_title': 'Kader Yolu',
        'breakdown1.life_path_badge': 'Kader',
        'breakdown1.life_path_desc': 'Nihai amacınızı ve büyümenizi yönlendiren kaderinizin planı.',
        'breakdown1.karmic_bond_title': 'Karmik Bağ',
        'breakdown1.karmic_bond_badge': 'Borç',
        'breakdown1.karmic_bond_desc': 'Geçmiş yaşamdan gelen karmik borç ve dersin analizi.',
        'breakdown1.ask_master_btn': 'Numeroloji Ustasına Sor',
        'breakdown1.key_energy_label': 'Anahtar Enerji',
        'breakdown1.key_energy_value': 'Uyum',
        'breakdown1.focus_label': 'Odak',
        'breakdown1.focus_value': 'Zihin',
        'breakdown1.context_analysis_title': 'Bağlamsal Analiz',
        'breakdown1.context_analysis_desc': 'Sayıların + zaman bağlamının birleşik yorumu',
        'breakdown1.intensity_label': 'Yoğunluk',
        'breakdown1.context_loading': 'Bağlamsal analiz hazırlanıyor...',
        'breakdown1.view_detailed_reading': 'Detaylı Okumayı Gör',
        'breakdown1.master_modal_title': 'NUMEROLOJİ USTASI',
        'breakdown1.master_modal_subtitle': 'Karmik sorularınızı yanıtlıyor',
        'breakdown1.master_input_placeholder': 'Karmik borcunuz hakkında sorun...',

        // Breakdown 2
        'breakdown2.header_label': 'Tam Analiz',
        'breakdown2.karmic_bond_title': 'Karmik Bağ',
        'breakdown2.karmic_bond_loading': 'Karmik bağ okunuyor...',
        'breakdown2.communication_title': 'İletişim Uyumu',
        'breakdown2.comm_logic': 'Mantık',
        'breakdown2.comm_intuition': 'Sezgi',
        'breakdown2.comm_verbal': 'Sözel',
        'breakdown2.comm_empathy': 'Empati',
        'breakdown2.communication_loading': 'İletişim uyumu analiz ediliyor...',
        'breakdown2.emotional_synergy_title': 'Duygusal Sinerji',
        'breakdown2.soul_urge_match_label': 'Ruh Güdüsü Eşleşmesi',
        'breakdown2.emotional_loading': 'Duygusal uyum hesaplanıyor...',
        'breakdown2.shared_destiny_title': 'Ortak Kader',
        'breakdown2.shared_destiny_loading': 'Ortak kader okunuyor...',
        'breakdown2.download_pdf_btn': 'PDF Olarak İndir',

        // Breakdown 3
        'breakdown3.header_title': 'İlişki Analizi',
        'breakdown3.cosmic_resonance': 'Kozmik Rezonans',
        'breakdown3.karmic_title': 'Karmik İlişki Bağı',
        'breakdown3.karmic_badge': 'Karma',
        'breakdown3.karmic_analyze': 'ANALİZ ET',
        'breakdown3.karmic_desc': 'İki ruh arasındaki karmik bağın ve geçmiş yaşam izlerinin analizi.',
        'breakdown3.ask_guide_btn': 'İlişki Rehberine Sor',
        'breakdown3.soul_urge_title': 'Ruh Dürtüsü Uyumu',
        'breakdown3.soul_urge_badge': 'Kalp',
        'breakdown3.soul_urge_desc': 'İçsel arzularınızın ve duygusal ihtiyaçlarınızın uyumu.',
        'breakdown3.personality_title': 'Kişilik Ahengi',
        'breakdown3.personality_badge': 'Dış',
        'breakdown3.personality_desc': 'Sosyal dinamikleriniz ve dış dünyaya yansımanız.',
        'breakdown3.life_path_title': 'Kader Yolu Birliği',
        'breakdown3.life_path_badge': 'Kader',
        'breakdown3.life_path_desc': 'Kader yollarınızın birleşim noktası ve ortak yolculuğunuz.',
        'breakdown3.expression_title': 'İfade Uyumu',
        'breakdown3.expression_badge': 'İfade',
        'breakdown3.expression_desc': 'İsim enerjilerinizin uyumu ve birbirini tamamlama biçimi.',
        'breakdown3.communication_title': 'İletişim Uyumu',
        'breakdown3.communication_badge': 'İletişim',
        'breakdown3.communication_desc': 'İletişim tarzlarınız ve birbirinizi anlama biçiminiz.',
        'breakdown3.bond_quality_label': 'Bağ Niteliği',
        'breakdown3.growth_area_label': 'Gelişim Alanı',
        'breakdown3.full_analysis_btn': 'Tam Analizi Gör',
        'breakdown3.guide_modal_title': 'İLİŞKİ REHBERİ',
        'breakdown3.guide_modal_subtitle': 'İlişki sorularınızı yanıtlıyor',
        'breakdown3.guide_input_placeholder': 'İlişkiniz hakkında sorun...',
        'breakdown3.share_title': 'Ruh Eşi Kartını Paylaş',
        'breakdown3.share_cta': 'Bu kartı sevdiklerinle paylaş',
        'breakdown3.save_to_gallery': 'Galeriye Kaydet',
        'breakdown3.copy_link': 'Kopyala',
        'breakdown3.other': 'Diğer',

        // Compatibility Form
        'compat_form.header_title': 'İlişki Uyumluluğu',
        'compat_form.headline': 'Kozmik hizanı keşfet',
        'compat_form.subheadline': 'İki ruh arasındaki ruhsal bağı ortaya çıkarmak için aşağıdaki detayları girin.',
        'compat_form.you_label': 'Sen',
        'compat_form.main_account': 'Ana Hesap',
        'compat_form.your_name_label': 'Adınız',
        'compat_form.profile_loading_placeholder': 'Profil bilgisi yükleniyor...',
        'compat_form.your_birthdate_label': 'Doğum Tarihiniz',
        'compat_form.partner_label': 'Partner',
        'compat_form.partner_name_label': 'Partnerin Adı',
        'compat_form.partner_name_placeholder': 'Tam adını girin',
        'compat_form.partner_birthdate_label': 'Partnerin Doğum Tarihi',
        'compat_form.footer_note': 'Hesaplamalar numerolojik prensipler ve astrolojik hizalanmalara dayanır.',
        'compat_form.check_btn': 'Uyumluluğu Kontrol Et',

        // Compatibility Analysis
        'compat_analysis.header_title': 'Uyum Analizi',
        'compat_analysis.harmony_label': 'Uyum',
        'compat_analysis.you_name': 'Sen',
        'compat_analysis.life_path_label': 'Kader Yolu',
        'compat_analysis.personality_label': 'Kişilik',
        'compat_analysis.soul_urge_label': 'Ruh Dürtüsü',
        'compat_analysis.expression_label': 'İfade',
        'compat_analysis.cosmic_bond_title': 'Kozmik Bağ',
        'compat_analysis.cosmic_bond_loading': 'Kozmik bağ hesaplanıyor...',
        'compat_analysis.unlock_love_guide': 'Tam Aşk Rehberini Aç',
        'compat_analysis.share_title': 'Ruh Eşi Kartını Paylaş',
        'compat_analysis.share_cta': 'Bu kartı sevdiklerinle paylaş',
        'compat_analysis.save_to_gallery': 'Galeriye Kaydet',
        'compat_analysis.copy_link': 'Kopyala',
        'compat_analysis.other': 'Diğer',

        // Daily Guide
        'daily_guide.header_title': 'Günlük Rehber',
        'daily_guide.title': 'Günlük Analiz',
        'daily_guide.subtitle': 'Bugün için sayısal rehberlik',
        'daily_guide.share_btn': 'Paylaş',
        'daily_guide.share_title': 'Analizi Paylaş',
        'daily_guide.share_badge': 'Günlük Analiz',
        'daily_guide.share_desc': 'Günlük analizini paylaş',
        'daily_guide.share_instagram': 'Instagram Stories',
        'daily_guide.share_whatsapp': 'WhatsApp Status',
        'daily_guide.share_save': 'Galeriye Kaydet',
        'daily_guide.share_copy': 'Link Kopyala',
        'daily_guide.share_other': 'Diğer',

        // Deep Dive
        'deep_dive.header_title': 'Günlük Derinlik',
        'deep_dive.day_title': 'Sezginin Günü',
        'deep_dive.vibration_badge': 'Ruhsal Titreşim',
        'deep_dive.focus_title': 'Odaklanılacaklar',
        'deep_dive.avoid_title': 'Kaçınılacaklar',
        'deep_dive.planetary_label': 'Gezegen Hizalanması',
        'deep_dive.mantra_label': 'Günlük Mantra',
        'deep_dive.reminder_btn': 'Günlük Hatırlatıcı Kur',

        // Calendar
        'calendar.menu_title': 'Menü',
        'calendar.menu_calendar': 'Takvim',
        'calendar.menu_planner': 'Planlayıcı',
        'calendar.menu_ritual': 'Ritüel',
        'calendar.menu_daily_guide': 'Günlük Rehber',
        'calendar.menu_profile': 'Profil',
        'calendar.menu_settings': 'Ayarlar',
        'calendar.header_title': 'Karar Takvimi',
        'calendar.day_sun': 'Pz',
        'calendar.day_mon': 'Pt',
        'calendar.day_tue': 'Sa',
        'calendar.day_wed': 'Ça',
        'calendar.day_thu': 'Pe',
        'calendar.day_fri': 'Cu',
        'calendar.day_sat': 'Ct',
        'calendar.daily_analysis': 'Günlük Analiz',
        'calendar.active_cycle': 'Aktif Döngü',
        'calendar.today_vibration': 'Bugünün Titreşimi',
        'calendar.supported_label': 'Desteklenen',
        'calendar.challenging_label': 'Zorlayıcı',
        'calendar.timing_cta': 'Bu Günün Karar Zamanlamasını Gör',

        // Lunar
        'lunar.header_title': 'Ay Enerjisi',
        'lunar.vibration_phase': 'Titreşim Fazı',
        'lunar.detailed_reading': 'Detaylı Okuma',
        'lunar.guidance_title': 'Ay Rehberliği',
        'lunar.crystal_wisdom': 'Kristal Bilgeliği',
        'lunar.end_reading': 'Günlük Okumanın Sonu',

        // Messaging
        'messaging.not_connected_text': 'Mesaj göndermek için bağlantı kurmalısınız.',
        'messaging.back_to_connections': 'Bağlantılara Dön',
        'messaging.no_messages': 'Henüz mesaj yok',
        'messaging.input_placeholder': 'Mesaj yaz...',

        // Friendship
        'friendship.title': 'Arkadaşlık Dinamiği',
        'friendship.bond_analysis': 'Arkadaşlık Bağı Analizi',
        'friendship.harmony': 'Uyum',
        'friendship.life_path': 'Yaşam Yolu',
        'friendship.soul_urge': 'Ruh Güdüsü',
        'friendship.personality': 'Kişilik',
        'friendship.expression': 'İfade',
        'friendship.energy_title': 'Arkadaşlık Enerjisi',
        'friendship.energy_subtitle': 'Bağınızın özü ve temel dinamiği',
        'friendship.communication_title': 'İletişim Dinamiği',
        'friendship.communication_subtitle': 'Birbirinizi nasıl anlıyorsunuz',
        'friendship.strengths_title': 'Ortak Güç Alanları',
        'friendship.strengths_subtitle': 'Birlikte nerede parlıyorsunuz',
        'friendship.challenges_title': 'Dikkat Noktaları',
        'friendship.challenges_subtitle': 'Sürtüşme ve denge gereken alanlar',
        'friendship.roadmap_title': 'Yol Haritası',
        'friendship.roadmap_subtitle': 'Bu arkadaşlığı güçlendirmek için rehber',
        'friendship.numerology_comparison': 'Numerolojik Karşılaştırma',
        'friendship.tbl_life_path': 'Yaşam Yolu',
        'friendship.tbl_expression': 'İfade',
        'friendship.tbl_soul_urge': 'Ruh Güdüsü',
        'friendship.tbl_personality': 'Kişilik',
        'friendship.share_title': 'Arkadaşlık Kartını Paylaş',
        'friendship.share_subtitle': 'Arkadaşlık analizini paylaş',
        'friendship.save_to_gallery': 'Galeriye Kaydet',
        'friendship.copy': 'Kopyala',
        'friendship.other': 'Diğer',

        // Quiz
        'quiz.title': 'Numeroloji Quiz',
        'quiz.correct': 'Doğru',
        'quiz.win_streak': 'Galibiyet Serisi',
        'quiz.quick_quiz': 'Hızlı Quiz',
        'quiz.quick_quiz_desc': '10 soru \u00b7 Bilgini test et \u00b7 XP kazan',
        'quiz.duel': 'Düello',
        'quiz.duel_desc': '5 soru \u00b7 Rakibe karşı \u00b7 2x XP ödülü',
        'quiz.cosmic_league': 'Kozmik Lig',
        'quiz.cosmic_league_desc': 'Haftalık sıralama \u00b7 Lig sistemi \u00b7 Ödüller',
        'quiz.your_badges': 'Rozetlerin',
        'quiz.question_label': 'Soru',
        'quiz.you': 'Sen',
        'quiz.opponent': 'Rakip',
        'quiz.next': 'Sonraki \u2192',
        'quiz.menu': '\u2190 Menü',
        'quiz.play_again': 'Tekrar Oyna',

        // Wheel
        'wheel.title': 'Numantic Çarkı',
        'wheel.main_title': 'Numantic Çarkı',
        'wheel.subtitle': 'Kozmik hizanı keşfet',
        'wheel.spin': 'ÇEVİR',
        'wheel.not_spun_yet': 'Henüz çevirmedin...',
        'wheel.daily_rewards': 'Günün Kozmik Ödülleri',
        'wheel.refreshes_daily': 'Günde 1 kez yenilenir',
        'wheel.reward_1_day': '1 Gün Premium',
        'wheel.chance_15': '%15 şans',
        'wheel.reward_5_days': '5 Gün Premium',
        'wheel.chance_5': '%5 şans',
        'wheel.reward_10_days': '10 Gün Premium',
        'wheel.chance_2': '%2 şans',
        'wheel.stars_aligning': 'Yıldızlar hizalanıyor',
        'wheel.premium_reward_won': 'Premium Ödülü Kazandın!',
        'wheel.claim_reward': 'ÖDÜLÜ AL',

        // Leaderboard
        'leaderboard.title': 'Kozmik Lig',
        'leaderboard.weekly_rewards': 'Haftalık Ödüller',
        'leaderboard.prize_1_premium': '2 Gün Premium',
        'leaderboard.prize_1_bonus': '+ Şampiyon Tacı',
        'leaderboard.prize_2_premium': '1 Gün Premium',
        'leaderboard.prize_2_bonus': '+ Gümüş Taç',
        'leaderboard.prize_3_premium': 'Nadir Kart',
        'leaderboard.prize_3_bonus': '+ Bronz Taç',
        'leaderboard.league_closing': 'Lig Kapanış:',
        'leaderboard.weekly_ranking': 'Haftalık Sıralama',
        'leaderboard.top3_promotion': 'Üst 3 = Terfi',
        'leaderboard.bottom3_relegation': 'Alt 3 = Düşme',
        'leaderboard.promotion_info': 'Hafta sonunda üst 3 bir üst lige çıkar, alt 3 bir alt lige düşer.',
        'leaderboard.quiz_cta': 'Quiz Çöz & Sıralama Yüksel',

        // Premium
        'premium.header_title': 'Ödeme',
        'premium.plan_name': 'Numantic Premium',
        'premium.trial_info': 'İlk 3 gün ücretsiz \u00b7 İstediğin zaman iptal',
        'premium.secure_payment': 'Güvenli Ödeme',
        'premium.payment_desc': 'Aşağıdaki butona basınca Paddle güvenli ödeme penceresi açılacak',
        'premium.security_note': 'Paddle güvenli ödeme \u00b7 KDV otomatik dahil',
        'premium.complete_payment': 'Ödemeyi Tamamla',
        'premium.terms_text': 'Ödemeyi tamamlayarak Kullanım Koşulları\'nı kabul edersiniz.',
        'premium.skip_free': 'Şimdilik ücretsiz devam et \u2192',
        'premium.success_title': 'Premium Aktif!',
        'premium.success_desc': 'Tebrikler! Artık tüm özelliklere sınırsız erişimin var.',
        'premium.trial_started': '3 günlük ücretsiz deneme başladı',
        'premium.explore_btn': 'Keşfe Başla',

        // Store
        'store.header_title': 'Numantic Premium',
        'store.premium_active': 'Premium Aktif',
        'store.feature_ai': 'Sınırsız AI Analiz',
        'store.feature_friends': 'Sınırsız Arkadaş & Uyumluluk',
        'store.feature_cosmic': 'Cosmic Match Reveal',
        'store.feature_deep': 'Tam Deep Insight (3 sayfa)',
        'store.feature_guide': 'AI Günlük Rehber & Kozmik Takvim',
        'store.hero_title': 'Numerolojinin Tam Gücünü Aç',
        'store.hero_desc': 'Sınırsız AI analiz, Cosmic Match reveal, tam uyumluluk raporları ve çok daha fazlası.',
        'store.monthly': 'Aylık',
        'store.save_badge': '%37 TASARRUF',
        'store.yearly': 'Yıllık',
        'store.go_premium': 'Premium\'a Geç',
        'store.cancel_info': 'İstediğin zaman iptal et \u00b7 3 gün ücretsiz deneme',
        'store.comparison_title': 'Free vs Premium',
        'store.feature_col': 'Özellik',
        'store.perks_title': 'Premium Ayrıcalıkları',
        'store.try_free': '3 Gün Ücretsiz Dene',

        // Person Profile
        'kisi.personality_analysis': 'Kişilik Analizi',
        'kisi.deep_insight_desc': 'Pisagor \u00b7 İfade \u00b7 Ruh Güdüsü \u00b7 Kader Yolu',
        'kisi.friendship_dynamics': 'Arkadaşlık Dinamiği',
        'kisi.friendship_desc': 'Seninle arasındaki uyum \u00b7 Yol haritası \u00b7 Analiz',
        'kisi.compatibility_analysis': 'Uyumluluk Analizi',
        'kisi.compatibility_desc': 'Romantik uyum \u00b7 Karmik bağ \u00b7 Ruh eşi skoru',

        // Meaning
        'meaning.header_title': 'Numeroloji Anlamları',
        'meaning.close': 'Kapat',
        'meaning.core_vibrations': 'Temel Titreşimler 1-9',
        'meaning.core_subtitle': 'Her rakamın temel enerjisini keşfedin',
        'meaning.num1_title': 'Öncü',
        'meaning.num1_desc': 'Liderlik, bağımsızlık, başlangıçlar, hırs, azim',
        'meaning.num2_title': 'Barışçı',
        'meaning.num2_desc': 'Ortaklık, ikilik, diplomasi, sezgi, denge',
        'meaning.num3_title': 'Yaratıcı',
        'meaning.num3_desc': 'İfade, yaratıcılık, iletişim, iyimserlik',
        'meaning.num4_title': 'İnşacı',
        'meaning.num4_desc': 'Kararlılık, yapı, çalışkanlık, pratiklik',
        'meaning.num5_title': 'Maceracı',
        'meaning.num5_desc': 'Özgürlük, değişim, macera, çok yönlülük',
        'meaning.num6_title': 'Koruyucu',
        'meaning.num6_desc': 'Sorumluluk, koruma, bakım, topluluk, denge',
        'meaning.num7_title': 'Arayıcı',
        'meaning.num7_desc': 'Bilgi, tefekkür, ruhaniyet, analiz, anlayış',
        'meaning.num8_title': 'Yönetici',
        'meaning.num8_desc': 'Güç, bolluk, finans, yönetim, maddi özgürlük',
        'meaning.num9_title': 'İnsancıl',
        'meaning.num9_desc': 'Özgecilik, tamamlanma, şefkat, idealizm',
        'meaning.get_full_chart': 'Tam Haritanı Al',

        // Vibration
        'vibration.header_title': 'Analizi Paylaş',
        'vibration.analysis_card': 'Analiz Kartı',
        'vibration.life_path_number': 'Kader Yolu Sayısı',
        'vibration.archetype': 'Derin Ruhsal Arayıcı',
        'vibration.archetype_traits': 'Bilgelik \u00b7 İçe Bakış \u00b7 Hakikat',
        'vibration.card_info': 'Bu kart hikayeler ve durum güncellemeleri için ideal.',
        'vibration.instagram': 'Instagram Stories',
        'vibration.whatsapp': 'WhatsApp Status',
        'vibration.save_gallery': 'Galeriye Kaydet',
        'vibration.copy_link': 'Link Kopyala',
        'vibration.other': 'Diğer',

        // Archive
        'archive.header_title': 'Kutsal Arşiv',
        'archive.eternal_record': 'Ebedi Arşiv Kaydı',
        'archive.destiny_analysis': 'Tam Kader Analizi',
        'archive.life_path_label': 'Kader Yolu',
        'archive.soul_urge_label': 'Ruh Güdüsü',
        'archive.destiny_label': 'Kader',
        'archive.inscribed_date': 'Kayıt tarihi',
        'archive.closing_question': 'Bu bilgelik yolculuğunu nasıl şekillendirdi?',

        // Onboarding
        'onboarding.slide1_title_1': 'Kozmik',
        'onboarding.slide1_title_2': 'Amacını Keşfet',
        'onboarding.slide1_desc': 'Doğum tarihin ve ismindeki gizli titreşimleri keşfederek ruhsal yolculuğuna ışık tut.',
        'onboarding.slide2_title_1': 'Ruh Eşini Bul',
        'onboarding.slide2_title_2': 'Yeni Ruhsal Bağlarını Keşfet',
        'onboarding.slide2_desc': 'Numerolojik uyumluluk analizi ile aşk, arkadaşlık ve iş ilişkilerindeki kozmik bağlarını keşfet.',
        'onboarding.slide3_title_1': 'Günlük',
        'onboarding.slide3_title_2': 'Kozmik Rehberin',
        'onboarding.slide3_desc': 'Her gün kişisel enerji takvimine göre en doğru kararları al.',
        'onboarding.slide4_title_1': 'Niyetini Evrene',
        'onboarding.slide4_title_2': 'Gönder',
        'onboarding.slide4_desc': 'Manifest portalında niyetlerini belirle, kozmik enerjiye bırak ve toplulukla birlikte gerçekleştir.',
        'onboarding.btn_continue': 'Devam Et',
        'onboarding.btn_start': 'Başla',
        'onboarding.btn_login': 'Giriş yap',
        'onboarding.theme_light': 'Açık Mod',
        'onboarding.theme_dark': 'Koyu Mod',

        // Splash
        'splash.brand_name': 'NUMANTIC',
        'splash.brand_tagline': 'Heavenly Insights',
        'splash.msg_reading': 'Yıldızlar okunuyor',
        'splash.msg_aligning': 'Kozmos hizalanıyor',
        'splash.msg_channeling': 'Enerjin yönlendiriliyor',
        'splash.msg_awakening': 'Kaderin uyanıyor',

        // Branded Splash
        'branded_splash.brand_name': 'Numantic',
        'branded_splash.brand_tagline': 'Göksel Rehberlik',
        'branded_splash.loading_text': 'Kozmosla senkronize ediliyor...',

        // Loading screens
        'soulmate_loading.title': 'Ruhlarınız senkronize ediliyor...',
        'soulmate_loading.subtitle': 'Karmik yollar dokunuyor...',
        'soulmate_loading.progress_label': 'Aşk Frekansları Sentezleniyor',
        'soulmate_loading.engine_label': 'Ruh Eşi Motoru v2.0',
        'calc_loading.title': 'Titreşimleriniz hesaplanıyor...',
        'calc_loading.subtitle': 'Yıldızlara danışılıyor ve kozmik yollar hizalanıyor',
        'calc_loading.msg_syncing': 'Evrenle senkronize ediliyor',
        'calc_loading.msg_calculating': 'Titreşimleriniz hesaplanıyor',
        'calc_loading.msg_aligning': 'Kozmik yollar hizalanıyor',
        'calc_loading.msg_reading': 'Kutsal sayılar okunuyor',
        'calc_loading.msg_almost': 'Neredeyse hazır...',
        'calc_loading.engine_label': 'Numeroloji Motoru v2.0',

        // Wheel Reward
        'wheel_reward.header_title': 'Kader Bahşetti',
        'wheel_reward.title': 'Kader Konuştu',
        'wheel_reward.subtitle': 'Kutsal Bir Hediye Ortaya Çıktı',
        'wheel_reward.reward_title': '3 Ücretsiz Kristal',
        'wheel_reward.reward_subtitle': 'Derin İsim Analizi Açıldı',
        'wheel_reward.reward_desc': 'Günlük burcunuzu açmak ve ruhsal yolunuzu keşfetmek için kullanın.',
        'wheel_reward.btn_claim': 'Ödülü Al',
        'wheel_reward.btn_vault': 'Ruhsal kasama ekle',
        'wheel_reward.nav_home': 'Ana Sayfa',
        'wheel_reward.nav_readings': 'Okumalar',
        'wheel_reward.nav_wheel': 'Çark',
        'wheel_reward.nav_store': 'Mağaza',
        'wheel_reward.nav_profile': 'Profil',

        // Manifest Portal (phases)
        'manifest.cat_love': 'Aşk',
        'manifest.cat_money': 'Para',
        'manifest.cat_health': 'Sağlık',
        'manifest.cat_career': 'Kariyer',
        'manifest.cat_spiritual': 'Ruh',
        'manifest.phase_full': 'Dolunay Fazı',
        'manifest.energy_release': 'Enerji: Bırakma & Tamamlama',
        'manifest.title_release': 'Bırak & Serbest Kal',
        'manifest.sub_release': 'Artık en yüksek yoluna hizmet etmeyeni gümüş ay ışığına teslim et.',
        'manifest.placeholder_release': 'Evrene bırakmaya hazır olduğun ne var?',
        'manifest.hint_release': 'Bırak. Teslim ol. Özgür ol.',
        'manifest.btn_release': 'Evrene Bırak',
        'manifest.sent_release': 'Evrene Bırakıldı',
        'manifest.sent_sub_release': 'Niyetin artık kozmik dokuya işleniyor',
        'manifest.phase_new': 'Yeni Ay Fazı',
        'manifest.energy_new': 'Enerji: Yeni Niyetler',
        'manifest.title_new': 'Yeni Niyetler',
        'manifest.sub_new': 'Kozmik arzularını yeni döngünün bereketli karanlığına ek.',
        'manifest.placeholder_new': 'Bugün hangi tohumları ekmeye hazırsın?',
        'manifest.hint_new': 'Tohumu ek. Kozmosa güven.',
        'manifest.btn_new': 'Tohumumu Ek',
        'manifest.sent_new': 'Kozmosa Tohum Ekildi',
        'manifest.sent_sub_new': 'Niyetin bereketli karanlıkta kök salıyor',
        'manifest.energy_waning': 'Enerji: Azalan & Bırakan',
        'manifest.energy_waxing': 'Enerji: Büyüyen & İnşa Eden',
        'manifest.title_cosmic': 'Kozmik Portal',
        'manifest.sub_cosmic': 'Arzularının frekansında titreş.',
        'manifest.placeholder_cosmic': 'Niyetini evrene yaz...',
        'manifest.hint_cosmic': 'Spesifik ol. Titreşimi hisset.',
        'manifest.btn_cosmic': 'Evrene Gönder',
        'manifest.sent_cosmic': 'Evrene Gönderildi',
        'manifest.sent_sub_cosmic': 'Niyetin artık kozmik enerji'
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
        'conn.soul_connections': 'Soul Connections',

        // Cosmic Match
        'match.optin_title': 'Cosmic Match', 'match.optin_subtitle': 'Share your numerological profile with other users and discover the soulmates the universe has chosen for you.', 'match.optin_shared_title': 'What is shared?', 'match.optin_shared_desc': 'Only your name, life path and numerological numbers', 'match.optin_privacy_title': 'Privacy', 'match.optin_privacy_desc': 'Your birth date and personal data are not shared', 'match.optin_toggle_title': 'Turn off anytime', 'match.optin_toggle_desc': 'Disable your discoverability from profile settings', 'match.select_city_label': 'Select Your City', 'match.select_province': '\u2014 Select province \u2014', 'match.join_discovery_btn': 'Join Discovery', 'match.you_label': 'You', 'match.soul_harmony': 'Soul Harmony', 'match.cosmic_bond': 'Cosmic Bond', 'match.reveal_profile': 'Reveal Profile', 'match.no_credits_msg': 'Your reveal credits for today are used up', 'match.credits_tomorrow': '5 new credits coming tomorrow', 'match.waiting_match': 'Waiting for Match', 'match.empty_bond_desc': 'Matches will begin as more users join. Your cosmic bond will emerge soon!', 'match.daily_matches_title': 'Daily Matches', 'match.cosmic_map_title': 'Cosmic Map', 'match.city_btn': 'City', 'match.save_btn': 'Save', 'match.map_empty': 'No souls on the map yet...', 'match.cosmic_analysis_title': 'Cosmic Analysis', 'match.harmony_analysis': 'Harmony Analysis', 'match.past_matches_title': 'Past Matches', 'match.history_empty': 'Your match history will appear here', 'match.add_connection': 'Add Connection',

        // Connections
        'connections.notifications': 'Notifications', 'connections.add': 'Add', 'connections.match_connections': 'Match Connections', 'connections.recent_analyses': 'Recent Analyses', 'connections.no_analyses': 'No analyses yet.', 'connections.start_new_analysis': '+ Start New Analysis', 'connections.new_analysis_btn': 'Start New Analysis',

        // Manifest Community
        'manifest_community.my_manifests_btn': 'My Manifests', 'manifest_community.sort_newest': 'Newest', 'manifest_community.sort_top_rated': 'Top Rated', 'manifest_community.sort_weekly': 'Weekly', 'manifest_community.cat_all': 'All', 'manifest_community.cat_money': 'Money', 'manifest_community.cat_love': 'Love', 'manifest_community.cat_health': 'Health', 'manifest_community.cat_career': 'Career', 'manifest_community.cat_soul': 'Soul', 'manifest_community.info_title': 'Manifest Portal', 'manifest_community.info_desc': 'Discover community manifests, get inspired and send your intentions to the universe.', 'manifest_community.info_ok_btn': 'Got it', 'manifest_community.my_manifests_title': 'My Manifests',

        // Manifest Portal
        'manifest_portal.header_title': 'Manifest Portal', 'manifest_portal.hero_title': 'Canvas of Space', 'manifest_portal.hero_subtitle': 'Your intentions are the stars that illuminate your personal universe.', 'manifest_portal.go_premium': 'Go Premium \u2192', 'manifest_portal.no_manifest_title': 'No manifests yet', 'manifest_portal.no_manifest_desc': 'The universe awaits your intentions. Begin your journey by putting your desires into words.', 'manifest_portal.write_manifest_btn': 'Write Manifest', 'manifest_portal.premium_title': 'Premium Advantage', 'manifest_portal.premium_desc': 'Create unlimited manifests and amplify your cosmic energy flow with premium membership.', 'manifest_portal.view_benefits_btn': 'View All Benefits',

        // Breakdown 1
        'breakdown1.header_title': 'Name Analysis', 'breakdown1.expression_label': 'Expression', 'breakdown1.tap_to_calculate': 'Tap to see the calculation', 'breakdown1.soul_urge_title': 'Soul Urge', 'breakdown1.soul_urge_badge': 'Inner', 'breakdown1.soul_urge_desc': 'A deep truth seeker yearning for spiritual understanding.', 'breakdown1.personality_title': 'Personality', 'breakdown1.personality_badge': 'Outer', 'breakdown1.personality_desc': 'Perceived as reserved, analytical and highly competent.', 'breakdown1.life_path_title': 'Life Path', 'breakdown1.life_path_badge': 'Destiny', 'breakdown1.life_path_desc': 'The blueprint of your destiny guiding your ultimate purpose and growth.', 'breakdown1.karmic_bond_title': 'Karmic Bond', 'breakdown1.karmic_bond_badge': 'Debt', 'breakdown1.karmic_bond_desc': 'Analysis of karmic debt and lessons from past lives.', 'breakdown1.ask_master_btn': 'Ask the Numerology Master', 'breakdown1.key_energy_label': 'Key Energy', 'breakdown1.key_energy_value': 'Harmony', 'breakdown1.focus_label': 'Focus', 'breakdown1.focus_value': 'Mind', 'breakdown1.context_analysis_title': 'Contextual Analysis', 'breakdown1.context_analysis_desc': 'Combined interpretation of your numbers + time context', 'breakdown1.intensity_label': 'Intensity', 'breakdown1.context_loading': 'Preparing contextual analysis...', 'breakdown1.view_detailed_reading': 'View Detailed Reading', 'breakdown1.master_modal_title': 'NUMEROLOGY MASTER', 'breakdown1.master_modal_subtitle': 'Answering your karmic questions', 'breakdown1.master_input_placeholder': 'Ask about your karmic debt...',

        // Breakdown 2
        'breakdown2.header_label': 'Full Analysis', 'breakdown2.karmic_bond_title': 'Karmic Bond', 'breakdown2.karmic_bond_loading': 'Reading karmic bond...', 'breakdown2.communication_title': 'Communication Harmony', 'breakdown2.comm_logic': 'Logic', 'breakdown2.comm_intuition': 'Intuition', 'breakdown2.comm_verbal': 'Verbal', 'breakdown2.comm_empathy': 'Empathy', 'breakdown2.communication_loading': 'Analyzing communication harmony...', 'breakdown2.emotional_synergy_title': 'Emotional Synergy', 'breakdown2.soul_urge_match_label': 'Soul Urge Match', 'breakdown2.emotional_loading': 'Calculating emotional harmony...', 'breakdown2.shared_destiny_title': 'Shared Destiny', 'breakdown2.shared_destiny_loading': 'Reading shared destiny...', 'breakdown2.download_pdf_btn': 'Download as PDF',

        // Breakdown 3
        'breakdown3.header_title': 'Relationship Analysis', 'breakdown3.cosmic_resonance': 'Cosmic Resonance', 'breakdown3.karmic_title': 'Karmic Relationship Bond', 'breakdown3.karmic_badge': 'Karma', 'breakdown3.karmic_analyze': 'ANALYZE', 'breakdown3.karmic_desc': 'Analysis of the karmic bond and past life traces between two souls.', 'breakdown3.ask_guide_btn': 'Ask Relationship Guide', 'breakdown3.soul_urge_title': 'Soul Urge Harmony', 'breakdown3.soul_urge_badge': 'Heart', 'breakdown3.soul_urge_desc': 'The harmony of your inner desires and emotional needs.', 'breakdown3.personality_title': 'Personality Harmony', 'breakdown3.personality_badge': 'Outer', 'breakdown3.personality_desc': 'Your social dynamics and how you reflect to the outer world.', 'breakdown3.life_path_title': 'Life Path Union', 'breakdown3.life_path_badge': 'Destiny', 'breakdown3.life_path_desc': 'The convergence point of your destiny paths and shared journey.', 'breakdown3.expression_title': 'Expression Harmony', 'breakdown3.expression_badge': 'Expression', 'breakdown3.expression_desc': 'The harmony of your name energies and how they complement each other.', 'breakdown3.communication_title': 'Communication Harmony', 'breakdown3.communication_badge': 'Communication', 'breakdown3.communication_desc': 'Your communication styles and how you understand each other.', 'breakdown3.bond_quality_label': 'Bond Quality', 'breakdown3.growth_area_label': 'Growth Area', 'breakdown3.full_analysis_btn': 'View Full Analysis', 'breakdown3.guide_modal_title': 'RELATIONSHIP GUIDE', 'breakdown3.guide_modal_subtitle': 'Answering your relationship questions', 'breakdown3.guide_input_placeholder': 'Ask about your relationship...', 'breakdown3.share_title': 'Share Soul Mate Card', 'breakdown3.share_cta': 'Share this card with your loved ones', 'breakdown3.save_to_gallery': 'Save to Gallery', 'breakdown3.copy_link': 'Copy', 'breakdown3.other': 'Other',

        // Compatibility Form
        'compat_form.header_title': 'Relationship Compatibility', 'compat_form.headline': 'Discover your cosmic alignment', 'compat_form.subheadline': 'Enter the details below to reveal the spiritual bond between two souls.', 'compat_form.you_label': 'You', 'compat_form.main_account': 'Main Account', 'compat_form.your_name_label': 'Your Name', 'compat_form.profile_loading_placeholder': 'Loading profile info...', 'compat_form.your_birthdate_label': 'Your Birthdate', 'compat_form.partner_label': 'Partner', 'compat_form.partner_name_label': 'Partner\'s Name', 'compat_form.partner_name_placeholder': 'Enter full name', 'compat_form.partner_birthdate_label': 'Partner\'s Birthdate', 'compat_form.footer_note': 'Calculations are based on numerological principles and astrological alignments.', 'compat_form.check_btn': 'Check Compatibility',

        // Compatibility Analysis
        'compat_analysis.header_title': 'Compatibility Analysis', 'compat_analysis.harmony_label': 'Harmony', 'compat_analysis.you_name': 'You', 'compat_analysis.life_path_label': 'Life Path', 'compat_analysis.personality_label': 'Personality', 'compat_analysis.soul_urge_label': 'Soul Urge', 'compat_analysis.expression_label': 'Expression', 'compat_analysis.cosmic_bond_title': 'Cosmic Bond', 'compat_analysis.cosmic_bond_loading': 'Calculating cosmic bond...', 'compat_analysis.unlock_love_guide': 'Unlock Full Love Guide', 'compat_analysis.share_title': 'Share Soul Mate Card', 'compat_analysis.share_cta': 'Share this card with your loved ones', 'compat_analysis.save_to_gallery': 'Save to Gallery', 'compat_analysis.copy_link': 'Copy', 'compat_analysis.other': 'Other',

        // Daily Guide
        'daily_guide.header_title': 'Daily Guide', 'daily_guide.title': 'Daily Analysis', 'daily_guide.subtitle': 'Numerical guidance for today', 'daily_guide.share_btn': 'Share', 'daily_guide.share_title': 'Share Analysis', 'daily_guide.share_badge': 'Daily Analysis', 'daily_guide.share_desc': 'Share your daily analysis', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'Save to Gallery', 'daily_guide.share_copy': 'Copy Link', 'daily_guide.share_other': 'Other',

        // Deep Dive
        'deep_dive.header_title': 'Daily Deep Dive', 'deep_dive.day_title': 'Day of Intuition', 'deep_dive.vibration_badge': 'Spiritual Vibration', 'deep_dive.focus_title': 'Focus On', 'deep_dive.avoid_title': 'Avoid', 'deep_dive.planetary_label': 'Planetary Alignment', 'deep_dive.mantra_label': 'Daily Mantra', 'deep_dive.reminder_btn': 'Set Daily Reminder',

        // Calendar
        'calendar.menu_title': 'Menu', 'calendar.menu_calendar': 'Calendar', 'calendar.menu_planner': 'Planner', 'calendar.menu_ritual': 'Ritual', 'calendar.menu_daily_guide': 'Daily Guide', 'calendar.menu_profile': 'Profile', 'calendar.menu_settings': 'Settings', 'calendar.header_title': 'Decision Calendar', 'calendar.day_sun': 'Su', 'calendar.day_mon': 'Mo', 'calendar.day_tue': 'Tu', 'calendar.day_wed': 'We', 'calendar.day_thu': 'Th', 'calendar.day_fri': 'Fr', 'calendar.day_sat': 'Sa', 'calendar.daily_analysis': 'Daily Analysis', 'calendar.active_cycle': 'Active Cycle', 'calendar.today_vibration': 'Today\'s Vibration', 'calendar.supported_label': 'Supported', 'calendar.challenging_label': 'Challenging', 'calendar.timing_cta': 'View Today\'s Decision Timing',

        // Lunar
        'lunar.header_title': 'Moon Energy', 'lunar.vibration_phase': 'Vibration Phase', 'lunar.detailed_reading': 'Detailed Reading', 'lunar.guidance_title': 'Lunar Guidance', 'lunar.crystal_wisdom': 'Crystal Wisdom', 'lunar.end_reading': 'End of Daily Reading',

        // Messaging
        'messaging.not_connected_text': 'You need to connect to send messages.', 'messaging.back_to_connections': 'Back to Connections', 'messaging.no_messages': 'No messages yet', 'messaging.input_placeholder': 'Type a message...',

        // Friendship
        'friendship.title': 'Friendship Dynamics', 'friendship.bond_analysis': 'Friendship Bond Analysis', 'friendship.harmony': 'Harmony', 'friendship.life_path': 'Life Path', 'friendship.soul_urge': 'Soul Urge', 'friendship.personality': 'Personality', 'friendship.expression': 'Expression', 'friendship.energy_title': 'Friendship Energy', 'friendship.energy_subtitle': 'The essence and fundamental dynamic of your bond', 'friendship.communication_title': 'Communication Dynamics', 'friendship.communication_subtitle': 'How you understand each other', 'friendship.strengths_title': 'Shared Strengths', 'friendship.strengths_subtitle': 'Where you shine together', 'friendship.challenges_title': 'Attention Points', 'friendship.challenges_subtitle': 'Areas of friction and balance needed', 'friendship.roadmap_title': 'Roadmap', 'friendship.roadmap_subtitle': 'A guide to strengthen this friendship', 'friendship.numerology_comparison': 'Numerological Comparison', 'friendship.tbl_life_path': 'Life Path', 'friendship.tbl_expression': 'Expression', 'friendship.tbl_soul_urge': 'Soul Urge', 'friendship.tbl_personality': 'Personality', 'friendship.share_title': 'Share Friendship Card', 'friendship.share_subtitle': 'Share friendship analysis', 'friendship.save_to_gallery': 'Save to Gallery', 'friendship.copy': 'Copy', 'friendship.other': 'Other',

        // Quiz
        'quiz.title': 'Numerology Quiz', 'quiz.correct': 'Correct', 'quiz.win_streak': 'Win Streak', 'quiz.quick_quiz': 'Quick Quiz', 'quiz.quick_quiz_desc': '10 questions \u00b7 Test your knowledge \u00b7 Earn XP', 'quiz.duel': 'Duel', 'quiz.duel_desc': '5 questions \u00b7 Against opponent \u00b7 2x XP reward', 'quiz.cosmic_league': 'Cosmic League', 'quiz.cosmic_league_desc': 'Weekly ranking \u00b7 League system \u00b7 Rewards', 'quiz.your_badges': 'Your Badges', 'quiz.question_label': 'Question', 'quiz.you': 'You', 'quiz.opponent': 'Opponent', 'quiz.next': 'Next \u2192', 'quiz.menu': '\u2190 Menu', 'quiz.play_again': 'Play Again',

        // Wheel
        'wheel.title': 'Numantic Wheel', 'wheel.main_title': 'Numantic Wheel', 'wheel.subtitle': 'Discover your cosmic alignment', 'wheel.spin': 'SPIN', 'wheel.not_spun_yet': 'You haven\'t spun yet...', 'wheel.daily_rewards': 'Today\'s Cosmic Rewards', 'wheel.refreshes_daily': 'Refreshes once daily', 'wheel.reward_1_day': '1 Day Premium', 'wheel.chance_15': '15% chance', 'wheel.reward_5_days': '5 Days Premium', 'wheel.chance_5': '5% chance', 'wheel.reward_10_days': '10 Days Premium', 'wheel.chance_2': '2% chance', 'wheel.stars_aligning': 'Stars are aligning', 'wheel.premium_reward_won': 'Premium Reward Won!', 'wheel.claim_reward': 'CLAIM REWARD',

        // Leaderboard
        'leaderboard.title': 'Cosmic League', 'leaderboard.weekly_rewards': 'Weekly Rewards', 'leaderboard.prize_1_premium': '2 Days Premium', 'leaderboard.prize_1_bonus': '+ Champion Crown', 'leaderboard.prize_2_premium': '1 Day Premium', 'leaderboard.prize_2_bonus': '+ Silver Crown', 'leaderboard.prize_3_premium': 'Rare Card', 'leaderboard.prize_3_bonus': '+ Bronze Crown', 'leaderboard.league_closing': 'League Closing:', 'leaderboard.weekly_ranking': 'Weekly Ranking', 'leaderboard.top3_promotion': 'Top 3 = Promotion', 'leaderboard.bottom3_relegation': 'Bottom 3 = Relegation', 'leaderboard.promotion_info': 'At the end of the week, top 3 promote to a higher league, bottom 3 relegate.', 'leaderboard.quiz_cta': 'Take Quiz & Climb Rankings',

        // Premium
        'premium.header_title': 'Payment', 'premium.plan_name': 'Numantic Premium', 'premium.trial_info': 'First 3 days free \u00b7 Cancel anytime', 'premium.secure_payment': 'Secure Payment', 'premium.payment_desc': 'Pressing the button below will open the Paddle secure payment window', 'premium.security_note': 'Paddle secure payment \u00b7 VAT included automatically', 'premium.complete_payment': 'Complete Payment', 'premium.terms_text': 'By completing payment you accept the Terms of Service.', 'premium.skip_free': 'Continue free for now \u2192', 'premium.success_title': 'Premium Active!', 'premium.success_desc': 'Congratulations! You now have unlimited access to all features.', 'premium.trial_started': '3-day free trial started', 'premium.explore_btn': 'Start Exploring',

        // Store
        'store.header_title': 'Numantic Premium', 'store.premium_active': 'Premium Active', 'store.feature_ai': 'Unlimited AI Analysis', 'store.feature_friends': 'Unlimited Friends & Compatibility', 'store.feature_cosmic': 'Cosmic Match Reveal', 'store.feature_deep': 'Full Deep Insight (3 pages)', 'store.feature_guide': 'AI Daily Guide & Cosmic Calendar', 'store.hero_title': 'Unlock the Full Power of Numerology', 'store.hero_desc': 'Unlimited AI analysis, Cosmic Match reveal, full compatibility reports and much more.', 'store.monthly': 'Monthly', 'store.save_badge': '37% SAVINGS', 'store.yearly': 'Yearly', 'store.go_premium': 'Go Premium', 'store.cancel_info': 'Cancel anytime \u00b7 3-day free trial', 'store.comparison_title': 'Free vs Premium', 'store.feature_col': 'Feature', 'store.perks_title': 'Premium Perks', 'store.try_free': 'Try 3 Days Free',

        // Person Profile
        'kisi.personality_analysis': 'Personality Analysis', 'kisi.deep_insight_desc': 'Pythagoras \u00b7 Expression \u00b7 Soul Urge \u00b7 Life Path', 'kisi.friendship_dynamics': 'Friendship Dynamics', 'kisi.friendship_desc': 'Harmony between you \u00b7 Roadmap \u00b7 Analysis', 'kisi.compatibility_analysis': 'Compatibility Analysis', 'kisi.compatibility_desc': 'Romantic harmony \u00b7 Karmic bond \u00b7 Soulmate score',

        // Meaning
        'meaning.header_title': 'Numerology Meanings', 'meaning.close': 'Close', 'meaning.core_vibrations': 'Core Vibrations 1-9', 'meaning.core_subtitle': 'Discover the fundamental energy of each number', 'meaning.num1_title': 'Pioneer', 'meaning.num1_desc': 'Leadership, independence, beginnings, ambition, determination', 'meaning.num2_title': 'Peacemaker', 'meaning.num2_desc': 'Partnership, duality, diplomacy, intuition, balance', 'meaning.num3_title': 'Creative', 'meaning.num3_desc': 'Expression, creativity, communication, optimism', 'meaning.num4_title': 'Builder', 'meaning.num4_desc': 'Determination, structure, diligence, practicality', 'meaning.num5_title': 'Adventurer', 'meaning.num5_desc': 'Freedom, change, adventure, versatility', 'meaning.num6_title': 'Guardian', 'meaning.num6_desc': 'Responsibility, protection, nurturing, community, balance', 'meaning.num7_title': 'Seeker', 'meaning.num7_desc': 'Knowledge, contemplation, spirituality, analysis, understanding', 'meaning.num8_title': 'Executive', 'meaning.num8_desc': 'Power, abundance, finance, management, material freedom', 'meaning.num9_title': 'Humanitarian', 'meaning.num9_desc': 'Altruism, completion, compassion, idealism', 'meaning.get_full_chart': 'Get Your Full Chart',

        // Vibration
        'vibration.header_title': 'Share Analysis', 'vibration.analysis_card': 'Analysis Card', 'vibration.life_path_number': 'Life Path Number', 'vibration.archetype': 'Deep Spiritual Seeker', 'vibration.archetype_traits': 'Wisdom \u00b7 Introspection \u00b7 Truth', 'vibration.card_info': 'This card is ideal for stories and status updates.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'Save to Gallery', 'vibration.copy_link': 'Copy Link', 'vibration.other': 'Other',

        // Archive
        'archive.header_title': 'Sacred Archive', 'archive.eternal_record': 'Eternal Archive Record', 'archive.destiny_analysis': 'Full Destiny Analysis', 'archive.life_path_label': 'Life Path', 'archive.soul_urge_label': 'Soul Urge', 'archive.destiny_label': 'Destiny', 'archive.inscribed_date': 'Inscribed date', 'archive.closing_question': 'How did this wisdom shape your journey?',

        // Onboarding
        'onboarding.slide1_title_1': 'Cosmic', 'onboarding.slide1_title_2': 'Discover Your Purpose', 'onboarding.slide1_desc': 'Illuminate your spiritual journey by discovering hidden vibrations in your birth date and name.', 'onboarding.slide2_title_1': 'Find Your Soulmate', 'onboarding.slide2_title_2': 'Discover New Spiritual Bonds', 'onboarding.slide2_desc': 'Discover cosmic bonds in love, friendship and work relationships through numerological compatibility analysis.', 'onboarding.slide3_title_1': 'Daily', 'onboarding.slide3_title_2': 'Cosmic Guide', 'onboarding.slide3_desc': 'Make the best decisions every day according to your personal energy calendar.', 'onboarding.slide4_title_1': 'Send Your Intention', 'onboarding.slide4_title_2': 'To the Universe', 'onboarding.slide4_desc': 'Set your intentions in the manifest portal, release them to cosmic energy and manifest together with the community.', 'onboarding.btn_continue': 'Continue', 'onboarding.btn_start': 'Start', 'onboarding.btn_login': 'Login', 'onboarding.theme_light': 'Light Mode', 'onboarding.theme_dark': 'Dark Mode',

        // Splash
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'Reading the stars', 'splash.msg_aligning': 'Cosmos is aligning', 'splash.msg_channeling': 'Channeling your energy', 'splash.msg_awakening': 'Your destiny is awakening',

        // Branded Splash
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'Heavenly Guidance', 'branded_splash.loading_text': 'Syncing with the cosmos...',

        // Loading
        'soulmate_loading.title': 'Syncing your souls...', 'soulmate_loading.subtitle': 'Karmic paths are touching...', 'soulmate_loading.progress_label': 'Synthesizing Love Frequencies', 'soulmate_loading.engine_label': 'Soulmate Engine v2.0', 'calc_loading.title': 'Calculating your vibrations...', 'calc_loading.subtitle': 'Consulting the stars and aligning cosmic paths', 'calc_loading.msg_syncing': 'Syncing with the universe', 'calc_loading.msg_calculating': 'Calculating your vibrations', 'calc_loading.msg_aligning': 'Aligning cosmic paths', 'calc_loading.msg_reading': 'Reading sacred numbers', 'calc_loading.msg_almost': 'Almost ready...', 'calc_loading.engine_label': 'Numerology Engine v2.0',

        // Wheel Reward
        'wheel_reward.header_title': 'Destiny\'s Gift', 'wheel_reward.title': 'Destiny Has Spoken', 'wheel_reward.subtitle': 'A Sacred Gift Has Emerged', 'wheel_reward.reward_title': '3 Free Crystals', 'wheel_reward.reward_subtitle': 'Deep Name Analysis Unlocked', 'wheel_reward.reward_desc': 'Use them to unlock your daily horoscope and explore your spiritual path.', 'wheel_reward.btn_claim': 'Claim Reward', 'wheel_reward.btn_vault': 'Add to my spiritual vault', 'wheel_reward.nav_home': 'Home', 'wheel_reward.nav_readings': 'Readings', 'wheel_reward.nav_wheel': 'Wheel', 'wheel_reward.nav_store': 'Store', 'wheel_reward.nav_profile': 'Profile',

        // Manifest Portal (phases)
        'manifest.cat_love': 'Love', 'manifest.cat_money': 'Money', 'manifest.cat_health': 'Health', 'manifest.cat_career': 'Career', 'manifest.cat_spiritual': 'Soul', 'manifest.phase_full': 'Full Moon Phase', 'manifest.energy_release': 'Energy: Release & Completion', 'manifest.title_release': 'Release & Set Free', 'manifest.sub_release': 'Surrender what no longer serves your highest path to the silver moonlight.', 'manifest.placeholder_release': 'What are you ready to release to the universe?', 'manifest.hint_release': 'Let go. Surrender. Be free.', 'manifest.btn_release': 'Release to Universe', 'manifest.sent_release': 'Released to Universe', 'manifest.sent_sub_release': 'Your intention is now being woven into the cosmic fabric', 'manifest.phase_new': 'New Moon Phase', 'manifest.energy_new': 'Energy: New Intentions', 'manifest.title_new': 'New Intentions', 'manifest.sub_new': 'Plant your cosmic desires in the fertile darkness of the new cycle.', 'manifest.placeholder_new': 'What seeds are you ready to plant today?', 'manifest.hint_new': 'Plant the seed. Trust the cosmos.', 'manifest.btn_new': 'Plant My Seed', 'manifest.sent_new': 'Seed Planted in Cosmos', 'manifest.sent_sub_new': 'Your intention is taking root in the fertile darkness', 'manifest.energy_waning': 'Energy: Waning & Releasing', 'manifest.energy_waxing': 'Energy: Waxing & Building', 'manifest.title_cosmic': 'Cosmic Portal', 'manifest.sub_cosmic': 'Vibrate at the frequency of your desires.', 'manifest.placeholder_cosmic': 'Write your intention to the universe...', 'manifest.hint_cosmic': 'Be specific. Feel the vibration.', 'manifest.btn_cosmic': 'Send to Universe', 'manifest.sent_cosmic': 'Sent to Universe', 'manifest.sent_sub_cosmic': 'Your intention is now cosmic energy'
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

        'conn.title': 'Seelenverbindungen', 'conn.mark_all_read': 'Alle als gelesen markieren', 'conn.soul_connections': 'Seelenverbindungen',

        'match.optin_title': 'Kosmisches Match', 'match.optin_subtitle': 'Teile dein numerologisches Profil mit anderen Nutzern und entdecke die Seelenverwandten, die das Universum für dich ausgewählt hat.', 'match.optin_shared_title': 'Was wird geteilt?', 'match.optin_shared_desc': 'Nur dein Name, Lebenspfad und numerologische Zahlen', 'match.optin_privacy_title': 'Datenschutz', 'match.optin_privacy_desc': 'Dein Geburtsdatum und persönliche Daten werden nicht geteilt', 'match.optin_toggle_title': 'Jederzeit deaktivieren', 'match.optin_toggle_desc': 'Deaktiviere deine Auffindbarkeit in den Profileinstellungen', 'match.select_city_label': 'Wähle deine Stadt', 'match.select_province': '\u2014 Provinz wählen \u2014', 'match.join_discovery_btn': 'Entdeckung beitreten', 'match.you_label': 'Du', 'match.soul_harmony': 'Seelenharmonie', 'match.cosmic_bond': 'Kosmische Bindung', 'match.reveal_profile': 'Profil enthüllen', 'match.no_credits_msg': 'Deine Enthüllungs-Credits für heute sind aufgebraucht', 'match.credits_tomorrow': 'Morgen kommen 5 neue Credits', 'match.waiting_match': 'Warte auf Match', 'match.empty_bond_desc': 'Matches beginnen, wenn mehr Nutzer beitreten. Deine kosmische Bindung wird bald entstehen!', 'match.daily_matches_title': 'Tägliche Matches', 'match.cosmic_map_title': 'Kosmische Karte', 'match.city_btn': 'Stadt', 'match.save_btn': 'Speichern', 'match.map_empty': 'Noch keine Seelen auf der Karte...', 'match.cosmic_analysis_title': 'Kosmische Analyse', 'match.harmony_analysis': 'Harmonieanalyse', 'match.past_matches_title': 'Vergangene Matches', 'match.history_empty': 'Dein Match-Verlauf erscheint hier', 'match.add_connection': 'Verbindung hinzufügen',
        'connections.notifications': 'Benachrichtigungen', 'connections.add': 'Hinzufügen', 'connections.match_connections': 'Match-Verbindungen', 'connections.recent_analyses': 'Letzte Analysen', 'connections.no_analyses': 'Noch keine Analysen.', 'connections.start_new_analysis': '+ Neue Analyse starten', 'connections.new_analysis_btn': 'Neue Analyse starten',
        'manifest_community.my_manifests_btn': 'Meine Manifeste', 'manifest_community.sort_newest': 'Neueste', 'manifest_community.sort_top_rated': 'Beliebteste', 'manifest_community.sort_weekly': 'Wöchentlich', 'manifest_community.cat_all': 'Alle', 'manifest_community.cat_money': 'Geld', 'manifest_community.cat_love': 'Liebe', 'manifest_community.cat_health': 'Gesundheit', 'manifest_community.cat_career': 'Karriere', 'manifest_community.cat_soul': 'Seele', 'manifest_community.info_title': 'Manifest-Portal', 'manifest_community.info_desc': 'Entdecke Community-Manifeste, lass dich inspirieren und sende deine Intentionen ins Universum.', 'manifest_community.info_ok_btn': 'Verstanden', 'manifest_community.my_manifests_title': 'Meine Manifeste',
        'manifest_portal.header_title': 'Manifest-Portal', 'manifest_portal.hero_title': 'Leinwand des Raums', 'manifest_portal.hero_subtitle': 'Deine Intentionen sind die Sterne, die dein persönliches Universum erleuchten.', 'manifest_portal.go_premium': 'Premium holen \u2192', 'manifest_portal.no_manifest_title': 'Noch keine Manifeste', 'manifest_portal.no_manifest_desc': 'Das Universum wartet auf deine Intentionen. Beginne deine Reise, indem du deine Wünsche in Worte fasst.', 'manifest_portal.write_manifest_btn': 'Manifest schreiben', 'manifest_portal.premium_title': 'Premium-Vorteil', 'manifest_portal.premium_desc': 'Erstelle unbegrenzte Manifeste und verstärke deinen kosmischen Energiefluss mit Premium.', 'manifest_portal.view_benefits_btn': 'Alle Vorteile ansehen',
        'breakdown1.header_title': 'Namensanalyse', 'breakdown1.expression_label': 'Ausdruck', 'breakdown1.tap_to_calculate': 'Tippen um Berechnung zu sehen', 'breakdown1.soul_urge_title': 'Seelendrang', 'breakdown1.soul_urge_badge': 'Innen', 'breakdown1.soul_urge_desc': 'Ein tiefer Wahrheitssucher, der nach spirituellem Verständnis strebt.', 'breakdown1.personality_title': 'Persönlichkeit', 'breakdown1.personality_badge': 'Außen', 'breakdown1.personality_desc': 'Wird als zurückhaltend, analytisch und hochkompetent wahrgenommen.', 'breakdown1.life_path_title': 'Lebenspfad', 'breakdown1.life_path_badge': 'Schicksal', 'breakdown1.life_path_desc': 'Der Bauplan deines Schicksals, der deinen Zweck und dein Wachstum leitet.', 'breakdown1.karmic_bond_title': 'Karmische Bindung', 'breakdown1.karmic_bond_badge': 'Schuld', 'breakdown1.karmic_bond_desc': 'Analyse karmischer Schulden und Lektionen aus vergangenen Leben.', 'breakdown1.ask_master_btn': 'Numerologie-Meister fragen', 'breakdown1.key_energy_label': 'Schlüsselenergie', 'breakdown1.key_energy_value': 'Harmonie', 'breakdown1.focus_label': 'Fokus', 'breakdown1.focus_value': 'Geist', 'breakdown1.context_analysis_title': 'Kontextanalyse', 'breakdown1.context_analysis_desc': 'Kombinierte Interpretation deiner Zahlen + Zeitkontext', 'breakdown1.intensity_label': 'Intensität', 'breakdown1.context_loading': 'Kontextanalyse wird vorbereitet...', 'breakdown1.view_detailed_reading': 'Detaillierte Lesung ansehen', 'breakdown1.master_modal_title': 'NUMEROLOGIE-MEISTER', 'breakdown1.master_modal_subtitle': 'Beantwortet deine karmischen Fragen', 'breakdown1.master_input_placeholder': 'Frage zu deiner karmischen Schuld...',
        'breakdown2.header_label': 'Vollständige Analyse', 'breakdown2.karmic_bond_title': 'Karmische Bindung', 'breakdown2.karmic_bond_loading': 'Karmische Bindung wird gelesen...', 'breakdown2.communication_title': 'Kommunikationsharmonie', 'breakdown2.comm_logic': 'Logik', 'breakdown2.comm_intuition': 'Intuition', 'breakdown2.comm_verbal': 'Verbal', 'breakdown2.comm_empathy': 'Empathie', 'breakdown2.communication_loading': 'Kommunikationsharmonie wird analysiert...', 'breakdown2.emotional_synergy_title': 'Emotionale Synergie', 'breakdown2.soul_urge_match_label': 'Seelendrang-Übereinstimmung', 'breakdown2.emotional_loading': 'Emotionale Harmonie wird berechnet...', 'breakdown2.shared_destiny_title': 'Gemeinsames Schicksal', 'breakdown2.shared_destiny_loading': 'Gemeinsames Schicksal wird gelesen...', 'breakdown2.download_pdf_btn': 'Als PDF herunterladen',
        'breakdown3.header_title': 'Beziehungsanalyse', 'breakdown3.cosmic_resonance': 'Kosmische Resonanz', 'breakdown3.karmic_title': 'Karmische Beziehungsbindung', 'breakdown3.karmic_badge': 'Karma', 'breakdown3.karmic_analyze': 'ANALYSIEREN', 'breakdown3.karmic_desc': 'Analyse der karmischen Bindung und Spuren vergangener Leben zwischen zwei Seelen.', 'breakdown3.ask_guide_btn': 'Beziehungsführer fragen', 'breakdown3.soul_urge_title': 'Seelendrang-Harmonie', 'breakdown3.soul_urge_badge': 'Herz', 'breakdown3.soul_urge_desc': 'Die Harmonie eurer inneren Wünsche und emotionalen Bedürfnisse.', 'breakdown3.personality_title': 'Persönlichkeitsharmonie', 'breakdown3.personality_badge': 'Außen', 'breakdown3.personality_desc': 'Eure soziale Dynamik und wie ihr euch der Außenwelt zeigt.', 'breakdown3.life_path_title': 'Lebenspfad-Vereinigung', 'breakdown3.life_path_badge': 'Schicksal', 'breakdown3.life_path_desc': 'Der Schnittpunkt eurer Schicksalspfade und eure gemeinsame Reise.', 'breakdown3.expression_title': 'Ausdrucksharmonie', 'breakdown3.expression_badge': 'Ausdruck', 'breakdown3.expression_desc': 'Die Harmonie eurer Namensenergien und wie sie sich ergänzen.', 'breakdown3.communication_title': 'Kommunikationsharmonie', 'breakdown3.communication_badge': 'Kommunikation', 'breakdown3.communication_desc': 'Eure Kommunikationsstile und wie ihr euch versteht.', 'breakdown3.bond_quality_label': 'Bindungsqualität', 'breakdown3.growth_area_label': 'Wachstumsbereich', 'breakdown3.full_analysis_btn': 'Vollständige Analyse ansehen', 'breakdown3.guide_modal_title': 'BEZIEHUNGSFÜHRER', 'breakdown3.guide_modal_subtitle': 'Beantwortet eure Beziehungsfragen', 'breakdown3.guide_input_placeholder': 'Frage zu eurer Beziehung...', 'breakdown3.share_title': 'Seelenpartner-Karte teilen', 'breakdown3.share_cta': 'Teile diese Karte mit deinen Liebsten', 'breakdown3.save_to_gallery': 'In Galerie speichern', 'breakdown3.copy_link': 'Kopieren', 'breakdown3.other': 'Sonstiges',
        'compat_form.header_title': 'Beziehungskompatibilität', 'compat_form.headline': 'Entdecke deine kosmische Ausrichtung', 'compat_form.subheadline': 'Gib die Details ein, um die spirituelle Bindung zwischen zwei Seelen zu enthüllen.', 'compat_form.you_label': 'Du', 'compat_form.main_account': 'Hauptkonto', 'compat_form.your_name_label': 'Dein Name', 'compat_form.profile_loading_placeholder': 'Profilinfo wird geladen...', 'compat_form.your_birthdate_label': 'Dein Geburtsdatum', 'compat_form.partner_label': 'Partner', 'compat_form.partner_name_label': 'Name des Partners', 'compat_form.partner_name_placeholder': 'Vollständigen Namen eingeben', 'compat_form.partner_birthdate_label': 'Geburtsdatum des Partners', 'compat_form.footer_note': 'Berechnungen basieren auf numerologischen Prinzipien und astrologischen Ausrichtungen.', 'compat_form.check_btn': 'Kompatibilität prüfen',
        'compat_analysis.header_title': 'Kompatibilitätsanalyse', 'compat_analysis.harmony_label': 'Harmonie', 'compat_analysis.you_name': 'Du', 'compat_analysis.life_path_label': 'Lebenspfad', 'compat_analysis.personality_label': 'Persönlichkeit', 'compat_analysis.soul_urge_label': 'Seelendrang', 'compat_analysis.expression_label': 'Ausdruck', 'compat_analysis.cosmic_bond_title': 'Kosmische Bindung', 'compat_analysis.cosmic_bond_loading': 'Kosmische Bindung wird berechnet...', 'compat_analysis.unlock_love_guide': 'Vollständigen Liebesführer freischalten', 'compat_analysis.share_title': 'Seelenpartner-Karte teilen', 'compat_analysis.share_cta': 'Teile diese Karte mit deinen Liebsten', 'compat_analysis.save_to_gallery': 'In Galerie speichern', 'compat_analysis.copy_link': 'Kopieren', 'compat_analysis.other': 'Sonstiges',
        'daily_guide.header_title': 'Täglicher Führer', 'daily_guide.title': 'Tägliche Analyse', 'daily_guide.subtitle': 'Numerische Führung für heute', 'daily_guide.share_btn': 'Teilen', 'daily_guide.share_title': 'Analyse teilen', 'daily_guide.share_badge': 'Tägliche Analyse', 'daily_guide.share_desc': 'Teile deine tägliche Analyse', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'In Galerie speichern', 'daily_guide.share_copy': 'Link kopieren', 'daily_guide.share_other': 'Sonstiges',
        'deep_dive.header_title': 'Täglicher Tiefgang', 'deep_dive.day_title': 'Tag der Intuition', 'deep_dive.vibration_badge': 'Spirituelle Schwingung', 'deep_dive.focus_title': 'Fokussieren auf', 'deep_dive.avoid_title': 'Vermeiden', 'deep_dive.planetary_label': 'Planetare Ausrichtung', 'deep_dive.mantra_label': 'Tägliches Mantra', 'deep_dive.reminder_btn': 'Tägliche Erinnerung setzen',
        'calendar.menu_title': 'Menü', 'calendar.menu_calendar': 'Kalender', 'calendar.menu_planner': 'Planer', 'calendar.menu_ritual': 'Ritual', 'calendar.menu_daily_guide': 'Tagesführer', 'calendar.menu_profile': 'Profil', 'calendar.menu_settings': 'Einstellungen', 'calendar.header_title': 'Entscheidungskalender', 'calendar.day_sun': 'So', 'calendar.day_mon': 'Mo', 'calendar.day_tue': 'Di', 'calendar.day_wed': 'Mi', 'calendar.day_thu': 'Do', 'calendar.day_fri': 'Fr', 'calendar.day_sat': 'Sa', 'calendar.daily_analysis': 'Tägliche Analyse', 'calendar.active_cycle': 'Aktiver Zyklus', 'calendar.today_vibration': 'Heutige Schwingung', 'calendar.supported_label': 'Unterstützt', 'calendar.challenging_label': 'Herausfordernd', 'calendar.timing_cta': 'Heutiges Entscheidungstiming ansehen',
        'lunar.header_title': 'Mondenergie', 'lunar.vibration_phase': 'Schwingungsphase', 'lunar.detailed_reading': 'Detaillierte Lesung', 'lunar.guidance_title': 'Mondführung', 'lunar.crystal_wisdom': 'Kristallweisheit', 'lunar.end_reading': 'Ende der täglichen Lesung',
        'messaging.not_connected_text': 'Du musst verbunden sein, um Nachrichten zu senden.', 'messaging.back_to_connections': 'Zurück zu Verbindungen', 'messaging.no_messages': 'Noch keine Nachrichten', 'messaging.input_placeholder': 'Nachricht schreiben...',
        'friendship.title': 'Freundschaftsdynamik', 'friendship.bond_analysis': 'Freundschaftsbindungsanalyse', 'friendship.harmony': 'Harmonie', 'friendship.life_path': 'Lebenspfad', 'friendship.soul_urge': 'Seelendrang', 'friendship.personality': 'Persönlichkeit', 'friendship.expression': 'Ausdruck', 'friendship.energy_title': 'Freundschaftsenergie', 'friendship.energy_subtitle': 'Das Wesen und die grundlegende Dynamik eurer Bindung', 'friendship.communication_title': 'Kommunikationsdynamik', 'friendship.communication_subtitle': 'Wie ihr euch versteht', 'friendship.strengths_title': 'Gemeinsame Stärken', 'friendship.strengths_subtitle': 'Wo ihr zusammen glänzt', 'friendship.challenges_title': 'Aufmerksamkeitspunkte', 'friendship.challenges_subtitle': 'Bereiche der Reibung und nötige Balance', 'friendship.roadmap_title': 'Wegweiser', 'friendship.roadmap_subtitle': 'Ein Leitfaden zur Stärkung dieser Freundschaft', 'friendship.numerology_comparison': 'Numerologischer Vergleich', 'friendship.tbl_life_path': 'Lebenspfad', 'friendship.tbl_expression': 'Ausdruck', 'friendship.tbl_soul_urge': 'Seelendrang', 'friendship.tbl_personality': 'Persönlichkeit', 'friendship.share_title': 'Freundschaftskarte teilen', 'friendship.share_subtitle': 'Freundschaftsanalyse teilen', 'friendship.save_to_gallery': 'In Galerie speichern', 'friendship.copy': 'Kopieren', 'friendship.other': 'Sonstiges',
        'quiz.title': 'Numerologie-Quiz', 'quiz.correct': 'Richtig', 'quiz.win_streak': 'Siegesserie', 'quiz.quick_quiz': 'Schnell-Quiz', 'quiz.quick_quiz_desc': '10 Fragen \u00b7 Teste dein Wissen \u00b7 XP verdienen', 'quiz.duel': 'Duell', 'quiz.duel_desc': '5 Fragen \u00b7 Gegen Gegner \u00b7 2x XP Belohnung', 'quiz.cosmic_league': 'Kosmische Liga', 'quiz.cosmic_league_desc': 'Wöchentliches Ranking \u00b7 Ligasystem \u00b7 Belohnungen', 'quiz.your_badges': 'Deine Abzeichen', 'quiz.question_label': 'Frage', 'quiz.you': 'Du', 'quiz.opponent': 'Gegner', 'quiz.next': 'Weiter \u2192', 'quiz.menu': '\u2190 Menü', 'quiz.play_again': 'Nochmal spielen',
        'wheel.title': 'Numantic-Rad', 'wheel.main_title': 'Numantic-Rad', 'wheel.subtitle': 'Entdecke deine kosmische Ausrichtung', 'wheel.spin': 'DREHEN', 'wheel.not_spun_yet': 'Du hast noch nicht gedreht...', 'wheel.daily_rewards': 'Heutige kosmische Belohnungen', 'wheel.refreshes_daily': 'Wird täglich erneuert', 'wheel.reward_1_day': '1 Tag Premium', 'wheel.chance_15': '15% Chance', 'wheel.reward_5_days': '5 Tage Premium', 'wheel.chance_5': '5% Chance', 'wheel.reward_10_days': '10 Tage Premium', 'wheel.chance_2': '2% Chance', 'wheel.stars_aligning': 'Sterne richten sich aus', 'wheel.premium_reward_won': 'Premium-Belohnung gewonnen!', 'wheel.claim_reward': 'BELOHNUNG ABHOLEN',
        'leaderboard.title': 'Kosmische Liga', 'leaderboard.weekly_rewards': 'Wöchentliche Belohnungen', 'leaderboard.prize_1_premium': '2 Tage Premium', 'leaderboard.prize_1_bonus': '+ Meisterkrone', 'leaderboard.prize_2_premium': '1 Tag Premium', 'leaderboard.prize_2_bonus': '+ Silberkrone', 'leaderboard.prize_3_premium': 'Seltene Karte', 'leaderboard.prize_3_bonus': '+ Bronzekrone', 'leaderboard.league_closing': 'Liga-Ende:', 'leaderboard.weekly_ranking': 'Wöchentliches Ranking', 'leaderboard.top3_promotion': 'Top 3 = Aufstieg', 'leaderboard.bottom3_relegation': 'Letzte 3 = Abstieg', 'leaderboard.promotion_info': 'Am Wochenende steigen die Top 3 auf, die letzten 3 steigen ab.', 'leaderboard.quiz_cta': 'Quiz lösen & Ranking steigen',
        'premium.header_title': 'Zahlung', 'premium.plan_name': 'Numantic Premium', 'premium.trial_info': 'Erste 3 Tage kostenlos \u00b7 Jederzeit kündbar', 'premium.secure_payment': 'Sichere Zahlung', 'premium.payment_desc': 'Mit dem Klick unten öffnet sich das sichere Paddle-Zahlungsfenster', 'premium.security_note': 'Paddle sichere Zahlung \u00b7 MwSt. automatisch enthalten', 'premium.complete_payment': 'Zahlung abschließen', 'premium.terms_text': 'Mit der Zahlung akzeptierst du die Nutzungsbedingungen.', 'premium.skip_free': 'Vorerst kostenlos weiter \u2192', 'premium.success_title': 'Premium Aktiv!', 'premium.success_desc': 'Glückwunsch! Du hast jetzt unbegrenzten Zugang zu allen Funktionen.', 'premium.trial_started': '3-tägige kostenlose Testphase gestartet', 'premium.explore_btn': 'Erkundung starten',
        'store.header_title': 'Numantic Premium', 'store.premium_active': 'Premium Aktiv', 'store.feature_ai': 'Unbegrenzte KI-Analyse', 'store.feature_friends': 'Unbegrenzte Freunde & Kompatibilität', 'store.feature_cosmic': 'Cosmic Match Enthüllung', 'store.feature_deep': 'Vollständiger Deep Insight (3 Seiten)', 'store.feature_guide': 'KI-Tagesführer & Kosmischer Kalender', 'store.hero_title': 'Entfessle die volle Kraft der Numerologie', 'store.hero_desc': 'Unbegrenzte KI-Analyse, Cosmic Match Enthüllung, vollständige Kompatibilitätsberichte und vieles mehr.', 'store.monthly': 'Monatlich', 'store.save_badge': '37% ERSPARNIS', 'store.yearly': 'Jährlich', 'store.go_premium': 'Premium holen', 'store.cancel_info': 'Jederzeit kündbar \u00b7 3 Tage kostenlos testen', 'store.comparison_title': 'Free vs Premium', 'store.feature_col': 'Funktion', 'store.perks_title': 'Premium-Vorteile', 'store.try_free': '3 Tage kostenlos testen',
        'kisi.personality_analysis': 'Persönlichkeitsanalyse', 'kisi.deep_insight_desc': 'Pythagoras \u00b7 Ausdruck \u00b7 Seelendrang \u00b7 Lebenspfad', 'kisi.friendship_dynamics': 'Freundschaftsdynamik', 'kisi.friendship_desc': 'Harmonie zwischen euch \u00b7 Wegweiser \u00b7 Analyse', 'kisi.compatibility_analysis': 'Kompatibilitätsanalyse', 'kisi.compatibility_desc': 'Romantische Harmonie \u00b7 Karmische Bindung \u00b7 Seelenpartner-Wert',
        'meaning.header_title': 'Numerologie-Bedeutungen', 'meaning.close': 'Schließen', 'meaning.core_vibrations': 'Grundschwingungen 1-9', 'meaning.core_subtitle': 'Entdecke die grundlegende Energie jeder Zahl', 'meaning.num1_title': 'Pionier', 'meaning.num1_desc': 'Führung, Unabhängigkeit, Anfänge, Ehrgeiz, Entschlossenheit', 'meaning.num2_title': 'Friedensstifter', 'meaning.num2_desc': 'Partnerschaft, Dualität, Diplomatie, Intuition, Balance', 'meaning.num3_title': 'Kreativer', 'meaning.num3_desc': 'Ausdruck, Kreativität, Kommunikation, Optimismus', 'meaning.num4_title': 'Erbauer', 'meaning.num4_desc': 'Entschlossenheit, Struktur, Fleiß, Praktikabilität', 'meaning.num5_title': 'Abenteurer', 'meaning.num5_desc': 'Freiheit, Wandel, Abenteuer, Vielseitigkeit', 'meaning.num6_title': 'Beschützer', 'meaning.num6_desc': 'Verantwortung, Schutz, Fürsorge, Gemeinschaft, Balance', 'meaning.num7_title': 'Suchender', 'meaning.num7_desc': 'Wissen, Kontemplation, Spiritualität, Analyse, Verständnis', 'meaning.num8_title': 'Manager', 'meaning.num8_desc': 'Macht, Fülle, Finanzen, Management, materielle Freiheit', 'meaning.num9_title': 'Humanist', 'meaning.num9_desc': 'Altruismus, Vollendung, Mitgefühl, Idealismus', 'meaning.get_full_chart': 'Dein vollständiges Chart holen',
        'vibration.header_title': 'Analyse teilen', 'vibration.analysis_card': 'Analysekarte', 'vibration.life_path_number': 'Lebenspfadzahl', 'vibration.archetype': 'Tiefer spiritueller Suchender', 'vibration.archetype_traits': 'Weisheit \u00b7 Introspektion \u00b7 Wahrheit', 'vibration.card_info': 'Diese Karte ist ideal für Stories und Status-Updates.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'In Galerie speichern', 'vibration.copy_link': 'Link kopieren', 'vibration.other': 'Sonstiges',
        'archive.header_title': 'Heiliges Archiv', 'archive.eternal_record': 'Ewiger Archivdatensatz', 'archive.destiny_analysis': 'Vollständige Schicksalsanalyse', 'archive.life_path_label': 'Lebenspfad', 'archive.soul_urge_label': 'Seelendrang', 'archive.destiny_label': 'Schicksal', 'archive.inscribed_date': 'Einschreibedatum', 'archive.closing_question': 'Wie hat diese Weisheit deine Reise geprägt?',
        'onboarding.slide1_title_1': 'Kosmisch', 'onboarding.slide1_title_2': 'Entdecke deinen Zweck', 'onboarding.slide1_desc': 'Erleuchte deine spirituelle Reise, indem du verborgene Schwingungen in deinem Geburtsdatum und Namen entdeckst.', 'onboarding.slide2_title_1': 'Finde deinen Seelenpartner', 'onboarding.slide2_title_2': 'Entdecke neue spirituelle Bindungen', 'onboarding.slide2_desc': 'Entdecke kosmische Bindungen in Liebe, Freundschaft und Arbeitsbeziehungen durch numerologische Kompatibilitätsanalyse.', 'onboarding.slide3_title_1': 'Täglicher', 'onboarding.slide3_title_2': 'Kosmischer Führer', 'onboarding.slide3_desc': 'Triff jeden Tag die besten Entscheidungen gemäß deinem persönlichen Energiekalender.', 'onboarding.slide4_title_1': 'Sende deine Intention', 'onboarding.slide4_title_2': 'ans Universum', 'onboarding.slide4_desc': 'Setze deine Intentionen im Manifest-Portal, übergib sie der kosmischen Energie und manifestiere gemeinsam mit der Community.', 'onboarding.btn_continue': 'Weiter', 'onboarding.btn_start': 'Start', 'onboarding.btn_login': 'Anmelden', 'onboarding.theme_light': 'Hellmodus', 'onboarding.theme_dark': 'Dunkelmodus',
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'Sterne werden gelesen', 'splash.msg_aligning': 'Kosmos richtet sich aus', 'splash.msg_channeling': 'Deine Energie wird kanalisiert', 'splash.msg_awakening': 'Dein Schicksal erwacht',
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'Himmlische Führung', 'branded_splash.loading_text': 'Synchronisierung mit dem Kosmos...',
        'soulmate_loading.title': 'Eure Seelen werden synchronisiert...', 'soulmate_loading.subtitle': 'Karmische Pfade berühren sich...', 'soulmate_loading.progress_label': 'Liebesfrequenzen werden synthetisiert', 'soulmate_loading.engine_label': 'Seelenpartner-Motor v2.0', 'calc_loading.title': 'Deine Schwingungen werden berechnet...', 'calc_loading.subtitle': 'Die Sterne werden befragt und kosmische Pfade ausgerichtet', 'calc_loading.msg_syncing': 'Synchronisierung mit dem Universum', 'calc_loading.msg_calculating': 'Deine Schwingungen werden berechnet', 'calc_loading.msg_aligning': 'Kosmische Pfade werden ausgerichtet', 'calc_loading.msg_reading': 'Heilige Zahlen werden gelesen', 'calc_loading.msg_almost': 'Fast fertig...', 'calc_loading.engine_label': 'Numerologie-Motor v2.0',
        'wheel_reward.header_title': 'Schicksals Geschenk', 'wheel_reward.title': 'Das Schicksal hat gesprochen', 'wheel_reward.subtitle': 'Ein heiliges Geschenk ist erschienen', 'wheel_reward.reward_title': '3 Kostenlose Kristalle', 'wheel_reward.reward_subtitle': 'Tiefe Namensanalyse freigeschaltet', 'wheel_reward.reward_desc': 'Nutze sie, um dein Tageshoroskop freizuschalten und deinen spirituellen Pfad zu erkunden.', 'wheel_reward.btn_claim': 'Belohnung abholen', 'wheel_reward.btn_vault': 'Zu meinem spirituellen Tresor hinzufügen', 'wheel_reward.nav_home': 'Home', 'wheel_reward.nav_readings': 'Lesungen', 'wheel_reward.nav_wheel': 'Rad', 'wheel_reward.nav_store': 'Shop', 'wheel_reward.nav_profile': 'Profil',
        'manifest.cat_love': 'Liebe', 'manifest.cat_money': 'Geld', 'manifest.cat_health': 'Gesundheit', 'manifest.cat_career': 'Karriere', 'manifest.cat_spiritual': 'Seele', 'manifest.phase_full': 'Vollmondphase', 'manifest.energy_release': 'Energie: Loslassen & Vollendung', 'manifest.title_release': 'Loslassen & Befreien', 'manifest.sub_release': 'Übergib dem silbernen Mondlicht, was deinem höchsten Pfad nicht mehr dient.', 'manifest.placeholder_release': 'Was bist du bereit, dem Universum zu übergeben?', 'manifest.hint_release': 'Lass los. Übergib. Sei frei.', 'manifest.btn_release': 'Dem Universum übergeben', 'manifest.sent_release': 'Dem Universum übergeben', 'manifest.sent_sub_release': 'Deine Intention wird nun ins kosmische Gewebe eingewoben', 'manifest.phase_new': 'Neumondphase', 'manifest.energy_new': 'Energie: Neue Intentionen', 'manifest.title_new': 'Neue Intentionen', 'manifest.sub_new': 'Pflanze deine kosmischen Wünsche in die fruchtbare Dunkelheit des neuen Zyklus.', 'manifest.placeholder_new': 'Welche Samen bist du bereit, heute zu pflanzen?', 'manifest.hint_new': 'Pflanze den Samen. Vertraue dem Kosmos.', 'manifest.btn_new': 'Meinen Samen pflanzen', 'manifest.sent_new': 'Samen im Kosmos gepflanzt', 'manifest.sent_sub_new': 'Deine Intention schlägt Wurzeln in der fruchtbaren Dunkelheit', 'manifest.energy_waning': 'Energie: Abnehmend & Loslassend', 'manifest.energy_waxing': 'Energie: Zunehmend & Aufbauend', 'manifest.title_cosmic': 'Kosmisches Portal', 'manifest.sub_cosmic': 'Schwinge auf der Frequenz deiner Wünsche.', 'manifest.placeholder_cosmic': 'Schreibe deine Intention ans Universum...', 'manifest.hint_cosmic': 'Sei spezifisch. Fühle die Schwingung.', 'manifest.btn_cosmic': 'Ans Universum senden', 'manifest.sent_cosmic': 'Ans Universum gesendet', 'manifest.sent_sub_cosmic': 'Deine Intention ist jetzt kosmische Energie'
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

        'conn.title': 'Connexions de l\'Âme', 'conn.mark_all_read': 'Tout marquer comme lu', 'conn.soul_connections': 'Connexions de l\'Âme',

        'match.optin_title': 'Match Cosmique', 'match.optin_subtitle': 'Partage ton profil numérologique avec d\'autres utilisateurs et découvre les âmes sœurs que l\'univers a choisies pour toi.', 'match.optin_shared_title': 'Que partage-t-on ?', 'match.optin_shared_desc': 'Seulement ton nom, chemin de vie et nombres numérologiques', 'match.optin_privacy_title': 'Confidentialité', 'match.optin_privacy_desc': 'Ta date de naissance et tes données personnelles ne sont pas partagées', 'match.optin_toggle_title': 'Désactive quand tu veux', 'match.optin_toggle_desc': 'Désactive ta visibilité dans les paramètres du profil', 'match.select_city_label': 'Choisis ta ville', 'match.select_province': '\u2014 Choisir la province \u2014', 'match.join_discovery_btn': 'Rejoindre la découverte', 'match.you_label': 'Toi', 'match.soul_harmony': 'Harmonie de l\'Âme', 'match.cosmic_bond': 'Lien Cosmique', 'match.reveal_profile': 'Révéler le profil', 'match.no_credits_msg': 'Tes crédits de révélation sont épuisés pour aujourd\'hui', 'match.credits_tomorrow': '5 nouveaux crédits demain', 'match.waiting_match': 'En attente de match', 'match.empty_bond_desc': 'Les matchs commenceront quand plus d\'utilisateurs rejoindront. Ton lien cosmique émergera bientôt !', 'match.daily_matches_title': 'Matchs Quotidiens', 'match.cosmic_map_title': 'Carte Cosmique', 'match.city_btn': 'Ville', 'match.save_btn': 'Enregistrer', 'match.map_empty': 'Pas encore d\'âmes sur la carte...', 'match.cosmic_analysis_title': 'Analyse Cosmique', 'match.harmony_analysis': 'Analyse d\'Harmonie', 'match.past_matches_title': 'Matchs Passés', 'match.history_empty': 'Ton historique de matchs apparaîtra ici', 'match.add_connection': 'Ajouter une connexion',
        'connections.notifications': 'Notifications', 'connections.add': 'Ajouter', 'connections.match_connections': 'Connexions de Match', 'connections.recent_analyses': 'Analyses Récentes', 'connections.no_analyses': 'Pas encore d\'analyses.', 'connections.start_new_analysis': '+ Nouvelle Analyse', 'connections.new_analysis_btn': 'Nouvelle Analyse',
        'manifest_community.my_manifests_btn': 'Mes Manifestes', 'manifest_community.sort_newest': 'Plus Récents', 'manifest_community.sort_top_rated': 'Les Mieux Notés', 'manifest_community.sort_weekly': 'Hebdomadaire', 'manifest_community.cat_all': 'Tous', 'manifest_community.cat_money': 'Argent', 'manifest_community.cat_love': 'Amour', 'manifest_community.cat_health': 'Santé', 'manifest_community.cat_career': 'Carrière', 'manifest_community.cat_soul': 'Âme', 'manifest_community.info_title': 'Portail de Manifestation', 'manifest_community.info_desc': 'Découvre les manifestes de la communauté, inspire-toi et envoie tes intentions à l\'univers.', 'manifest_community.info_ok_btn': 'Compris', 'manifest_community.my_manifests_title': 'Mes Manifestes',
        'manifest_portal.header_title': 'Portail de Manifestation', 'manifest_portal.hero_title': 'Toile de l\'Espace', 'manifest_portal.hero_subtitle': 'Tes intentions sont les étoiles qui illuminent ton univers personnel.', 'manifest_portal.go_premium': 'Passer Premium \u2192', 'manifest_portal.no_manifest_title': 'Pas encore de manifestes', 'manifest_portal.no_manifest_desc': 'L\'univers attend tes intentions. Commence ton voyage en mettant tes désirs en mots.', 'manifest_portal.write_manifest_btn': 'Écrire un Manifeste', 'manifest_portal.premium_title': 'Avantage Premium', 'manifest_portal.premium_desc': 'Crée des manifestes illimités et amplifie ton flux d\'énergie cosmique avec l\'abonnement premium.', 'manifest_portal.view_benefits_btn': 'Voir tous les avantages',
        'breakdown1.header_title': 'Analyse du Nom', 'breakdown1.expression_label': 'Expression', 'breakdown1.tap_to_calculate': 'Appuie pour voir le calcul', 'breakdown1.soul_urge_title': 'Désir de l\'Âme', 'breakdown1.soul_urge_badge': 'Intérieur', 'breakdown1.soul_urge_desc': 'Un chercheur profond de vérité aspirant à la compréhension spirituelle.', 'breakdown1.personality_title': 'Personnalité', 'breakdown1.personality_badge': 'Extérieur', 'breakdown1.personality_desc': 'Perçu comme réservé, analytique et très compétent.', 'breakdown1.life_path_title': 'Chemin de Vie', 'breakdown1.life_path_badge': 'Destin', 'breakdown1.life_path_desc': 'Le plan de ton destin guidant ton but ultime et ta croissance.', 'breakdown1.karmic_bond_title': 'Lien Karmique', 'breakdown1.karmic_bond_badge': 'Dette', 'breakdown1.karmic_bond_desc': 'Analyse des dettes karmiques et leçons des vies passées.', 'breakdown1.ask_master_btn': 'Demander au Maître Numérologique', 'breakdown1.key_energy_label': 'Énergie Clé', 'breakdown1.key_energy_value': 'Harmonie', 'breakdown1.focus_label': 'Focus', 'breakdown1.focus_value': 'Esprit', 'breakdown1.context_analysis_title': 'Analyse Contextuelle', 'breakdown1.context_analysis_desc': 'Interprétation combinée de tes nombres + contexte temporel', 'breakdown1.intensity_label': 'Intensité', 'breakdown1.context_loading': 'Préparation de l\'analyse contextuelle...', 'breakdown1.view_detailed_reading': 'Voir la Lecture Détaillée', 'breakdown1.master_modal_title': 'MAÎTRE NUMÉROLOGIQUE', 'breakdown1.master_modal_subtitle': 'Répond à tes questions karmiques', 'breakdown1.master_input_placeholder': 'Pose ta question sur ta dette karmique...',
        'breakdown2.header_label': 'Analyse Complète', 'breakdown2.karmic_bond_title': 'Lien Karmique', 'breakdown2.karmic_bond_loading': 'Lecture du lien karmique...', 'breakdown2.communication_title': 'Harmonie de Communication', 'breakdown2.comm_logic': 'Logique', 'breakdown2.comm_intuition': 'Intuition', 'breakdown2.comm_verbal': 'Verbal', 'breakdown2.comm_empathy': 'Empathie', 'breakdown2.communication_loading': 'Analyse de l\'harmonie de communication...', 'breakdown2.emotional_synergy_title': 'Synergie Émotionnelle', 'breakdown2.soul_urge_match_label': 'Correspondance du Désir de l\'Âme', 'breakdown2.emotional_loading': 'Calcul de l\'harmonie émotionnelle...', 'breakdown2.shared_destiny_title': 'Destin Partagé', 'breakdown2.shared_destiny_loading': 'Lecture du destin partagé...', 'breakdown2.download_pdf_btn': 'Télécharger en PDF',
        'breakdown3.header_title': 'Analyse Relationnelle', 'breakdown3.cosmic_resonance': 'Résonance Cosmique', 'breakdown3.karmic_title': 'Lien Relationnel Karmique', 'breakdown3.karmic_badge': 'Karma', 'breakdown3.karmic_analyze': 'ANALYSER', 'breakdown3.karmic_desc': 'Analyse du lien karmique et des traces de vies passées entre deux âmes.', 'breakdown3.ask_guide_btn': 'Demander au Guide Relationnel', 'breakdown3.soul_urge_title': 'Harmonie du Désir de l\'Âme', 'breakdown3.soul_urge_badge': 'Cœur', 'breakdown3.soul_urge_desc': 'L\'harmonie de vos désirs intérieurs et besoins émotionnels.', 'breakdown3.personality_title': 'Harmonie de Personnalité', 'breakdown3.personality_badge': 'Extérieur', 'breakdown3.personality_desc': 'Vos dynamiques sociales et votre reflet dans le monde extérieur.', 'breakdown3.life_path_title': 'Union des Chemins de Vie', 'breakdown3.life_path_badge': 'Destin', 'breakdown3.life_path_desc': 'Le point de convergence de vos chemins de destin et votre voyage partagé.', 'breakdown3.expression_title': 'Harmonie d\'Expression', 'breakdown3.expression_badge': 'Expression', 'breakdown3.expression_desc': 'L\'harmonie de vos énergies de nom et comment elles se complètent.', 'breakdown3.communication_title': 'Harmonie de Communication', 'breakdown3.communication_badge': 'Communication', 'breakdown3.communication_desc': 'Vos styles de communication et comment vous vous comprenez.', 'breakdown3.bond_quality_label': 'Qualité du Lien', 'breakdown3.growth_area_label': 'Domaine de Croissance', 'breakdown3.full_analysis_btn': 'Voir l\'Analyse Complète', 'breakdown3.guide_modal_title': 'GUIDE RELATIONNEL', 'breakdown3.guide_modal_subtitle': 'Répond à vos questions relationnelles', 'breakdown3.guide_input_placeholder': 'Pose ta question sur ta relation...', 'breakdown3.share_title': 'Partager la Carte Âme Sœur', 'breakdown3.share_cta': 'Partage cette carte avec tes proches', 'breakdown3.save_to_gallery': 'Enregistrer dans la Galerie', 'breakdown3.copy_link': 'Copier', 'breakdown3.other': 'Autre',
        'compat_form.header_title': 'Compatibilité Relationnelle', 'compat_form.headline': 'Découvre ton alignement cosmique', 'compat_form.subheadline': 'Entre les détails ci-dessous pour révéler le lien spirituel entre deux âmes.', 'compat_form.you_label': 'Toi', 'compat_form.main_account': 'Compte Principal', 'compat_form.your_name_label': 'Ton Nom', 'compat_form.profile_loading_placeholder': 'Chargement du profil...', 'compat_form.your_birthdate_label': 'Ta Date de Naissance', 'compat_form.partner_label': 'Partenaire', 'compat_form.partner_name_label': 'Nom du Partenaire', 'compat_form.partner_name_placeholder': 'Entre le nom complet', 'compat_form.partner_birthdate_label': 'Date de Naissance du Partenaire', 'compat_form.footer_note': 'Les calculs sont basés sur les principes numérologiques et alignements astrologiques.', 'compat_form.check_btn': 'Vérifier la Compatibilité',
        'compat_analysis.header_title': 'Analyse de Compatibilité', 'compat_analysis.harmony_label': 'Harmonie', 'compat_analysis.you_name': 'Toi', 'compat_analysis.life_path_label': 'Chemin de Vie', 'compat_analysis.personality_label': 'Personnalité', 'compat_analysis.soul_urge_label': 'Désir de l\'Âme', 'compat_analysis.expression_label': 'Expression', 'compat_analysis.cosmic_bond_title': 'Lien Cosmique', 'compat_analysis.cosmic_bond_loading': 'Calcul du lien cosmique...', 'compat_analysis.unlock_love_guide': 'Débloquer le Guide Amour Complet', 'compat_analysis.share_title': 'Partager la Carte Âme Sœur', 'compat_analysis.share_cta': 'Partage cette carte avec tes proches', 'compat_analysis.save_to_gallery': 'Enregistrer dans la Galerie', 'compat_analysis.copy_link': 'Copier', 'compat_analysis.other': 'Autre',
        'daily_guide.header_title': 'Guide Quotidien', 'daily_guide.title': 'Analyse Quotidienne', 'daily_guide.subtitle': 'Guidance numérique pour aujourd\'hui', 'daily_guide.share_btn': 'Partager', 'daily_guide.share_title': 'Partager l\'Analyse', 'daily_guide.share_badge': 'Analyse Quotidienne', 'daily_guide.share_desc': 'Partage ton analyse quotidienne', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'Enregistrer dans la Galerie', 'daily_guide.share_copy': 'Copier le Lien', 'daily_guide.share_other': 'Autre',
        'deep_dive.header_title': 'Plongée Quotidienne', 'deep_dive.day_title': 'Jour de l\'Intuition', 'deep_dive.vibration_badge': 'Vibration Spirituelle', 'deep_dive.focus_title': 'Se Concentrer Sur', 'deep_dive.avoid_title': 'Éviter', 'deep_dive.planetary_label': 'Alignement Planétaire', 'deep_dive.mantra_label': 'Mantra Quotidien', 'deep_dive.reminder_btn': 'Définir un Rappel Quotidien',
        'calendar.menu_title': 'Menu', 'calendar.menu_calendar': 'Calendrier', 'calendar.menu_planner': 'Planificateur', 'calendar.menu_ritual': 'Rituel', 'calendar.menu_daily_guide': 'Guide Quotidien', 'calendar.menu_profile': 'Profil', 'calendar.menu_settings': 'Paramètres', 'calendar.header_title': 'Calendrier de Décision', 'calendar.day_sun': 'Di', 'calendar.day_mon': 'Lu', 'calendar.day_tue': 'Ma', 'calendar.day_wed': 'Me', 'calendar.day_thu': 'Je', 'calendar.day_fri': 'Ve', 'calendar.day_sat': 'Sa', 'calendar.daily_analysis': 'Analyse Quotidienne', 'calendar.active_cycle': 'Cycle Actif', 'calendar.today_vibration': 'Vibration du Jour', 'calendar.supported_label': 'Soutenu', 'calendar.challenging_label': 'Difficile', 'calendar.timing_cta': 'Voir le Timing de Décision du Jour',
        'lunar.header_title': 'Énergie Lunaire', 'lunar.vibration_phase': 'Phase de Vibration', 'lunar.detailed_reading': 'Lecture Détaillée', 'lunar.guidance_title': 'Guidance Lunaire', 'lunar.crystal_wisdom': 'Sagesse Cristalline', 'lunar.end_reading': 'Fin de la Lecture Quotidienne',
        'messaging.not_connected_text': 'Tu dois être connecté pour envoyer des messages.', 'messaging.back_to_connections': 'Retour aux Connexions', 'messaging.no_messages': 'Pas encore de messages', 'messaging.input_placeholder': 'Écris un message...',
        'friendship.title': 'Dynamique d\'Amitié', 'friendship.bond_analysis': 'Analyse du Lien d\'Amitié', 'friendship.harmony': 'Harmonie', 'friendship.life_path': 'Chemin de Vie', 'friendship.soul_urge': 'Désir de l\'Âme', 'friendship.personality': 'Personnalité', 'friendship.expression': 'Expression', 'friendship.energy_title': 'Énergie d\'Amitié', 'friendship.energy_subtitle': 'L\'essence et la dynamique fondamentale de votre lien', 'friendship.communication_title': 'Dynamique de Communication', 'friendship.communication_subtitle': 'Comment vous vous comprenez', 'friendship.strengths_title': 'Forces Communes', 'friendship.strengths_subtitle': 'Où vous brillez ensemble', 'friendship.challenges_title': 'Points d\'Attention', 'friendship.challenges_subtitle': 'Zones de friction et d\'équilibre nécessaire', 'friendship.roadmap_title': 'Feuille de Route', 'friendship.roadmap_subtitle': 'Un guide pour renforcer cette amitié', 'friendship.numerology_comparison': 'Comparaison Numérologique', 'friendship.tbl_life_path': 'Chemin de Vie', 'friendship.tbl_expression': 'Expression', 'friendship.tbl_soul_urge': 'Désir de l\'Âme', 'friendship.tbl_personality': 'Personnalité', 'friendship.share_title': 'Partager la Carte d\'Amitié', 'friendship.share_subtitle': 'Partager l\'analyse d\'amitié', 'friendship.save_to_gallery': 'Enregistrer dans la Galerie', 'friendship.copy': 'Copier', 'friendship.other': 'Autre',
        'quiz.title': 'Quiz Numérologie', 'quiz.correct': 'Correct', 'quiz.win_streak': 'Série de Victoires', 'quiz.quick_quiz': 'Quiz Rapide', 'quiz.quick_quiz_desc': '10 questions \u00b7 Teste tes connaissances \u00b7 Gagne des XP', 'quiz.duel': 'Duel', 'quiz.duel_desc': '5 questions \u00b7 Contre un adversaire \u00b7 Récompense 2x XP', 'quiz.cosmic_league': 'Ligue Cosmique', 'quiz.cosmic_league_desc': 'Classement hebdomadaire \u00b7 Système de ligues \u00b7 Récompenses', 'quiz.your_badges': 'Tes Badges', 'quiz.question_label': 'Question', 'quiz.you': 'Toi', 'quiz.opponent': 'Adversaire', 'quiz.next': 'Suivant \u2192', 'quiz.menu': '\u2190 Menu', 'quiz.play_again': 'Rejouer',
        'wheel.title': 'Roue Numantic', 'wheel.main_title': 'Roue Numantic', 'wheel.subtitle': 'Découvre ton alignement cosmique', 'wheel.spin': 'TOURNER', 'wheel.not_spun_yet': 'Tu n\'as pas encore tourné...', 'wheel.daily_rewards': 'Récompenses Cosmiques du Jour', 'wheel.refreshes_daily': 'Se renouvelle une fois par jour', 'wheel.reward_1_day': '1 Jour Premium', 'wheel.chance_15': '15% de chance', 'wheel.reward_5_days': '5 Jours Premium', 'wheel.chance_5': '5% de chance', 'wheel.reward_10_days': '10 Jours Premium', 'wheel.chance_2': '2% de chance', 'wheel.stars_aligning': 'Les étoiles s\'alignent', 'wheel.premium_reward_won': 'Récompense Premium Gagnée !', 'wheel.claim_reward': 'RÉCLAMER',
        'leaderboard.title': 'Ligue Cosmique', 'leaderboard.weekly_rewards': 'Récompenses Hebdomadaires', 'leaderboard.prize_1_premium': '2 Jours Premium', 'leaderboard.prize_1_bonus': '+ Couronne du Champion', 'leaderboard.prize_2_premium': '1 Jour Premium', 'leaderboard.prize_2_bonus': '+ Couronne d\'Argent', 'leaderboard.prize_3_premium': 'Carte Rare', 'leaderboard.prize_3_bonus': '+ Couronne de Bronze', 'leaderboard.league_closing': 'Clôture de la Ligue :', 'leaderboard.weekly_ranking': 'Classement Hebdomadaire', 'leaderboard.top3_promotion': 'Top 3 = Promotion', 'leaderboard.bottom3_relegation': 'Derniers 3 = Relégation', 'leaderboard.promotion_info': 'En fin de semaine, les 3 premiers montent, les 3 derniers descendent.', 'leaderboard.quiz_cta': 'Faire le Quiz & Monter au Classement',
        'premium.header_title': 'Paiement', 'premium.plan_name': 'Numantic Premium', 'premium.trial_info': '3 premiers jours gratuits \u00b7 Annule quand tu veux', 'premium.secure_payment': 'Paiement Sécurisé', 'premium.payment_desc': 'En cliquant ci-dessous, la fenêtre de paiement sécurisé Paddle s\'ouvrira', 'premium.security_note': 'Paiement sécurisé Paddle \u00b7 TVA incluse automatiquement', 'premium.complete_payment': 'Finaliser le Paiement', 'premium.terms_text': 'En finalisant le paiement, tu acceptes les Conditions d\'Utilisation.', 'premium.skip_free': 'Continuer gratuitement pour l\'instant \u2192', 'premium.success_title': 'Premium Actif !', 'premium.success_desc': 'Félicitations ! Tu as maintenant un accès illimité à toutes les fonctionnalités.', 'premium.trial_started': 'Essai gratuit de 3 jours commencé', 'premium.explore_btn': 'Commencer l\'Exploration',
        'store.header_title': 'Numantic Premium', 'store.premium_active': 'Premium Actif', 'store.feature_ai': 'Analyse IA Illimitée', 'store.feature_friends': 'Amis & Compatibilité Illimités', 'store.feature_cosmic': 'Révélation Cosmic Match', 'store.feature_deep': 'Deep Insight Complet (3 pages)', 'store.feature_guide': 'Guide IA Quotidien & Calendrier Cosmique', 'store.hero_title': 'Libère toute la puissance de la Numérologie', 'store.hero_desc': 'Analyse IA illimitée, révélation Cosmic Match, rapports de compatibilité complets et bien plus.', 'store.monthly': 'Mensuel', 'store.save_badge': '37% D\'ÉCONOMIE', 'store.yearly': 'Annuel', 'store.go_premium': 'Passer Premium', 'store.cancel_info': 'Annule quand tu veux \u00b7 3 jours d\'essai gratuit', 'store.comparison_title': 'Gratuit vs Premium', 'store.feature_col': 'Fonctionnalité', 'store.perks_title': 'Avantages Premium', 'store.try_free': '3 Jours d\'Essai Gratuit',
        'kisi.personality_analysis': 'Analyse de Personnalité', 'kisi.deep_insight_desc': 'Pythagore \u00b7 Expression \u00b7 Désir de l\'Âme \u00b7 Chemin de Vie', 'kisi.friendship_dynamics': 'Dynamique d\'Amitié', 'kisi.friendship_desc': 'Harmonie entre vous \u00b7 Feuille de route \u00b7 Analyse', 'kisi.compatibility_analysis': 'Analyse de Compatibilité', 'kisi.compatibility_desc': 'Harmonie romantique \u00b7 Lien karmique \u00b7 Score âme sœur',
        'meaning.header_title': 'Significations Numérologiques', 'meaning.close': 'Fermer', 'meaning.core_vibrations': 'Vibrations Fondamentales 1-9', 'meaning.core_subtitle': 'Découvre l\'énergie fondamentale de chaque nombre', 'meaning.num1_title': 'Pionnier', 'meaning.num1_desc': 'Leadership, indépendance, débuts, ambition, détermination', 'meaning.num2_title': 'Pacificateur', 'meaning.num2_desc': 'Partenariat, dualité, diplomatie, intuition, équilibre', 'meaning.num3_title': 'Créatif', 'meaning.num3_desc': 'Expression, créativité, communication, optimisme', 'meaning.num4_title': 'Bâtisseur', 'meaning.num4_desc': 'Détermination, structure, diligence, praticité', 'meaning.num5_title': 'Aventurier', 'meaning.num5_desc': 'Liberté, changement, aventure, polyvalence', 'meaning.num6_title': 'Protecteur', 'meaning.num6_desc': 'Responsabilité, protection, soin, communauté, équilibre', 'meaning.num7_title': 'Chercheur', 'meaning.num7_desc': 'Connaissance, contemplation, spiritualité, analyse, compréhension', 'meaning.num8_title': 'Dirigeant', 'meaning.num8_desc': 'Pouvoir, abondance, finance, gestion, liberté matérielle', 'meaning.num9_title': 'Humanitaire', 'meaning.num9_desc': 'Altruisme, achèvement, compassion, idéalisme', 'meaning.get_full_chart': 'Obtenir ton Chart Complet',
        'vibration.header_title': 'Partager l\'Analyse', 'vibration.analysis_card': 'Carte d\'Analyse', 'vibration.life_path_number': 'Nombre du Chemin de Vie', 'vibration.archetype': 'Chercheur Spirituel Profond', 'vibration.archetype_traits': 'Sagesse \u00b7 Introspection \u00b7 Vérité', 'vibration.card_info': 'Cette carte est idéale pour les stories et mises à jour de statut.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'Enregistrer dans la Galerie', 'vibration.copy_link': 'Copier le Lien', 'vibration.other': 'Autre',
        'archive.header_title': 'Archives Sacrées', 'archive.eternal_record': 'Registre Éternel des Archives', 'archive.destiny_analysis': 'Analyse Complète du Destin', 'archive.life_path_label': 'Chemin de Vie', 'archive.soul_urge_label': 'Désir de l\'Âme', 'archive.destiny_label': 'Destin', 'archive.inscribed_date': 'Date d\'inscription', 'archive.closing_question': 'Comment cette sagesse a-t-elle façonné ton voyage ?',
        'onboarding.slide1_title_1': 'Cosmique', 'onboarding.slide1_title_2': 'Découvre ton But', 'onboarding.slide1_desc': 'Illumine ton voyage spirituel en découvrant les vibrations cachées dans ta date de naissance et ton nom.', 'onboarding.slide2_title_1': 'Trouve ton Âme Sœur', 'onboarding.slide2_title_2': 'Découvre de Nouveaux Liens Spirituels', 'onboarding.slide2_desc': 'Découvre les liens cosmiques dans l\'amour, l\'amitié et les relations professionnelles par l\'analyse de compatibilité numérologique.', 'onboarding.slide3_title_1': 'Quotidien', 'onboarding.slide3_title_2': 'Guide Cosmique', 'onboarding.slide3_desc': 'Prends les meilleures décisions chaque jour selon ton calendrier d\'énergie personnel.', 'onboarding.slide4_title_1': 'Envoie ton Intention', 'onboarding.slide4_title_2': 'à l\'Univers', 'onboarding.slide4_desc': 'Définis tes intentions dans le portail de manifestation, libère-les dans l\'énergie cosmique et manifeste avec la communauté.', 'onboarding.btn_continue': 'Continuer', 'onboarding.btn_start': 'Commencer', 'onboarding.btn_login': 'Connexion', 'onboarding.theme_light': 'Mode Clair', 'onboarding.theme_dark': 'Mode Sombre',
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'Lecture des étoiles', 'splash.msg_aligning': 'Le cosmos s\'aligne', 'splash.msg_channeling': 'Canalisation de ton énergie', 'splash.msg_awakening': 'Ton destin s\'éveille',
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'Guidance Céleste', 'branded_splash.loading_text': 'Synchronisation avec le cosmos...',
        'soulmate_loading.title': 'Synchronisation de vos âmes...', 'soulmate_loading.subtitle': 'Les chemins karmiques se touchent...', 'soulmate_loading.progress_label': 'Synthèse des Fréquences d\'Amour', 'soulmate_loading.engine_label': 'Moteur Âme Sœur v2.0', 'calc_loading.title': 'Calcul de vos vibrations...', 'calc_loading.subtitle': 'Consultation des étoiles et alignement des chemins cosmiques', 'calc_loading.msg_syncing': 'Synchronisation avec l\'univers', 'calc_loading.msg_calculating': 'Calcul de vos vibrations', 'calc_loading.msg_aligning': 'Alignement des chemins cosmiques', 'calc_loading.msg_reading': 'Lecture des nombres sacrés', 'calc_loading.msg_almost': 'Presque prêt...', 'calc_loading.engine_label': 'Moteur de Numérologie v2.0',
        'wheel_reward.header_title': 'Don du Destin', 'wheel_reward.title': 'Le Destin a Parlé', 'wheel_reward.subtitle': 'Un Cadeau Sacré est Apparu', 'wheel_reward.reward_title': '3 Cristaux Gratuits', 'wheel_reward.reward_subtitle': 'Analyse Profonde du Nom Débloquée', 'wheel_reward.reward_desc': 'Utilise-les pour débloquer ton horoscope quotidien et explorer ton chemin spirituel.', 'wheel_reward.btn_claim': 'Réclamer la Récompense', 'wheel_reward.btn_vault': 'Ajouter à mon coffre spirituel', 'wheel_reward.nav_home': 'Accueil', 'wheel_reward.nav_readings': 'Lectures', 'wheel_reward.nav_wheel': 'Roue', 'wheel_reward.nav_store': 'Boutique', 'wheel_reward.nav_profile': 'Profil',
        'manifest.cat_love': 'Amour', 'manifest.cat_money': 'Argent', 'manifest.cat_health': 'Santé', 'manifest.cat_career': 'Carrière', 'manifest.cat_spiritual': 'Âme', 'manifest.phase_full': 'Phase de Pleine Lune', 'manifest.energy_release': 'Énergie : Libération & Achèvement', 'manifest.title_release': 'Libère & Affranchis-toi', 'manifest.sub_release': 'Confie à la lumière argentée de la lune ce qui ne sert plus ton chemin le plus élevé.', 'manifest.placeholder_release': 'Que es-tu prêt à libérer dans l\'univers ?', 'manifest.hint_release': 'Lâche prise. Abandonne. Sois libre.', 'manifest.btn_release': 'Libérer dans l\'Univers', 'manifest.sent_release': 'Libéré dans l\'Univers', 'manifest.sent_sub_release': 'Ton intention est maintenant tissée dans le tissu cosmique', 'manifest.phase_new': 'Phase de Nouvelle Lune', 'manifest.energy_new': 'Énergie : Nouvelles Intentions', 'manifest.title_new': 'Nouvelles Intentions', 'manifest.sub_new': 'Plante tes désirs cosmiques dans l\'obscurité fertile du nouveau cycle.', 'manifest.placeholder_new': 'Quelles graines es-tu prêt à planter aujourd\'hui ?', 'manifest.hint_new': 'Plante la graine. Fais confiance au cosmos.', 'manifest.btn_new': 'Planter ma Graine', 'manifest.sent_new': 'Graine Plantée dans le Cosmos', 'manifest.sent_sub_new': 'Ton intention prend racine dans l\'obscurité fertile', 'manifest.energy_waning': 'Énergie : Décroissante & Libératrice', 'manifest.energy_waxing': 'Énergie : Croissante & Constructrice', 'manifest.title_cosmic': 'Portail Cosmique', 'manifest.sub_cosmic': 'Vibre à la fréquence de tes désirs.', 'manifest.placeholder_cosmic': 'Écris ton intention à l\'univers...', 'manifest.hint_cosmic': 'Sois spécifique. Ressens la vibration.', 'manifest.btn_cosmic': 'Envoyer à l\'Univers', 'manifest.sent_cosmic': 'Envoyé à l\'Univers', 'manifest.sent_sub_cosmic': 'Ton intention est maintenant énergie cosmique'
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

        'conn.title': 'Conexiones del Alma', 'conn.mark_all_read': 'Marcar todo como leído', 'conn.soul_connections': 'Conexiones del Alma',

        'match.optin_title': 'Match Cósmico', 'match.optin_subtitle': 'Comparte tu perfil numerológico con otros usuarios y descubre las almas gemelas que el universo ha elegido para ti.', 'match.optin_shared_title': '¿Qué se comparte?', 'match.optin_shared_desc': 'Solo tu nombre, camino de vida y números numerológicos', 'match.optin_privacy_title': 'Privacidad', 'match.optin_privacy_desc': 'Tu fecha de nacimiento y datos personales no se comparten', 'match.optin_toggle_title': 'Desactiva cuando quieras', 'match.optin_toggle_desc': 'Desactiva tu visibilidad desde los ajustes del perfil', 'match.select_city_label': 'Selecciona tu Ciudad', 'match.select_province': '\u2014 Seleccionar provincia \u2014', 'match.join_discovery_btn': 'Unirse al Descubrimiento', 'match.you_label': 'Tú', 'match.soul_harmony': 'Armonía del Alma', 'match.cosmic_bond': 'Vínculo Cósmico', 'match.reveal_profile': 'Revelar Perfil', 'match.no_credits_msg': 'Tus créditos de revelación de hoy se agotaron', 'match.credits_tomorrow': '5 nuevos créditos mañana', 'match.waiting_match': 'Esperando Match', 'match.empty_bond_desc': 'Los matches comenzarán cuando más usuarios se unan. ¡Tu vínculo cósmico surgirá pronto!', 'match.daily_matches_title': 'Matches Diarios', 'match.cosmic_map_title': 'Mapa Cósmico', 'match.city_btn': 'Ciudad', 'match.save_btn': 'Guardar', 'match.map_empty': 'Aún no hay almas en el mapa...', 'match.cosmic_analysis_title': 'Análisis Cósmico', 'match.harmony_analysis': 'Análisis de Armonía', 'match.past_matches_title': 'Matches Pasados', 'match.history_empty': 'Tu historial de matches aparecerá aquí', 'match.add_connection': 'Agregar Conexión',
        'connections.notifications': 'Notificaciones', 'connections.add': 'Agregar', 'connections.match_connections': 'Conexiones de Match', 'connections.recent_analyses': 'Análisis Recientes', 'connections.no_analyses': 'Aún no hay análisis.', 'connections.start_new_analysis': '+ Iniciar Nuevo Análisis', 'connections.new_analysis_btn': 'Iniciar Nuevo Análisis',
        'manifest_community.my_manifests_btn': 'Mis Manifiestos', 'manifest_community.sort_newest': 'Más Nuevos', 'manifest_community.sort_top_rated': 'Más Valorados', 'manifest_community.sort_weekly': 'Semanal', 'manifest_community.cat_all': 'Todos', 'manifest_community.cat_money': 'Dinero', 'manifest_community.cat_love': 'Amor', 'manifest_community.cat_health': 'Salud', 'manifest_community.cat_career': 'Carrera', 'manifest_community.cat_soul': 'Alma', 'manifest_community.info_title': 'Portal de Manifestación', 'manifest_community.info_desc': 'Descubre manifiestos de la comunidad, inspírate y envía tus intenciones al universo.', 'manifest_community.info_ok_btn': 'Entendido', 'manifest_community.my_manifests_title': 'Mis Manifiestos',
        'manifest_portal.header_title': 'Portal de Manifestación', 'manifest_portal.hero_title': 'Lienzo del Espacio', 'manifest_portal.hero_subtitle': 'Tus intenciones son las estrellas que iluminan tu universo personal.', 'manifest_portal.go_premium': 'Obtener Premium \u2192', 'manifest_portal.no_manifest_title': 'Aún no hay manifiestos', 'manifest_portal.no_manifest_desc': 'El universo espera tus intenciones. Comienza tu viaje poniendo tus deseos en palabras.', 'manifest_portal.write_manifest_btn': 'Escribir Manifiesto', 'manifest_portal.premium_title': 'Ventaja Premium', 'manifest_portal.premium_desc': 'Crea manifiestos ilimitados y amplifica tu flujo de energía cósmica con la membresía premium.', 'manifest_portal.view_benefits_btn': 'Ver Todos los Beneficios',
        'breakdown1.header_title': 'Análisis del Nombre', 'breakdown1.expression_label': 'Expresión', 'breakdown1.tap_to_calculate': 'Toca para ver el cálculo', 'breakdown1.soul_urge_title': 'Deseo del Alma', 'breakdown1.soul_urge_badge': 'Interior', 'breakdown1.soul_urge_desc': 'Un profundo buscador de verdad que anhela la comprensión espiritual.', 'breakdown1.personality_title': 'Personalidad', 'breakdown1.personality_badge': 'Exterior', 'breakdown1.personality_desc': 'Percibido como reservado, analítico y altamente competente.', 'breakdown1.life_path_title': 'Camino de Vida', 'breakdown1.life_path_badge': 'Destino', 'breakdown1.life_path_desc': 'El plano de tu destino guiando tu propósito y crecimiento.', 'breakdown1.karmic_bond_title': 'Vínculo Kármico', 'breakdown1.karmic_bond_badge': 'Deuda', 'breakdown1.karmic_bond_desc': 'Análisis de deudas kármicas y lecciones de vidas pasadas.', 'breakdown1.ask_master_btn': 'Preguntar al Maestro Numerológico', 'breakdown1.key_energy_label': 'Energía Clave', 'breakdown1.key_energy_value': 'Armonía', 'breakdown1.focus_label': 'Enfoque', 'breakdown1.focus_value': 'Mente', 'breakdown1.context_analysis_title': 'Análisis Contextual', 'breakdown1.context_analysis_desc': 'Interpretación combinada de tus números + contexto temporal', 'breakdown1.intensity_label': 'Intensidad', 'breakdown1.context_loading': 'Preparando análisis contextual...', 'breakdown1.view_detailed_reading': 'Ver Lectura Detallada', 'breakdown1.master_modal_title': 'MAESTRO NUMEROLÓGICO', 'breakdown1.master_modal_subtitle': 'Responde tus preguntas kármicas', 'breakdown1.master_input_placeholder': 'Pregunta sobre tu deuda kármica...',
        'breakdown2.header_label': 'Análisis Completo', 'breakdown2.karmic_bond_title': 'Vínculo Kármico', 'breakdown2.karmic_bond_loading': 'Leyendo vínculo kármico...', 'breakdown2.communication_title': 'Armonía de Comunicación', 'breakdown2.comm_logic': 'Lógica', 'breakdown2.comm_intuition': 'Intuición', 'breakdown2.comm_verbal': 'Verbal', 'breakdown2.comm_empathy': 'Empatía', 'breakdown2.communication_loading': 'Analizando armonía de comunicación...', 'breakdown2.emotional_synergy_title': 'Sinergia Emocional', 'breakdown2.soul_urge_match_label': 'Correspondencia del Deseo del Alma', 'breakdown2.emotional_loading': 'Calculando armonía emocional...', 'breakdown2.shared_destiny_title': 'Destino Compartido', 'breakdown2.shared_destiny_loading': 'Leyendo destino compartido...', 'breakdown2.download_pdf_btn': 'Descargar como PDF',
        'breakdown3.header_title': 'Análisis de Relación', 'breakdown3.cosmic_resonance': 'Resonancia Cósmica', 'breakdown3.karmic_title': 'Vínculo Kármico Relacional', 'breakdown3.karmic_badge': 'Karma', 'breakdown3.karmic_analyze': 'ANALIZAR', 'breakdown3.karmic_desc': 'Análisis del vínculo kármico y rastros de vidas pasadas entre dos almas.', 'breakdown3.ask_guide_btn': 'Preguntar al Guía de Relaciones', 'breakdown3.soul_urge_title': 'Armonía del Deseo del Alma', 'breakdown3.soul_urge_badge': 'Corazón', 'breakdown3.soul_urge_desc': 'La armonía de tus deseos internos y necesidades emocionales.', 'breakdown3.personality_title': 'Armonía de Personalidad', 'breakdown3.personality_badge': 'Exterior', 'breakdown3.personality_desc': 'Tus dinámicas sociales y cómo te reflejas al mundo exterior.', 'breakdown3.life_path_title': 'Unión del Camino de Vida', 'breakdown3.life_path_badge': 'Destino', 'breakdown3.life_path_desc': 'El punto de convergencia de tus caminos de destino y viaje compartido.', 'breakdown3.expression_title': 'Armonía de Expresión', 'breakdown3.expression_badge': 'Expresión', 'breakdown3.expression_desc': 'La armonía de tus energías de nombre y cómo se complementan.', 'breakdown3.communication_title': 'Armonía de Comunicación', 'breakdown3.communication_badge': 'Comunicación', 'breakdown3.communication_desc': 'Tus estilos de comunicación y cómo se entienden mutuamente.', 'breakdown3.bond_quality_label': 'Calidad del Vínculo', 'breakdown3.growth_area_label': 'Área de Crecimiento', 'breakdown3.full_analysis_btn': 'Ver Análisis Completo', 'breakdown3.guide_modal_title': 'GUÍA DE RELACIONES', 'breakdown3.guide_modal_subtitle': 'Responde tus preguntas sobre relaciones', 'breakdown3.guide_input_placeholder': 'Pregunta sobre tu relación...', 'breakdown3.share_title': 'Compartir Carta de Alma Gemela', 'breakdown3.share_cta': 'Comparte esta carta con tus seres queridos', 'breakdown3.save_to_gallery': 'Guardar en Galería', 'breakdown3.copy_link': 'Copiar', 'breakdown3.other': 'Otro',
        'compat_form.header_title': 'Compatibilidad de Relación', 'compat_form.headline': 'Descubre tu alineación cósmica', 'compat_form.subheadline': 'Ingresa los detalles para revelar el vínculo espiritual entre dos almas.', 'compat_form.you_label': 'Tú', 'compat_form.main_account': 'Cuenta Principal', 'compat_form.your_name_label': 'Tu Nombre', 'compat_form.profile_loading_placeholder': 'Cargando información del perfil...', 'compat_form.your_birthdate_label': 'Tu Fecha de Nacimiento', 'compat_form.partner_label': 'Pareja', 'compat_form.partner_name_label': 'Nombre de la Pareja', 'compat_form.partner_name_placeholder': 'Ingresa el nombre completo', 'compat_form.partner_birthdate_label': 'Fecha de Nacimiento de la Pareja', 'compat_form.footer_note': 'Los cálculos se basan en principios numerológicos y alineaciones astrológicas.', 'compat_form.check_btn': 'Verificar Compatibilidad',
        'compat_analysis.header_title': 'Análisis de Compatibilidad', 'compat_analysis.harmony_label': 'Armonía', 'compat_analysis.you_name': 'Tú', 'compat_analysis.life_path_label': 'Camino de Vida', 'compat_analysis.personality_label': 'Personalidad', 'compat_analysis.soul_urge_label': 'Deseo del Alma', 'compat_analysis.expression_label': 'Expresión', 'compat_analysis.cosmic_bond_title': 'Vínculo Cósmico', 'compat_analysis.cosmic_bond_loading': 'Calculando vínculo cósmico...', 'compat_analysis.unlock_love_guide': 'Desbloquear Guía de Amor Completa', 'compat_analysis.share_title': 'Compartir Carta de Alma Gemela', 'compat_analysis.share_cta': 'Comparte esta carta con tus seres queridos', 'compat_analysis.save_to_gallery': 'Guardar en Galería', 'compat_analysis.copy_link': 'Copiar', 'compat_analysis.other': 'Otro',
        'daily_guide.header_title': 'Guía Diaria', 'daily_guide.title': 'Análisis Diario', 'daily_guide.subtitle': 'Guía numérica para hoy', 'daily_guide.share_btn': 'Compartir', 'daily_guide.share_title': 'Compartir Análisis', 'daily_guide.share_badge': 'Análisis Diario', 'daily_guide.share_desc': 'Comparte tu análisis diario', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'Guardar en Galería', 'daily_guide.share_copy': 'Copiar Enlace', 'daily_guide.share_other': 'Otro',
        'deep_dive.header_title': 'Inmersión Diaria', 'deep_dive.day_title': 'Día de la Intuición', 'deep_dive.vibration_badge': 'Vibración Espiritual', 'deep_dive.focus_title': 'Enfocarse En', 'deep_dive.avoid_title': 'Evitar', 'deep_dive.planetary_label': 'Alineación Planetaria', 'deep_dive.mantra_label': 'Mantra Diario', 'deep_dive.reminder_btn': 'Establecer Recordatorio Diario',
        'calendar.menu_title': 'Menú', 'calendar.menu_calendar': 'Calendario', 'calendar.menu_planner': 'Planificador', 'calendar.menu_ritual': 'Ritual', 'calendar.menu_daily_guide': 'Guía Diaria', 'calendar.menu_profile': 'Perfil', 'calendar.menu_settings': 'Ajustes', 'calendar.header_title': 'Calendario de Decisiones', 'calendar.day_sun': 'Do', 'calendar.day_mon': 'Lu', 'calendar.day_tue': 'Ma', 'calendar.day_wed': 'Mi', 'calendar.day_thu': 'Ju', 'calendar.day_fri': 'Vi', 'calendar.day_sat': 'Sá', 'calendar.daily_analysis': 'Análisis Diario', 'calendar.active_cycle': 'Ciclo Activo', 'calendar.today_vibration': 'Vibración de Hoy', 'calendar.supported_label': 'Apoyado', 'calendar.challenging_label': 'Desafiante', 'calendar.timing_cta': 'Ver el Momento de Decisión de Hoy',
        'lunar.header_title': 'Energía Lunar', 'lunar.vibration_phase': 'Fase de Vibración', 'lunar.detailed_reading': 'Lectura Detallada', 'lunar.guidance_title': 'Guía Lunar', 'lunar.crystal_wisdom': 'Sabiduría Cristalina', 'lunar.end_reading': 'Fin de la Lectura Diaria',
        'messaging.not_connected_text': 'Necesitas conectarte para enviar mensajes.', 'messaging.back_to_connections': 'Volver a Conexiones', 'messaging.no_messages': 'Aún no hay mensajes', 'messaging.input_placeholder': 'Escribe un mensaje...',
        'friendship.title': 'Dinámica de Amistad', 'friendship.bond_analysis': 'Análisis del Vínculo de Amistad', 'friendship.harmony': 'Armonía', 'friendship.life_path': 'Camino de Vida', 'friendship.soul_urge': 'Deseo del Alma', 'friendship.personality': 'Personalidad', 'friendship.expression': 'Expresión', 'friendship.energy_title': 'Energía de Amistad', 'friendship.energy_subtitle': 'La esencia y dinámica fundamental de tu vínculo', 'friendship.communication_title': 'Dinámica de Comunicación', 'friendship.communication_subtitle': 'Cómo se entienden mutuamente', 'friendship.strengths_title': 'Fortalezas Compartidas', 'friendship.strengths_subtitle': 'Donde brillan juntos', 'friendship.challenges_title': 'Puntos de Atención', 'friendship.challenges_subtitle': 'Áreas de fricción y equilibrio necesario', 'friendship.roadmap_title': 'Hoja de Ruta', 'friendship.roadmap_subtitle': 'Una guía para fortalecer esta amistad', 'friendship.numerology_comparison': 'Comparación Numerológica', 'friendship.tbl_life_path': 'Camino de Vida', 'friendship.tbl_expression': 'Expresión', 'friendship.tbl_soul_urge': 'Deseo del Alma', 'friendship.tbl_personality': 'Personalidad', 'friendship.share_title': 'Compartir Carta de Amistad', 'friendship.share_subtitle': 'Compartir análisis de amistad', 'friendship.save_to_gallery': 'Guardar en Galería', 'friendship.copy': 'Copiar', 'friendship.other': 'Otro',
        'quiz.title': 'Quiz de Numerología', 'quiz.correct': 'Correcto', 'quiz.win_streak': 'Racha de Victorias', 'quiz.quick_quiz': 'Quiz Rápido', 'quiz.quick_quiz_desc': '10 preguntas \u00b7 Pon a prueba tu conocimiento \u00b7 Gana XP', 'quiz.duel': 'Duelo', 'quiz.duel_desc': '5 preguntas \u00b7 Contra oponente \u00b7 Recompensa 2x XP', 'quiz.cosmic_league': 'Liga Cósmica', 'quiz.cosmic_league_desc': 'Ranking semanal \u00b7 Sistema de ligas \u00b7 Recompensas', 'quiz.your_badges': 'Tus Insignias', 'quiz.question_label': 'Pregunta', 'quiz.you': 'Tú', 'quiz.opponent': 'Oponente', 'quiz.next': 'Siguiente \u2192', 'quiz.menu': '\u2190 Menú', 'quiz.play_again': 'Jugar de Nuevo',
        'wheel.title': 'Rueda Numantic', 'wheel.main_title': 'Rueda Numantic', 'wheel.subtitle': 'Descubre tu alineación cósmica', 'wheel.spin': 'GIRAR', 'wheel.not_spun_yet': 'Aún no has girado...', 'wheel.daily_rewards': 'Recompensas Cósmicas del Día', 'wheel.refreshes_daily': 'Se renueva una vez al día', 'wheel.reward_1_day': '1 Día Premium', 'wheel.chance_15': '15% de probabilidad', 'wheel.reward_5_days': '5 Días Premium', 'wheel.chance_5': '5% de probabilidad', 'wheel.reward_10_days': '10 Días Premium', 'wheel.chance_2': '2% de probabilidad', 'wheel.stars_aligning': 'Las estrellas se alinean', 'wheel.premium_reward_won': '¡Recompensa Premium Ganada!', 'wheel.claim_reward': 'RECLAMAR RECOMPENSA',
        'leaderboard.title': 'Liga Cósmica', 'leaderboard.weekly_rewards': 'Recompensas Semanales', 'leaderboard.prize_1_premium': '2 Días Premium', 'leaderboard.prize_1_bonus': '+ Corona de Campeón', 'leaderboard.prize_2_premium': '1 Día Premium', 'leaderboard.prize_2_bonus': '+ Corona de Plata', 'leaderboard.prize_3_premium': 'Carta Rara', 'leaderboard.prize_3_bonus': '+ Corona de Bronce', 'leaderboard.league_closing': 'Cierre de Liga:', 'leaderboard.weekly_ranking': 'Ranking Semanal', 'leaderboard.top3_promotion': 'Top 3 = Ascenso', 'leaderboard.bottom3_relegation': 'Últimos 3 = Descenso', 'leaderboard.promotion_info': 'Al final de la semana, los 3 primeros ascienden y los 3 últimos descienden.', 'leaderboard.quiz_cta': 'Hacer Quiz & Subir en el Ranking',
        'premium.header_title': 'Pago', 'premium.plan_name': 'Numantic Premium', 'premium.trial_info': 'Primeros 3 días gratis \u00b7 Cancela cuando quieras', 'premium.secure_payment': 'Pago Seguro', 'premium.payment_desc': 'Al presionar abajo se abrirá la ventana de pago seguro de Paddle', 'premium.security_note': 'Pago seguro Paddle \u00b7 IVA incluido automáticamente', 'premium.complete_payment': 'Completar Pago', 'premium.terms_text': 'Al completar el pago aceptas los Términos de Servicio.', 'premium.skip_free': 'Continuar gratis por ahora \u2192', 'premium.success_title': '¡Premium Activo!', 'premium.success_desc': '¡Felicidades! Ahora tienes acceso ilimitado a todas las funciones.', 'premium.trial_started': 'Prueba gratuita de 3 días iniciada', 'premium.explore_btn': 'Empezar a Explorar',
        'store.header_title': 'Numantic Premium', 'store.premium_active': 'Premium Activo', 'store.feature_ai': 'Análisis IA Ilimitado', 'store.feature_friends': 'Amigos & Compatibilidad Ilimitados', 'store.feature_cosmic': 'Revelación Cosmic Match', 'store.feature_deep': 'Deep Insight Completo (3 páginas)', 'store.feature_guide': 'Guía IA Diaria & Calendario Cósmico', 'store.hero_title': 'Desbloquea todo el Poder de la Numerología', 'store.hero_desc': 'Análisis IA ilimitado, revelación Cosmic Match, informes de compatibilidad completos y mucho más.', 'store.monthly': 'Mensual', 'store.save_badge': '37% AHORRO', 'store.yearly': 'Anual', 'store.go_premium': 'Obtener Premium', 'store.cancel_info': 'Cancela cuando quieras \u00b7 3 días de prueba gratis', 'store.comparison_title': 'Gratis vs Premium', 'store.feature_col': 'Función', 'store.perks_title': 'Ventajas Premium', 'store.try_free': '3 Días de Prueba Gratis',
        'kisi.personality_analysis': 'Análisis de Personalidad', 'kisi.deep_insight_desc': 'Pitágoras \u00b7 Expresión \u00b7 Deseo del Alma \u00b7 Camino de Vida', 'kisi.friendship_dynamics': 'Dinámica de Amistad', 'kisi.friendship_desc': 'Armonía entre ustedes \u00b7 Hoja de ruta \u00b7 Análisis', 'kisi.compatibility_analysis': 'Análisis de Compatibilidad', 'kisi.compatibility_desc': 'Armonía romántica \u00b7 Vínculo kármico \u00b7 Puntuación alma gemela',
        'meaning.header_title': 'Significados Numerológicos', 'meaning.close': 'Cerrar', 'meaning.core_vibrations': 'Vibraciones Fundamentales 1-9', 'meaning.core_subtitle': 'Descubre la energía fundamental de cada número', 'meaning.num1_title': 'Pionero', 'meaning.num1_desc': 'Liderazgo, independencia, comienzos, ambición, determinación', 'meaning.num2_title': 'Pacificador', 'meaning.num2_desc': 'Asociación, dualidad, diplomacia, intuición, equilibrio', 'meaning.num3_title': 'Creativo', 'meaning.num3_desc': 'Expresión, creatividad, comunicación, optimismo', 'meaning.num4_title': 'Constructor', 'meaning.num4_desc': 'Determinación, estructura, diligencia, practicidad', 'meaning.num5_title': 'Aventurero', 'meaning.num5_desc': 'Libertad, cambio, aventura, versatilidad', 'meaning.num6_title': 'Guardián', 'meaning.num6_desc': 'Responsabilidad, protección, cuidado, comunidad, equilibrio', 'meaning.num7_title': 'Buscador', 'meaning.num7_desc': 'Conocimiento, contemplación, espiritualidad, análisis, comprensión', 'meaning.num8_title': 'Ejecutivo', 'meaning.num8_desc': 'Poder, abundancia, finanzas, gestión, libertad material', 'meaning.num9_title': 'Humanitario', 'meaning.num9_desc': 'Altruismo, culminación, compasión, idealismo', 'meaning.get_full_chart': 'Obtener tu Carta Completa',
        'vibration.header_title': 'Compartir Análisis', 'vibration.analysis_card': 'Carta de Análisis', 'vibration.life_path_number': 'Número del Camino de Vida', 'vibration.archetype': 'Buscador Espiritual Profundo', 'vibration.archetype_traits': 'Sabiduría \u00b7 Introspección \u00b7 Verdad', 'vibration.card_info': 'Esta carta es ideal para historias y actualizaciones de estado.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'Guardar en Galería', 'vibration.copy_link': 'Copiar Enlace', 'vibration.other': 'Otro',
        'archive.header_title': 'Archivo Sagrado', 'archive.eternal_record': 'Registro Eterno del Archivo', 'archive.destiny_analysis': 'Análisis Completo del Destino', 'archive.life_path_label': 'Camino de Vida', 'archive.soul_urge_label': 'Deseo del Alma', 'archive.destiny_label': 'Destino', 'archive.inscribed_date': 'Fecha de inscripción', 'archive.closing_question': '¿Cómo esta sabiduría ha moldeado tu viaje?',
        'onboarding.slide1_title_1': 'Cósmico', 'onboarding.slide1_title_2': 'Descubre tu Propósito', 'onboarding.slide1_desc': 'Ilumina tu viaje espiritual descubriendo las vibraciones ocultas en tu fecha de nacimiento y nombre.', 'onboarding.slide2_title_1': 'Encuentra tu Alma Gemela', 'onboarding.slide2_title_2': 'Descubre Nuevos Vínculos Espirituales', 'onboarding.slide2_desc': 'Descubre vínculos cósmicos en amor, amistad y relaciones laborales mediante análisis de compatibilidad numerológica.', 'onboarding.slide3_title_1': 'Diario', 'onboarding.slide3_title_2': 'Guía Cósmica', 'onboarding.slide3_desc': 'Toma las mejores decisiones cada día según tu calendario de energía personal.', 'onboarding.slide4_title_1': 'Envía tu Intención', 'onboarding.slide4_title_2': 'al Universo', 'onboarding.slide4_desc': 'Define tus intenciones en el portal de manifestación, libéralas en la energía cósmica y manifiesta junto con la comunidad.', 'onboarding.btn_continue': 'Continuar', 'onboarding.btn_start': 'Empezar', 'onboarding.btn_login': 'Iniciar sesión', 'onboarding.theme_light': 'Modo Claro', 'onboarding.theme_dark': 'Modo Oscuro',
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'Leyendo las estrellas', 'splash.msg_aligning': 'El cosmos se alinea', 'splash.msg_channeling': 'Canalizando tu energía', 'splash.msg_awakening': 'Tu destino está despertando',
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'Guía Celestial', 'branded_splash.loading_text': 'Sincronizando con el cosmos...',
        'soulmate_loading.title': 'Sincronizando vuestras almas...', 'soulmate_loading.subtitle': 'Los caminos kármicos se tocan...', 'soulmate_loading.progress_label': 'Sintetizando Frecuencias de Amor', 'soulmate_loading.engine_label': 'Motor Alma Gemela v2.0', 'calc_loading.title': 'Calculando tus vibraciones...', 'calc_loading.subtitle': 'Consultando las estrellas y alineando caminos cósmicos', 'calc_loading.msg_syncing': 'Sincronizando con el universo', 'calc_loading.msg_calculating': 'Calculando tus vibraciones', 'calc_loading.msg_aligning': 'Alineando caminos cósmicos', 'calc_loading.msg_reading': 'Leyendo números sagrados', 'calc_loading.msg_almost': 'Casi listo...', 'calc_loading.engine_label': 'Motor de Numerología v2.0',
        'wheel_reward.header_title': 'Regalo del Destino', 'wheel_reward.title': 'El Destino Ha Hablado', 'wheel_reward.subtitle': 'Un Regalo Sagrado Ha Surgido', 'wheel_reward.reward_title': '3 Cristales Gratis', 'wheel_reward.reward_subtitle': 'Análisis Profundo del Nombre Desbloqueado', 'wheel_reward.reward_desc': 'Úsalos para desbloquear tu horóscopo diario y explorar tu camino espiritual.', 'wheel_reward.btn_claim': 'Reclamar Recompensa', 'wheel_reward.btn_vault': 'Agregar a mi bóveda espiritual', 'wheel_reward.nav_home': 'Inicio', 'wheel_reward.nav_readings': 'Lecturas', 'wheel_reward.nav_wheel': 'Rueda', 'wheel_reward.nav_store': 'Tienda', 'wheel_reward.nav_profile': 'Perfil',
        'manifest.cat_love': 'Amor', 'manifest.cat_money': 'Dinero', 'manifest.cat_health': 'Salud', 'manifest.cat_career': 'Carrera', 'manifest.cat_spiritual': 'Alma', 'manifest.phase_full': 'Fase de Luna Llena', 'manifest.energy_release': 'Energía: Liberación & Culminación', 'manifest.title_release': 'Libera & Suelta', 'manifest.sub_release': 'Entrega a la luz plateada de la luna lo que ya no sirve a tu camino más elevado.', 'manifest.placeholder_release': '¿Qué estás listo para liberar al universo?', 'manifest.hint_release': 'Suelta. Entrega. Sé libre.', 'manifest.btn_release': 'Liberar al Universo', 'manifest.sent_release': 'Liberado al Universo', 'manifest.sent_sub_release': 'Tu intención está siendo tejida en el tejido cósmico', 'manifest.phase_new': 'Fase de Luna Nueva', 'manifest.energy_new': 'Energía: Nuevas Intenciones', 'manifest.title_new': 'Nuevas Intenciones', 'manifest.sub_new': 'Planta tus deseos cósmicos en la oscuridad fértil del nuevo ciclo.', 'manifest.placeholder_new': '¿Qué semillas estás listo para plantar hoy?', 'manifest.hint_new': 'Planta la semilla. Confía en el cosmos.', 'manifest.btn_new': 'Plantar mi Semilla', 'manifest.sent_new': 'Semilla Plantada en el Cosmos', 'manifest.sent_sub_new': 'Tu intención está echando raíces en la oscuridad fértil', 'manifest.energy_waning': 'Energía: Menguante & Liberadora', 'manifest.energy_waxing': 'Energía: Creciente & Constructora', 'manifest.title_cosmic': 'Portal Cósmico', 'manifest.sub_cosmic': 'Vibra en la frecuencia de tus deseos.', 'manifest.placeholder_cosmic': 'Escribe tu intención al universo...', 'manifest.hint_cosmic': 'Sé específico. Siente la vibración.', 'manifest.btn_cosmic': 'Enviar al Universo', 'manifest.sent_cosmic': 'Enviado al Universo', 'manifest.sent_sub_cosmic': 'Tu intención es ahora energía cósmica'
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

        'conn.title': 'روابط الروح', 'conn.mark_all_read': 'تحديد الكل كمقروء', 'conn.soul_connections': 'روابط الروح',

        'match.optin_title': 'التطابق الكوني', 'match.optin_subtitle': 'شارك ملفك العددي مع مستخدمين آخرين واكتشف توائم الروح التي اختارها الكون لك.', 'match.optin_shared_title': 'ما الذي يتم مشاركته؟', 'match.optin_shared_desc': 'فقط اسمك ومسار حياتك وأرقامك العددية', 'match.optin_privacy_title': 'الخصوصية', 'match.optin_privacy_desc': 'تاريخ ميلادك وبياناتك الشخصية لا تتم مشاركتها', 'match.optin_toggle_title': 'أوقفه في أي وقت', 'match.optin_toggle_desc': 'عطّل إمكانية اكتشافك من إعدادات الملف الشخصي', 'match.select_city_label': 'اختر مدينتك', 'match.select_province': '\u2014 اختر المحافظة \u2014', 'match.join_discovery_btn': 'انضم للاكتشاف', 'match.you_label': 'أنت', 'match.soul_harmony': 'انسجام الروح', 'match.cosmic_bond': 'الرابطة الكونية', 'match.reveal_profile': 'كشف الملف', 'match.no_credits_msg': 'نفدت أرصدة الكشف لهذا اليوم', 'match.credits_tomorrow': '5 أرصدة جديدة غداً', 'match.waiting_match': 'بانتظار التطابق', 'match.empty_bond_desc': 'ستبدأ التطابقات عند انضمام مزيد من المستخدمين. رابطتك الكونية ستظهر قريباً!', 'match.daily_matches_title': 'التطابقات اليومية', 'match.cosmic_map_title': 'الخريطة الكونية', 'match.city_btn': 'المدينة', 'match.save_btn': 'حفظ', 'match.map_empty': 'لا توجد أرواح على الخريطة بعد...', 'match.cosmic_analysis_title': 'التحليل الكوني', 'match.harmony_analysis': 'تحليل الانسجام', 'match.past_matches_title': 'التطابقات السابقة', 'match.history_empty': 'سجل تطابقاتك سيظهر هنا', 'match.add_connection': 'إضافة اتصال',
        'connections.notifications': 'الإشعارات', 'connections.add': 'إضافة', 'connections.match_connections': 'اتصالات التطابق', 'connections.recent_analyses': 'التحليلات الأخيرة', 'connections.no_analyses': 'لا توجد تحليلات بعد.', 'connections.start_new_analysis': '+ بدء تحليل جديد', 'connections.new_analysis_btn': 'بدء تحليل جديد',
        'manifest_community.my_manifests_btn': 'نواياي', 'manifest_community.sort_newest': 'الأحدث', 'manifest_community.sort_top_rated': 'الأعلى تقييماً', 'manifest_community.sort_weekly': 'أسبوعي', 'manifest_community.cat_all': 'الكل', 'manifest_community.cat_money': 'المال', 'manifest_community.cat_love': 'الحب', 'manifest_community.cat_health': 'الصحة', 'manifest_community.cat_career': 'المهنة', 'manifest_community.cat_soul': 'الروح', 'manifest_community.info_title': 'بوابة التجلي', 'manifest_community.info_desc': 'اكتشف نوايا المجتمع واستلهم وأرسل نواياك إلى الكون.', 'manifest_community.info_ok_btn': 'فهمت', 'manifest_community.my_manifests_title': 'نواياي',
        'manifest_portal.header_title': 'بوابة التجلي', 'manifest_portal.hero_title': 'لوحة الفضاء', 'manifest_portal.hero_subtitle': 'نواياك هي النجوم التي تضيء عالمك الشخصي.', 'manifest_portal.go_premium': 'الترقية لبريميوم \u2192', 'manifest_portal.no_manifest_title': 'لا توجد نوايا بعد', 'manifest_portal.no_manifest_desc': 'الكون ينتظر نواياك. ابدأ رحلتك بصياغة رغباتك بالكلمات.', 'manifest_portal.write_manifest_btn': 'اكتب نية', 'manifest_portal.premium_title': 'ميزة بريميوم', 'manifest_portal.premium_desc': 'أنشئ نوايا غير محدودة وعزز تدفق طاقتك الكونية مع العضوية المميزة.', 'manifest_portal.view_benefits_btn': 'عرض جميع المزايا',
        'breakdown1.header_title': 'تحليل الاسم', 'breakdown1.expression_label': 'التعبير', 'breakdown1.tap_to_calculate': 'اضغط لرؤية الحساب', 'breakdown1.soul_urge_title': 'دافع الروح', 'breakdown1.soul_urge_badge': 'داخلي', 'breakdown1.soul_urge_desc': 'باحث عميق عن الحقيقة يتوق للفهم الروحي.', 'breakdown1.personality_title': 'الشخصية', 'breakdown1.personality_badge': 'خارجي', 'breakdown1.personality_desc': 'يُنظر إليه على أنه متحفظ وتحليلي وعالي الكفاءة.', 'breakdown1.life_path_title': 'مسار الحياة', 'breakdown1.life_path_badge': 'القدر', 'breakdown1.life_path_desc': 'مخطط قدرك الذي يوجه غايتك ونموك النهائي.', 'breakdown1.karmic_bond_title': 'الرابطة الكارمية', 'breakdown1.karmic_bond_badge': 'دين', 'breakdown1.karmic_bond_desc': 'تحليل الديون الكارمية والدروس من الحيوات السابقة.', 'breakdown1.ask_master_btn': 'اسأل معلم الأعداد', 'breakdown1.key_energy_label': 'الطاقة الرئيسية', 'breakdown1.key_energy_value': 'الانسجام', 'breakdown1.focus_label': 'التركيز', 'breakdown1.focus_value': 'العقل', 'breakdown1.context_analysis_title': 'التحليل السياقي', 'breakdown1.context_analysis_desc': 'تفسير مشترك لأرقامك + السياق الزمني', 'breakdown1.intensity_label': 'الشدة', 'breakdown1.context_loading': 'جاري تحضير التحليل السياقي...', 'breakdown1.view_detailed_reading': 'عرض القراءة المفصلة', 'breakdown1.master_modal_title': 'معلم علم الأعداد', 'breakdown1.master_modal_subtitle': 'يجيب على أسئلتك الكارمية', 'breakdown1.master_input_placeholder': 'اسأل عن ديونك الكارمية...',
        'breakdown2.header_label': 'التحليل الكامل', 'breakdown2.karmic_bond_title': 'الرابطة الكارمية', 'breakdown2.karmic_bond_loading': 'جاري قراءة الرابطة الكارمية...', 'breakdown2.communication_title': 'انسجام التواصل', 'breakdown2.comm_logic': 'المنطق', 'breakdown2.comm_intuition': 'الحدس', 'breakdown2.comm_verbal': 'اللفظي', 'breakdown2.comm_empathy': 'التعاطف', 'breakdown2.communication_loading': 'جاري تحليل انسجام التواصل...', 'breakdown2.emotional_synergy_title': 'التآزر العاطفي', 'breakdown2.soul_urge_match_label': 'تطابق دافع الروح', 'breakdown2.emotional_loading': 'جاري حساب الانسجام العاطفي...', 'breakdown2.shared_destiny_title': 'القدر المشترك', 'breakdown2.shared_destiny_loading': 'جاري قراءة القدر المشترك...', 'breakdown2.download_pdf_btn': 'تحميل كـ PDF',
        'breakdown3.header_title': 'تحليل العلاقة', 'breakdown3.cosmic_resonance': 'الرنين الكوني', 'breakdown3.karmic_title': 'الرابطة الكارمية العلائقية', 'breakdown3.karmic_badge': 'كارما', 'breakdown3.karmic_analyze': 'تحليل', 'breakdown3.karmic_desc': 'تحليل الرابطة الكارمية وآثار الحيوات السابقة بين روحين.', 'breakdown3.ask_guide_btn': 'اسأل مرشد العلاقات', 'breakdown3.soul_urge_title': 'انسجام دافع الروح', 'breakdown3.soul_urge_badge': 'القلب', 'breakdown3.soul_urge_desc': 'انسجام رغباتكم الداخلية واحتياجاتكم العاطفية.', 'breakdown3.personality_title': 'انسجام الشخصية', 'breakdown3.personality_badge': 'خارجي', 'breakdown3.personality_desc': 'ديناميكياتكم الاجتماعية وانعكاسكم على العالم الخارجي.', 'breakdown3.life_path_title': 'اتحاد مسار الحياة', 'breakdown3.life_path_badge': 'القدر', 'breakdown3.life_path_desc': 'نقطة تقاطع مساري قدركم ورحلتكم المشتركة.', 'breakdown3.expression_title': 'انسجام التعبير', 'breakdown3.expression_badge': 'التعبير', 'breakdown3.expression_desc': 'انسجام طاقات أسمائكم وكيف تكمل بعضها.', 'breakdown3.communication_title': 'انسجام التواصل', 'breakdown3.communication_badge': 'التواصل', 'breakdown3.communication_desc': 'أساليب تواصلكم وكيف تفهمون بعضكم.', 'breakdown3.bond_quality_label': 'جودة الرابطة', 'breakdown3.growth_area_label': 'مجال النمو', 'breakdown3.full_analysis_btn': 'عرض التحليل الكامل', 'breakdown3.guide_modal_title': 'مرشد العلاقات', 'breakdown3.guide_modal_subtitle': 'يجيب على أسئلة علاقتكم', 'breakdown3.guide_input_placeholder': 'اسأل عن علاقتك...', 'breakdown3.share_title': 'مشاركة بطاقة توأم الروح', 'breakdown3.share_cta': 'شارك هذه البطاقة مع أحبائك', 'breakdown3.save_to_gallery': 'حفظ في المعرض', 'breakdown3.copy_link': 'نسخ', 'breakdown3.other': 'أخرى',
        'compat_form.header_title': 'توافق العلاقة', 'compat_form.headline': 'اكتشف محاذاتك الكونية', 'compat_form.subheadline': 'أدخل التفاصيل أدناه للكشف عن الرابطة الروحية بين روحين.', 'compat_form.you_label': 'أنت', 'compat_form.main_account': 'الحساب الرئيسي', 'compat_form.your_name_label': 'اسمك', 'compat_form.profile_loading_placeholder': 'جاري تحميل معلومات الملف...', 'compat_form.your_birthdate_label': 'تاريخ ميلادك', 'compat_form.partner_label': 'الشريك', 'compat_form.partner_name_label': 'اسم الشريك', 'compat_form.partner_name_placeholder': 'أدخل الاسم الكامل', 'compat_form.partner_birthdate_label': 'تاريخ ميلاد الشريك', 'compat_form.footer_note': 'الحسابات مبنية على مبادئ علم الأعداد والمحاذاة الفلكية.', 'compat_form.check_btn': 'فحص التوافق',
        'compat_analysis.header_title': 'تحليل التوافق', 'compat_analysis.harmony_label': 'الانسجام', 'compat_analysis.you_name': 'أنت', 'compat_analysis.life_path_label': 'مسار الحياة', 'compat_analysis.personality_label': 'الشخصية', 'compat_analysis.soul_urge_label': 'دافع الروح', 'compat_analysis.expression_label': 'التعبير', 'compat_analysis.cosmic_bond_title': 'الرابطة الكونية', 'compat_analysis.cosmic_bond_loading': 'جاري حساب الرابطة الكونية...', 'compat_analysis.unlock_love_guide': 'فتح دليل الحب الكامل', 'compat_analysis.share_title': 'مشاركة بطاقة توأم الروح', 'compat_analysis.share_cta': 'شارك هذه البطاقة مع أحبائك', 'compat_analysis.save_to_gallery': 'حفظ في المعرض', 'compat_analysis.copy_link': 'نسخ', 'compat_analysis.other': 'أخرى',
        'daily_guide.header_title': 'الدليل اليومي', 'daily_guide.title': 'التحليل اليومي', 'daily_guide.subtitle': 'إرشاد عددي لهذا اليوم', 'daily_guide.share_btn': 'مشاركة', 'daily_guide.share_title': 'مشاركة التحليل', 'daily_guide.share_badge': 'التحليل اليومي', 'daily_guide.share_desc': 'شارك تحليلك اليومي', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'حفظ في المعرض', 'daily_guide.share_copy': 'نسخ الرابط', 'daily_guide.share_other': 'أخرى',
        'deep_dive.header_title': 'الغوص اليومي', 'deep_dive.day_title': 'يوم الحدس', 'deep_dive.vibration_badge': 'الذبذبة الروحية', 'deep_dive.focus_title': 'التركيز على', 'deep_dive.avoid_title': 'تجنب', 'deep_dive.planetary_label': 'المحاذاة الكوكبية', 'deep_dive.mantra_label': 'المانترا اليومية', 'deep_dive.reminder_btn': 'تعيين تذكير يومي',
        'calendar.menu_title': 'القائمة', 'calendar.menu_calendar': 'التقويم', 'calendar.menu_planner': 'المخطط', 'calendar.menu_ritual': 'الطقوس', 'calendar.menu_daily_guide': 'الدليل اليومي', 'calendar.menu_profile': 'الملف الشخصي', 'calendar.menu_settings': 'الإعدادات', 'calendar.header_title': 'تقويم القرارات', 'calendar.day_sun': 'أح', 'calendar.day_mon': 'إث', 'calendar.day_tue': 'ثل', 'calendar.day_wed': 'أر', 'calendar.day_thu': 'خم', 'calendar.day_fri': 'جم', 'calendar.day_sat': 'سب', 'calendar.daily_analysis': 'التحليل اليومي', 'calendar.active_cycle': 'الدورة النشطة', 'calendar.today_vibration': 'ذبذبة اليوم', 'calendar.supported_label': 'مدعوم', 'calendar.challenging_label': 'تحدي', 'calendar.timing_cta': 'عرض توقيت قرار اليوم',
        'lunar.header_title': 'طاقة القمر', 'lunar.vibration_phase': 'مرحلة الذبذبة', 'lunar.detailed_reading': 'قراءة مفصلة', 'lunar.guidance_title': 'إرشاد قمري', 'lunar.crystal_wisdom': 'حكمة البلور', 'lunar.end_reading': 'نهاية القراءة اليومية',
        'messaging.not_connected_text': 'يجب أن تكون متصلاً لإرسال الرسائل.', 'messaging.back_to_connections': 'العودة إلى الاتصالات', 'messaging.no_messages': 'لا توجد رسائل بعد', 'messaging.input_placeholder': 'اكتب رسالة...',
        'friendship.title': 'ديناميكية الصداقة', 'friendship.bond_analysis': 'تحليل رابطة الصداقة', 'friendship.harmony': 'الانسجام', 'friendship.life_path': 'مسار الحياة', 'friendship.soul_urge': 'دافع الروح', 'friendship.personality': 'الشخصية', 'friendship.expression': 'التعبير', 'friendship.energy_title': 'طاقة الصداقة', 'friendship.energy_subtitle': 'جوهر وديناميكية رابطتكم الأساسية', 'friendship.communication_title': 'ديناميكية التواصل', 'friendship.communication_subtitle': 'كيف تفهمون بعضكم', 'friendship.strengths_title': 'نقاط القوة المشتركة', 'friendship.strengths_subtitle': 'أين تتألقون معاً', 'friendship.challenges_title': 'نقاط الانتباه', 'friendship.challenges_subtitle': 'مناطق الاحتكاك والتوازن المطلوب', 'friendship.roadmap_title': 'خارطة الطريق', 'friendship.roadmap_subtitle': 'دليل لتقوية هذه الصداقة', 'friendship.numerology_comparison': 'المقارنة العددية', 'friendship.tbl_life_path': 'مسار الحياة', 'friendship.tbl_expression': 'التعبير', 'friendship.tbl_soul_urge': 'دافع الروح', 'friendship.tbl_personality': 'الشخصية', 'friendship.share_title': 'مشاركة بطاقة الصداقة', 'friendship.share_subtitle': 'مشاركة تحليل الصداقة', 'friendship.save_to_gallery': 'حفظ في المعرض', 'friendship.copy': 'نسخ', 'friendship.other': 'أخرى',
        'quiz.title': 'اختبار الأعداد', 'quiz.correct': 'صحيح', 'quiz.win_streak': 'سلسلة الانتصارات', 'quiz.quick_quiz': 'اختبار سريع', 'quiz.quick_quiz_desc': '10 أسئلة \u00b7 اختبر معرفتك \u00b7 اكسب XP', 'quiz.duel': 'مبارزة', 'quiz.duel_desc': '5 أسئلة \u00b7 ضد خصم \u00b7 مكافأة 2x XP', 'quiz.cosmic_league': 'الدوري الكوني', 'quiz.cosmic_league_desc': 'تصنيف أسبوعي \u00b7 نظام دوريات \u00b7 مكافآت', 'quiz.your_badges': 'شاراتك', 'quiz.question_label': 'سؤال', 'quiz.you': 'أنت', 'quiz.opponent': 'الخصم', 'quiz.next': 'التالي \u2192', 'quiz.menu': '\u2190 القائمة', 'quiz.play_again': 'العب مرة أخرى',
        'wheel.title': 'عجلة Numantic', 'wheel.main_title': 'عجلة Numantic', 'wheel.subtitle': 'اكتشف محاذاتك الكونية', 'wheel.spin': 'أدر', 'wheel.not_spun_yet': 'لم تدر بعد...', 'wheel.daily_rewards': 'مكافآت اليوم الكونية', 'wheel.refreshes_daily': 'تتجدد مرة يومياً', 'wheel.reward_1_day': 'يوم واحد بريميوم', 'wheel.chance_15': '15% فرصة', 'wheel.reward_5_days': '5 أيام بريميوم', 'wheel.chance_5': '5% فرصة', 'wheel.reward_10_days': '10 أيام بريميوم', 'wheel.chance_2': '2% فرصة', 'wheel.stars_aligning': 'النجوم تصطف', 'wheel.premium_reward_won': 'فزت بمكافأة بريميوم!', 'wheel.claim_reward': 'استلم المكافأة',
        'leaderboard.title': 'الدوري الكوني', 'leaderboard.weekly_rewards': 'المكافآت الأسبوعية', 'leaderboard.prize_1_premium': 'يومان بريميوم', 'leaderboard.prize_1_bonus': '+ تاج البطل', 'leaderboard.prize_2_premium': 'يوم واحد بريميوم', 'leaderboard.prize_2_bonus': '+ تاج فضي', 'leaderboard.prize_3_premium': 'بطاقة نادرة', 'leaderboard.prize_3_bonus': '+ تاج برونزي', 'leaderboard.league_closing': 'إغلاق الدوري:', 'leaderboard.weekly_ranking': 'التصنيف الأسبوعي', 'leaderboard.top3_promotion': 'أفضل 3 = ترقية', 'leaderboard.bottom3_relegation': 'آخر 3 = هبوط', 'leaderboard.promotion_info': 'في نهاية الأسبوع، أفضل 3 يصعدون وآخر 3 يهبطون.', 'leaderboard.quiz_cta': 'حل الاختبار وارتفع في التصنيف',
        'premium.header_title': 'الدفع', 'premium.plan_name': 'Numantic بريميوم', 'premium.trial_info': 'أول 3 أيام مجاناً \u00b7 ألغِ في أي وقت', 'premium.secure_payment': 'دفع آمن', 'premium.payment_desc': 'بالضغط أدناه ستفتح نافذة الدفع الآمن Paddle', 'premium.security_note': 'دفع آمن Paddle \u00b7 ضريبة القيمة المضافة مشمولة تلقائياً', 'premium.complete_payment': 'إتمام الدفع', 'premium.terms_text': 'بإتمام الدفع تقبل شروط الخدمة.', 'premium.skip_free': 'متابعة مجاناً الآن \u2192', 'premium.success_title': 'بريميوم مفعّل!', 'premium.success_desc': 'تهانينا! لديك الآن وصول غير محدود لجميع الميزات.', 'premium.trial_started': 'بدأت التجربة المجانية لمدة 3 أيام', 'premium.explore_btn': 'ابدأ الاستكشاف',
        'store.header_title': 'Numantic بريميوم', 'store.premium_active': 'بريميوم مفعّل', 'store.feature_ai': 'تحليل ذكاء اصطناعي غير محدود', 'store.feature_friends': 'أصدقاء وتوافق غير محدود', 'store.feature_cosmic': 'كشف التطابق الكوني', 'store.feature_deep': 'تحليل عميق كامل (3 صفحات)', 'store.feature_guide': 'دليل يومي بالذكاء الاصطناعي والتقويم الكوني', 'store.hero_title': 'أطلق القوة الكاملة لعلم الأعداد', 'store.hero_desc': 'تحليل ذكاء اصطناعي غير محدود، كشف التطابق الكوني، تقارير توافق كاملة والمزيد.', 'store.monthly': 'شهري', 'store.save_badge': 'توفير 37%', 'store.yearly': 'سنوي', 'store.go_premium': 'الترقية لبريميوم', 'store.cancel_info': 'ألغِ في أي وقت \u00b7 3 أيام تجربة مجانية', 'store.comparison_title': 'مجاني مقابل بريميوم', 'store.feature_col': 'الميزة', 'store.perks_title': 'مزايا بريميوم', 'store.try_free': 'جرب 3 أيام مجاناً',
        'kisi.personality_analysis': 'تحليل الشخصية', 'kisi.deep_insight_desc': 'فيثاغورس \u00b7 التعبير \u00b7 دافع الروح \u00b7 مسار الحياة', 'kisi.friendship_dynamics': 'ديناميكية الصداقة', 'kisi.friendship_desc': 'الانسجام بينكم \u00b7 خارطة الطريق \u00b7 التحليل', 'kisi.compatibility_analysis': 'تحليل التوافق', 'kisi.compatibility_desc': 'الانسجام الرومانسي \u00b7 الرابطة الكارمية \u00b7 نقاط توأم الروح',
        'meaning.header_title': 'معاني الأعداد', 'meaning.close': 'إغلاق', 'meaning.core_vibrations': 'الذبذبات الأساسية 1-9', 'meaning.core_subtitle': 'اكتشف الطاقة الأساسية لكل رقم', 'meaning.num1_title': 'الرائد', 'meaning.num1_desc': 'القيادة، الاستقلال، البدايات، الطموح، العزيمة', 'meaning.num2_title': 'صانع السلام', 'meaning.num2_desc': 'الشراكة، الثنائية، الدبلوماسية، الحدس، التوازن', 'meaning.num3_title': 'المبدع', 'meaning.num3_desc': 'التعبير، الإبداع، التواصل، التفاؤل', 'meaning.num4_title': 'الباني', 'meaning.num4_desc': 'العزيمة، البنية، الاجتهاد، العملية', 'meaning.num5_title': 'المغامر', 'meaning.num5_desc': 'الحرية، التغيير، المغامرة، التنوع', 'meaning.num6_title': 'الحارس', 'meaning.num6_desc': 'المسؤولية، الحماية، الرعاية، المجتمع، التوازن', 'meaning.num7_title': 'الباحث', 'meaning.num7_desc': 'المعرفة، التأمل، الروحانية، التحليل، الفهم', 'meaning.num8_title': 'المدير', 'meaning.num8_desc': 'القوة، الوفرة، المالية، الإدارة، الحرية المادية', 'meaning.num9_title': 'الإنساني', 'meaning.num9_desc': 'الإيثار، الاكتمال، الرحمة، المثالية', 'meaning.get_full_chart': 'احصل على خريطتك الكاملة',
        'vibration.header_title': 'مشاركة التحليل', 'vibration.analysis_card': 'بطاقة التحليل', 'vibration.life_path_number': 'رقم مسار الحياة', 'vibration.archetype': 'باحث روحي عميق', 'vibration.archetype_traits': 'الحكمة \u00b7 التأمل \u00b7 الحقيقة', 'vibration.card_info': 'هذه البطاقة مثالية للقصص وتحديثات الحالة.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'حفظ في المعرض', 'vibration.copy_link': 'نسخ الرابط', 'vibration.other': 'أخرى',
        'archive.header_title': 'الأرشيف المقدس', 'archive.eternal_record': 'سجل الأرشيف الأبدي', 'archive.destiny_analysis': 'تحليل القدر الكامل', 'archive.life_path_label': 'مسار الحياة', 'archive.soul_urge_label': 'دافع الروح', 'archive.destiny_label': 'القدر', 'archive.inscribed_date': 'تاريخ التسجيل', 'archive.closing_question': 'كيف شكّلت هذه الحكمة رحلتك؟',
        'onboarding.slide1_title_1': 'كوني', 'onboarding.slide1_title_2': 'اكتشف هدفك', 'onboarding.slide1_desc': 'أنر رحلتك الروحية باكتشاف الذبذبات المخفية في تاريخ ميلادك واسمك.', 'onboarding.slide2_title_1': 'اعثر على توأم روحك', 'onboarding.slide2_title_2': 'اكتشف روابط روحية جديدة', 'onboarding.slide2_desc': 'اكتشف الروابط الكونية في الحب والصداقة وعلاقات العمل من خلال تحليل التوافق العددي.', 'onboarding.slide3_title_1': 'يومي', 'onboarding.slide3_title_2': 'المرشد الكوني', 'onboarding.slide3_desc': 'اتخذ أفضل القرارات كل يوم وفقاً لتقويم طاقتك الشخصي.', 'onboarding.slide4_title_1': 'أرسل نيتك', 'onboarding.slide4_title_2': 'إلى الكون', 'onboarding.slide4_desc': 'حدد نواياك في بوابة التجلي وأطلقها في الطاقة الكونية وتجلّ مع المجتمع.', 'onboarding.btn_continue': 'متابعة', 'onboarding.btn_start': 'ابدأ', 'onboarding.btn_login': 'تسجيل الدخول', 'onboarding.theme_light': 'الوضع الفاتح', 'onboarding.theme_dark': 'الوضع الداكن',
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'جاري قراءة النجوم', 'splash.msg_aligning': 'الكون يصطف', 'splash.msg_channeling': 'توجيه طاقتك', 'splash.msg_awakening': 'قدرك يستيقظ',
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'التوجيه السماوي', 'branded_splash.loading_text': 'المزامنة مع الكون...',
        'soulmate_loading.title': 'مزامنة أرواحكم...', 'soulmate_loading.subtitle': 'المسارات الكارمية تتلامس...', 'soulmate_loading.progress_label': 'تركيب ترددات الحب', 'soulmate_loading.engine_label': 'محرك توأم الروح v2.0', 'calc_loading.title': 'حساب ذبذباتك...', 'calc_loading.subtitle': 'استشارة النجوم ومحاذاة المسارات الكونية', 'calc_loading.msg_syncing': 'المزامنة مع الكون', 'calc_loading.msg_calculating': 'حساب ذبذباتك', 'calc_loading.msg_aligning': 'محاذاة المسارات الكونية', 'calc_loading.msg_reading': 'قراءة الأرقام المقدسة', 'calc_loading.msg_almost': 'تقريباً جاهز...', 'calc_loading.engine_label': 'محرك علم الأعداد v2.0',
        'wheel_reward.header_title': 'هبة القدر', 'wheel_reward.title': 'القدر تكلم', 'wheel_reward.subtitle': 'ظهرت هدية مقدسة', 'wheel_reward.reward_title': '3 بلورات مجانية', 'wheel_reward.reward_subtitle': 'تحليل الاسم العميق مفتوح', 'wheel_reward.reward_desc': 'استخدمها لفتح برجك اليومي واستكشاف مسارك الروحي.', 'wheel_reward.btn_claim': 'استلم المكافأة', 'wheel_reward.btn_vault': 'أضف إلى خزنتي الروحية', 'wheel_reward.nav_home': 'الرئيسية', 'wheel_reward.nav_readings': 'القراءات', 'wheel_reward.nav_wheel': 'العجلة', 'wheel_reward.nav_store': 'المتجر', 'wheel_reward.nav_profile': 'الملف',
        'manifest.cat_love': 'الحب', 'manifest.cat_money': 'المال', 'manifest.cat_health': 'الصحة', 'manifest.cat_career': 'المهنة', 'manifest.cat_spiritual': 'الروح', 'manifest.phase_full': 'مرحلة البدر', 'manifest.energy_release': 'الطاقة: الإطلاق والاكتمال', 'manifest.title_release': 'أطلق وحرر', 'manifest.sub_release': 'سلّم لضوء القمر الفضي ما لم يعد يخدم مسارك الأعلى.', 'manifest.placeholder_release': 'ما الذي أنت مستعد لإطلاقه إلى الكون؟', 'manifest.hint_release': 'أطلق. سلّم. كن حراً.', 'manifest.btn_release': 'أطلق إلى الكون', 'manifest.sent_release': 'أُطلق إلى الكون', 'manifest.sent_sub_release': 'نيتك الآن تُنسج في النسيج الكوني', 'manifest.phase_new': 'مرحلة القمر الجديد', 'manifest.energy_new': 'الطاقة: نوايا جديدة', 'manifest.title_new': 'نوايا جديدة', 'manifest.sub_new': 'ازرع رغباتك الكونية في ظلام الدورة الجديدة الخصب.', 'manifest.placeholder_new': 'أي بذور أنت مستعد لزراعتها اليوم؟', 'manifest.hint_new': 'ازرع البذرة. ثق بالكون.', 'manifest.btn_new': 'ازرع بذرتي', 'manifest.sent_new': 'بذرة زُرعت في الكون', 'manifest.sent_sub_new': 'نيتك تتجذر في الظلام الخصب', 'manifest.energy_waning': 'الطاقة: متناقصة ومحررة', 'manifest.energy_waxing': 'الطاقة: متزايدة وبناءة', 'manifest.title_cosmic': 'البوابة الكونية', 'manifest.sub_cosmic': 'اهتز على تردد رغباتك.', 'manifest.placeholder_cosmic': 'اكتب نيتك إلى الكون...', 'manifest.hint_cosmic': 'كن محدداً. اشعر بالذبذبة.', 'manifest.btn_cosmic': 'أرسل إلى الكون', 'manifest.sent_cosmic': 'أُرسل إلى الكون', 'manifest.sent_sub_cosmic': 'نيتك الآن طاقة كونية'
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

        'conn.title': 'Связи Души', 'conn.mark_all_read': 'Отметить все как прочитанные', 'conn.soul_connections': 'Связи Души',

        'match.optin_title': 'Космическое Совпадение', 'match.optin_subtitle': 'Поделитесь своим нумерологическим профилем с другими пользователями и откройте родственные души, которые вселенная выбрала для вас.', 'match.optin_shared_title': 'Что публикуется?', 'match.optin_shared_desc': 'Только ваше имя, жизненный путь и нумерологические числа', 'match.optin_privacy_title': 'Конфиденциальность', 'match.optin_privacy_desc': 'Дата рождения и личные данные не публикуются', 'match.optin_toggle_title': 'Отключите в любое время', 'match.optin_toggle_desc': 'Отключите обнаруживаемость в настройках профиля', 'match.select_city_label': 'Выберите город', 'match.select_province': '\u2014 Выберите область \u2014', 'match.join_discovery_btn': 'Присоединиться к открытию', 'match.you_label': 'Вы', 'match.soul_harmony': 'Гармония Души', 'match.cosmic_bond': 'Космическая Связь', 'match.reveal_profile': 'Раскрыть профиль', 'match.no_credits_msg': 'Ваши кредиты раскрытия на сегодня исчерпаны', 'match.credits_tomorrow': '5 новых кредитов завтра', 'match.waiting_match': 'Ожидание совпадения', 'match.empty_bond_desc': 'Совпадения начнутся, когда присоединится больше пользователей. Ваша космическая связь скоро проявится!', 'match.daily_matches_title': 'Ежедневные Совпадения', 'match.cosmic_map_title': 'Космическая Карта', 'match.city_btn': 'Город', 'match.save_btn': 'Сохранить', 'match.map_empty': 'На карте пока нет душ...', 'match.cosmic_analysis_title': 'Космический Анализ', 'match.harmony_analysis': 'Анализ Гармонии', 'match.past_matches_title': 'Прошлые Совпадения', 'match.history_empty': 'История совпадений появится здесь', 'match.add_connection': 'Добавить связь',
        'connections.notifications': 'Уведомления', 'connections.add': 'Добавить', 'connections.match_connections': 'Связи совпадений', 'connections.recent_analyses': 'Последние анализы', 'connections.no_analyses': 'Пока нет анализов.', 'connections.start_new_analysis': '+ Начать новый анализ', 'connections.new_analysis_btn': 'Начать новый анализ',
        'manifest_community.my_manifests_btn': 'Мои манифесты', 'manifest_community.sort_newest': 'Новейшие', 'manifest_community.sort_top_rated': 'Лучшие', 'manifest_community.sort_weekly': 'Еженедельно', 'manifest_community.cat_all': 'Все', 'manifest_community.cat_money': 'Деньги', 'manifest_community.cat_love': 'Любовь', 'manifest_community.cat_health': 'Здоровье', 'manifest_community.cat_career': 'Карьера', 'manifest_community.cat_soul': 'Душа', 'manifest_community.info_title': 'Портал Манифестации', 'manifest_community.info_desc': 'Откройте манифесты сообщества, вдохновляйтесь и отправляйте свои намерения во вселенную.', 'manifest_community.info_ok_btn': 'Понятно', 'manifest_community.my_manifests_title': 'Мои манифесты',
        'manifest_portal.header_title': 'Портал Манифестации', 'manifest_portal.hero_title': 'Холст Пространства', 'manifest_portal.hero_subtitle': 'Ваши намерения — звёзды, освещающие вашу личную вселенную.', 'manifest_portal.go_premium': 'Перейти на Premium \u2192', 'manifest_portal.no_manifest_title': 'Пока нет манифестов', 'manifest_portal.no_manifest_desc': 'Вселенная ждёт ваших намерений. Начните путешествие, выразив желания словами.', 'manifest_portal.write_manifest_btn': 'Написать манифест', 'manifest_portal.premium_title': 'Преимущество Premium', 'manifest_portal.premium_desc': 'Создавайте неограниченные манифесты и усиливайте поток космической энергии с Premium.', 'manifest_portal.view_benefits_btn': 'Посмотреть все преимущества',
        'breakdown1.header_title': 'Анализ Имени', 'breakdown1.expression_label': 'Выражение', 'breakdown1.tap_to_calculate': 'Нажмите, чтобы увидеть расчёт', 'breakdown1.soul_urge_title': 'Зов Души', 'breakdown1.soul_urge_badge': 'Внутр.', 'breakdown1.soul_urge_desc': 'Глубокий искатель истины, стремящийся к духовному пониманию.', 'breakdown1.personality_title': 'Личность', 'breakdown1.personality_badge': 'Внешн.', 'breakdown1.personality_desc': 'Воспринимается как сдержанный, аналитический и высококомпетентный.', 'breakdown1.life_path_title': 'Путь Жизни', 'breakdown1.life_path_badge': 'Судьба', 'breakdown1.life_path_desc': 'Чертёж вашей судьбы, направляющий цель и рост.', 'breakdown1.karmic_bond_title': 'Кармическая Связь', 'breakdown1.karmic_bond_badge': 'Долг', 'breakdown1.karmic_bond_desc': 'Анализ кармических долгов и уроков прошлых жизней.', 'breakdown1.ask_master_btn': 'Спросить Мастера Нумерологии', 'breakdown1.key_energy_label': 'Ключевая Энергия', 'breakdown1.key_energy_value': 'Гармония', 'breakdown1.focus_label': 'Фокус', 'breakdown1.focus_value': 'Разум', 'breakdown1.context_analysis_title': 'Контекстный Анализ', 'breakdown1.context_analysis_desc': 'Комбинированная интерпретация чисел + временного контекста', 'breakdown1.intensity_label': 'Интенсивность', 'breakdown1.context_loading': 'Подготовка контекстного анализа...', 'breakdown1.view_detailed_reading': 'Смотреть подробное чтение', 'breakdown1.master_modal_title': 'МАСТЕР НУМЕРОЛОГИИ', 'breakdown1.master_modal_subtitle': 'Отвечает на ваши кармические вопросы', 'breakdown1.master_input_placeholder': 'Спросите о кармическом долге...',
        'breakdown2.header_label': 'Полный Анализ', 'breakdown2.karmic_bond_title': 'Кармическая Связь', 'breakdown2.karmic_bond_loading': 'Чтение кармической связи...', 'breakdown2.communication_title': 'Гармония Общения', 'breakdown2.comm_logic': 'Логика', 'breakdown2.comm_intuition': 'Интуиция', 'breakdown2.comm_verbal': 'Вербальный', 'breakdown2.comm_empathy': 'Эмпатия', 'breakdown2.communication_loading': 'Анализ гармонии общения...', 'breakdown2.emotional_synergy_title': 'Эмоциональная Синергия', 'breakdown2.soul_urge_match_label': 'Совпадение Зова Души', 'breakdown2.emotional_loading': 'Расчёт эмоциональной гармонии...', 'breakdown2.shared_destiny_title': 'Общая Судьба', 'breakdown2.shared_destiny_loading': 'Чтение общей судьбы...', 'breakdown2.download_pdf_btn': 'Скачать как PDF',
        'breakdown3.header_title': 'Анализ Отношений', 'breakdown3.cosmic_resonance': 'Космический Резонанс', 'breakdown3.karmic_title': 'Кармическая Связь Отношений', 'breakdown3.karmic_badge': 'Карма', 'breakdown3.karmic_analyze': 'АНАЛИЗИРОВАТЬ', 'breakdown3.karmic_desc': 'Анализ кармической связи и следов прошлых жизней между двумя душами.', 'breakdown3.ask_guide_btn': 'Спросить Гида Отношений', 'breakdown3.soul_urge_title': 'Гармония Зова Души', 'breakdown3.soul_urge_badge': 'Сердце', 'breakdown3.soul_urge_desc': 'Гармония ваших внутренних желаний и эмоциональных потребностей.', 'breakdown3.personality_title': 'Гармония Личностей', 'breakdown3.personality_badge': 'Внешн.', 'breakdown3.personality_desc': 'Ваши социальные динамики и отражение во внешнем мире.', 'breakdown3.life_path_title': 'Объединение Путей Жизни', 'breakdown3.life_path_badge': 'Судьба', 'breakdown3.life_path_desc': 'Точка схождения ваших путей судьбы и совместное путешествие.', 'breakdown3.expression_title': 'Гармония Выражения', 'breakdown3.expression_badge': 'Выражение', 'breakdown3.expression_desc': 'Гармония энергий имён и как они дополняют друг друга.', 'breakdown3.communication_title': 'Гармония Общения', 'breakdown3.communication_badge': 'Общение', 'breakdown3.communication_desc': 'Ваши стили общения и как вы понимаете друг друга.', 'breakdown3.bond_quality_label': 'Качество Связи', 'breakdown3.growth_area_label': 'Зона Роста', 'breakdown3.full_analysis_btn': 'Смотреть полный анализ', 'breakdown3.guide_modal_title': 'ГИД ОТНОШЕНИЙ', 'breakdown3.guide_modal_subtitle': 'Отвечает на вопросы об отношениях', 'breakdown3.guide_input_placeholder': 'Спросите об отношениях...', 'breakdown3.share_title': 'Поделиться картой родственной души', 'breakdown3.share_cta': 'Поделитесь этой картой с близкими', 'breakdown3.save_to_gallery': 'Сохранить в Галерею', 'breakdown3.copy_link': 'Копировать', 'breakdown3.other': 'Другое',
        'compat_form.header_title': 'Совместимость Отношений', 'compat_form.headline': 'Откройте своё космическое выравнивание', 'compat_form.subheadline': 'Введите данные, чтобы раскрыть духовную связь между двумя душами.', 'compat_form.you_label': 'Вы', 'compat_form.main_account': 'Основной аккаунт', 'compat_form.your_name_label': 'Ваше Имя', 'compat_form.profile_loading_placeholder': 'Загрузка профиля...', 'compat_form.your_birthdate_label': 'Дата Рождения', 'compat_form.partner_label': 'Партнёр', 'compat_form.partner_name_label': 'Имя Партнёра', 'compat_form.partner_name_placeholder': 'Введите полное имя', 'compat_form.partner_birthdate_label': 'Дата Рождения Партнёра', 'compat_form.footer_note': 'Расчёты основаны на нумерологических принципах и астрологических выравниваниях.', 'compat_form.check_btn': 'Проверить Совместимость',
        'compat_analysis.header_title': 'Анализ Совместимости', 'compat_analysis.harmony_label': 'Гармония', 'compat_analysis.you_name': 'Вы', 'compat_analysis.life_path_label': 'Путь Жизни', 'compat_analysis.personality_label': 'Личность', 'compat_analysis.soul_urge_label': 'Зов Души', 'compat_analysis.expression_label': 'Выражение', 'compat_analysis.cosmic_bond_title': 'Космическая Связь', 'compat_analysis.cosmic_bond_loading': 'Расчёт космической связи...', 'compat_analysis.unlock_love_guide': 'Открыть полный гид любви', 'compat_analysis.share_title': 'Поделиться картой родственной души', 'compat_analysis.share_cta': 'Поделитесь этой картой с близкими', 'compat_analysis.save_to_gallery': 'Сохранить в Галерею', 'compat_analysis.copy_link': 'Копировать', 'compat_analysis.other': 'Другое',
        'daily_guide.header_title': 'Ежедневный Гид', 'daily_guide.title': 'Ежедневный Анализ', 'daily_guide.subtitle': 'Числовое руководство на сегодня', 'daily_guide.share_btn': 'Поделиться', 'daily_guide.share_title': 'Поделиться Анализом', 'daily_guide.share_badge': 'Ежедневный Анализ', 'daily_guide.share_desc': 'Поделитесь ежедневным анализом', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'Сохранить в Галерею', 'daily_guide.share_copy': 'Копировать Ссылку', 'daily_guide.share_other': 'Другое',
        'deep_dive.header_title': 'Ежедневное Погружение', 'deep_dive.day_title': 'День Интуиции', 'deep_dive.vibration_badge': 'Духовная Вибрация', 'deep_dive.focus_title': 'Сосредоточиться На', 'deep_dive.avoid_title': 'Избегать', 'deep_dive.planetary_label': 'Планетарное Выравнивание', 'deep_dive.mantra_label': 'Ежедневная Мантра', 'deep_dive.reminder_btn': 'Установить ежедневное напоминание',
        'calendar.menu_title': 'Меню', 'calendar.menu_calendar': 'Календарь', 'calendar.menu_planner': 'Планировщик', 'calendar.menu_ritual': 'Ритуал', 'calendar.menu_daily_guide': 'Ежедневный Гид', 'calendar.menu_profile': 'Профиль', 'calendar.menu_settings': 'Настройки', 'calendar.header_title': 'Календарь Решений', 'calendar.day_sun': 'Вс', 'calendar.day_mon': 'Пн', 'calendar.day_tue': 'Вт', 'calendar.day_wed': 'Ср', 'calendar.day_thu': 'Чт', 'calendar.day_fri': 'Пт', 'calendar.day_sat': 'Сб', 'calendar.daily_analysis': 'Ежедневный Анализ', 'calendar.active_cycle': 'Активный Цикл', 'calendar.today_vibration': 'Вибрация Сегодня', 'calendar.supported_label': 'Поддерживается', 'calendar.challenging_label': 'Сложный', 'calendar.timing_cta': 'Посмотреть время решений сегодня',
        'lunar.header_title': 'Лунная Энергия', 'lunar.vibration_phase': 'Фаза Вибрации', 'lunar.detailed_reading': 'Подробное Чтение', 'lunar.guidance_title': 'Лунное Руководство', 'lunar.crystal_wisdom': 'Мудрость Кристалла', 'lunar.end_reading': 'Конец ежедневного чтения',
        'messaging.not_connected_text': 'Для отправки сообщений нужно подключиться.', 'messaging.back_to_connections': 'Назад к связям', 'messaging.no_messages': 'Пока нет сообщений', 'messaging.input_placeholder': 'Написать сообщение...',
        'friendship.title': 'Динамика Дружбы', 'friendship.bond_analysis': 'Анализ Дружеской Связи', 'friendship.harmony': 'Гармония', 'friendship.life_path': 'Путь Жизни', 'friendship.soul_urge': 'Зов Души', 'friendship.personality': 'Личность', 'friendship.expression': 'Выражение', 'friendship.energy_title': 'Энергия Дружбы', 'friendship.energy_subtitle': 'Суть и основная динамика вашей связи', 'friendship.communication_title': 'Динамика Общения', 'friendship.communication_subtitle': 'Как вы понимаете друг друга', 'friendship.strengths_title': 'Общие Сильные Стороны', 'friendship.strengths_subtitle': 'Где вы сияете вместе', 'friendship.challenges_title': 'Точки Внимания', 'friendship.challenges_subtitle': 'Области трения и необходимого баланса', 'friendship.roadmap_title': 'Дорожная Карта', 'friendship.roadmap_subtitle': 'Руководство для укрепления дружбы', 'friendship.numerology_comparison': 'Нумерологическое Сравнение', 'friendship.tbl_life_path': 'Путь Жизни', 'friendship.tbl_expression': 'Выражение', 'friendship.tbl_soul_urge': 'Зов Души', 'friendship.tbl_personality': 'Личность', 'friendship.share_title': 'Поделиться картой дружбы', 'friendship.share_subtitle': 'Поделиться анализом дружбы', 'friendship.save_to_gallery': 'Сохранить в Галерею', 'friendship.copy': 'Копировать', 'friendship.other': 'Другое',
        'quiz.title': 'Нумерологический Квиз', 'quiz.correct': 'Правильно', 'quiz.win_streak': 'Серия Побед', 'quiz.quick_quiz': 'Быстрый Квиз', 'quiz.quick_quiz_desc': '10 вопросов \u00b7 Проверь знания \u00b7 Заработай XP', 'quiz.duel': 'Дуэль', 'quiz.duel_desc': '5 вопросов \u00b7 Против соперника \u00b7 Награда 2x XP', 'quiz.cosmic_league': 'Космическая Лига', 'quiz.cosmic_league_desc': 'Еженедельный рейтинг \u00b7 Система лиг \u00b7 Награды', 'quiz.your_badges': 'Ваши Значки', 'quiz.question_label': 'Вопрос', 'quiz.you': 'Вы', 'quiz.opponent': 'Соперник', 'quiz.next': 'Далее \u2192', 'quiz.menu': '\u2190 Меню', 'quiz.play_again': 'Играть снова',
        'wheel.title': 'Колесо Numantic', 'wheel.main_title': 'Колесо Numantic', 'wheel.subtitle': 'Откройте ваше космическое выравнивание', 'wheel.spin': 'КРУТИТЬ', 'wheel.not_spun_yet': 'Вы ещё не крутили...', 'wheel.daily_rewards': 'Космические Награды Дня', 'wheel.refreshes_daily': 'Обновляется раз в день', 'wheel.reward_1_day': '1 День Premium', 'wheel.chance_15': '15% шанс', 'wheel.reward_5_days': '5 Дней Premium', 'wheel.chance_5': '5% шанс', 'wheel.reward_10_days': '10 Дней Premium', 'wheel.chance_2': '2% шанс', 'wheel.stars_aligning': 'Звёзды выстраиваются', 'wheel.premium_reward_won': 'Награда Premium выиграна!', 'wheel.claim_reward': 'ПОЛУЧИТЬ НАГРАДУ',
        'leaderboard.title': 'Космическая Лига', 'leaderboard.weekly_rewards': 'Еженедельные Награды', 'leaderboard.prize_1_premium': '2 Дня Premium', 'leaderboard.prize_1_bonus': '+ Корона Чемпиона', 'leaderboard.prize_2_premium': '1 День Premium', 'leaderboard.prize_2_bonus': '+ Серебряная Корона', 'leaderboard.prize_3_premium': 'Редкая Карта', 'leaderboard.prize_3_bonus': '+ Бронзовая Корона', 'leaderboard.league_closing': 'Закрытие Лиги:', 'leaderboard.weekly_ranking': 'Еженедельный Рейтинг', 'leaderboard.top3_promotion': 'Топ 3 = Повышение', 'leaderboard.bottom3_relegation': 'Последние 3 = Понижение', 'leaderboard.promotion_info': 'В конце недели топ 3 повышаются, последние 3 понижаются.', 'leaderboard.quiz_cta': 'Пройти квиз и подняться в рейтинге',
        'premium.header_title': 'Оплата', 'premium.plan_name': 'Numantic Premium', 'premium.trial_info': 'Первые 3 дня бесплатно \u00b7 Отмена в любое время', 'premium.secure_payment': 'Безопасная Оплата', 'premium.payment_desc': 'Нажатие ниже откроет окно безопасной оплаты Paddle', 'premium.security_note': 'Безопасная оплата Paddle \u00b7 НДС включён автоматически', 'premium.complete_payment': 'Завершить Оплату', 'premium.terms_text': 'Завершая оплату, вы принимаете Условия Использования.', 'premium.skip_free': 'Продолжить бесплатно \u2192', 'premium.success_title': 'Premium Активен!', 'premium.success_desc': 'Поздравляем! Теперь у вас неограниченный доступ ко всем функциям.', 'premium.trial_started': '3-дневная бесплатная пробная версия начата', 'premium.explore_btn': 'Начать Исследование',
        'store.header_title': 'Numantic Premium', 'store.premium_active': 'Premium Активен', 'store.feature_ai': 'Неограниченный ИИ Анализ', 'store.feature_friends': 'Неограниченные Друзья и Совместимость', 'store.feature_cosmic': 'Раскрытие Cosmic Match', 'store.feature_deep': 'Полный Deep Insight (3 страницы)', 'store.feature_guide': 'ИИ Ежедневный Гид и Космический Календарь', 'store.hero_title': 'Откройте полную силу Нумерологии', 'store.hero_desc': 'Неограниченный ИИ анализ, раскрытие Cosmic Match, полные отчёты совместимости и многое другое.', 'store.monthly': 'Ежемесячно', 'store.save_badge': 'СКИДКА 37%', 'store.yearly': 'Ежегодно', 'store.go_premium': 'Перейти на Premium', 'store.cancel_info': 'Отмена в любое время \u00b7 3 дня бесплатной пробной версии', 'store.comparison_title': 'Бесплатно vs Premium', 'store.feature_col': 'Функция', 'store.perks_title': 'Преимущества Premium', 'store.try_free': '3 Дня Бесплатно',
        'kisi.personality_analysis': 'Анализ Личности', 'kisi.deep_insight_desc': 'Пифагор \u00b7 Выражение \u00b7 Зов Души \u00b7 Путь Жизни', 'kisi.friendship_dynamics': 'Динамика Дружбы', 'kisi.friendship_desc': 'Гармония между вами \u00b7 Дорожная карта \u00b7 Анализ', 'kisi.compatibility_analysis': 'Анализ Совместимости', 'kisi.compatibility_desc': 'Романтическая гармония \u00b7 Кармическая связь \u00b7 Оценка родственной души',
        'meaning.header_title': 'Значения Нумерологии', 'meaning.close': 'Закрыть', 'meaning.core_vibrations': 'Основные Вибрации 1-9', 'meaning.core_subtitle': 'Откройте фундаментальную энергию каждого числа', 'meaning.num1_title': 'Первопроходец', 'meaning.num1_desc': 'Лидерство, независимость, начинания, амбиции, решимость', 'meaning.num2_title': 'Миротворец', 'meaning.num2_desc': 'Партнёрство, двойственность, дипломатия, интуиция, баланс', 'meaning.num3_title': 'Творец', 'meaning.num3_desc': 'Выражение, творчество, общение, оптимизм', 'meaning.num4_title': 'Строитель', 'meaning.num4_desc': 'Решимость, структура, усердие, практичность', 'meaning.num5_title': 'Искатель Приключений', 'meaning.num5_desc': 'Свобода, перемены, приключения, разносторонность', 'meaning.num6_title': 'Защитник', 'meaning.num6_desc': 'Ответственность, защита, забота, сообщество, баланс', 'meaning.num7_title': 'Искатель', 'meaning.num7_desc': 'Знание, созерцание, духовность, анализ, понимание', 'meaning.num8_title': 'Руководитель', 'meaning.num8_desc': 'Сила, изобилие, финансы, управление, материальная свобода', 'meaning.num9_title': 'Гуманист', 'meaning.num9_desc': 'Альтруизм, завершение, сострадание, идеализм', 'meaning.get_full_chart': 'Получить полную карту',
        'vibration.header_title': 'Поделиться Анализом', 'vibration.analysis_card': 'Карта Анализа', 'vibration.life_path_number': 'Число Пути Жизни', 'vibration.archetype': 'Глубокий Духовный Искатель', 'vibration.archetype_traits': 'Мудрость \u00b7 Самоанализ \u00b7 Истина', 'vibration.card_info': 'Эта карта идеальна для историй и обновлений статуса.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'Сохранить в Галерею', 'vibration.copy_link': 'Копировать Ссылку', 'vibration.other': 'Другое',
        'archive.header_title': 'Священный Архив', 'archive.eternal_record': 'Вечная Запись Архива', 'archive.destiny_analysis': 'Полный Анализ Судьбы', 'archive.life_path_label': 'Путь Жизни', 'archive.soul_urge_label': 'Зов Души', 'archive.destiny_label': 'Судьба', 'archive.inscribed_date': 'Дата записи', 'archive.closing_question': 'Как эта мудрость повлияла на ваше путешествие?',
        'onboarding.slide1_title_1': 'Космическое', 'onboarding.slide1_title_2': 'Откройте своё Предназначение', 'onboarding.slide1_desc': 'Осветите духовное путешествие, открыв скрытые вибрации в дате рождения и имени.', 'onboarding.slide2_title_1': 'Найдите свою Родственную Душу', 'onboarding.slide2_title_2': 'Откройте Новые Духовные Связи', 'onboarding.slide2_desc': 'Откройте космические связи в любви, дружбе и работе через нумерологический анализ совместимости.', 'onboarding.slide3_title_1': 'Ежедневный', 'onboarding.slide3_title_2': 'Космический Гид', 'onboarding.slide3_desc': 'Принимайте лучшие решения каждый день по вашему энергетическому календарю.', 'onboarding.slide4_title_1': 'Отправьте Намерение', 'onboarding.slide4_title_2': 'во Вселенную', 'onboarding.slide4_desc': 'Определите намерения в портале манифестации, отпустите в космическую энергию и проявляйте вместе с сообществом.', 'onboarding.btn_continue': 'Продолжить', 'onboarding.btn_start': 'Начать', 'onboarding.btn_login': 'Войти', 'onboarding.theme_light': 'Светлый Режим', 'onboarding.theme_dark': 'Тёмный Режим',
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'Читаем звёзды', 'splash.msg_aligning': 'Космос выстраивается', 'splash.msg_channeling': 'Направляем вашу энергию', 'splash.msg_awakening': 'Ваша судьба пробуждается',
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'Небесное Руководство', 'branded_splash.loading_text': 'Синхронизация с космосом...',
        'soulmate_loading.title': 'Синхронизация ваших душ...', 'soulmate_loading.subtitle': 'Кармические пути соприкасаются...', 'soulmate_loading.progress_label': 'Синтез Частот Любви', 'soulmate_loading.engine_label': 'Двигатель Родственных Душ v2.0', 'calc_loading.title': 'Расчёт ваших вибраций...', 'calc_loading.subtitle': 'Консультируемся со звёздами и выстраиваем космические пути', 'calc_loading.msg_syncing': 'Синхронизация со вселенной', 'calc_loading.msg_calculating': 'Расчёт ваших вибраций', 'calc_loading.msg_aligning': 'Выстраивание космических путей', 'calc_loading.msg_reading': 'Чтение священных чисел', 'calc_loading.msg_almost': 'Почти готово...', 'calc_loading.engine_label': 'Двигатель Нумерологии v2.0',
        'wheel_reward.header_title': 'Дар Судьбы', 'wheel_reward.title': 'Судьба Заговорила', 'wheel_reward.subtitle': 'Появился Священный Дар', 'wheel_reward.reward_title': '3 Бесплатных Кристалла', 'wheel_reward.reward_subtitle': 'Глубокий Анализ Имени Разблокирован', 'wheel_reward.reward_desc': 'Используйте их для разблокировки ежедневного гороскопа и исследования духовного пути.', 'wheel_reward.btn_claim': 'Получить Награду', 'wheel_reward.btn_vault': 'Добавить в духовное хранилище', 'wheel_reward.nav_home': 'Главная', 'wheel_reward.nav_readings': 'Чтения', 'wheel_reward.nav_wheel': 'Колесо', 'wheel_reward.nav_store': 'Магазин', 'wheel_reward.nav_profile': 'Профиль',
        'manifest.cat_love': 'Любовь', 'manifest.cat_money': 'Деньги', 'manifest.cat_health': 'Здоровье', 'manifest.cat_career': 'Карьера', 'manifest.cat_spiritual': 'Душа', 'manifest.phase_full': 'Фаза Полнолуния', 'manifest.energy_release': 'Энергия: Отпускание и Завершение', 'manifest.title_release': 'Отпусти и Освободись', 'manifest.sub_release': 'Отдай серебряному лунному свету то, что больше не служит твоему высшему пути.', 'manifest.placeholder_release': 'Что ты готов отпустить во вселенную?', 'manifest.hint_release': 'Отпусти. Сдайся. Будь свободен.', 'manifest.btn_release': 'Отпустить во Вселенную', 'manifest.sent_release': 'Отпущено во Вселенную', 'manifest.sent_sub_release': 'Ваше намерение вплетается в космическую ткань', 'manifest.phase_new': 'Фаза Новолуния', 'manifest.energy_new': 'Энергия: Новые Намерения', 'manifest.title_new': 'Новые Намерения', 'manifest.sub_new': 'Посади свои космические желания в плодородную тьму нового цикла.', 'manifest.placeholder_new': 'Какие семена ты готов посадить сегодня?', 'manifest.hint_new': 'Посади семя. Доверься космосу.', 'manifest.btn_new': 'Посадить Моё Семя', 'manifest.sent_new': 'Семя Посажено в Космосе', 'manifest.sent_sub_new': 'Ваше намерение пускает корни в плодородной тьме', 'manifest.energy_waning': 'Энергия: Убывающая и Отпускающая', 'manifest.energy_waxing': 'Энергия: Растущая и Строящая', 'manifest.title_cosmic': 'Космический Портал', 'manifest.sub_cosmic': 'Вибрируй на частоте своих желаний.', 'manifest.placeholder_cosmic': 'Напиши своё намерение вселенной...', 'manifest.hint_cosmic': 'Будь конкретен. Почувствуй вибрацию.', 'manifest.btn_cosmic': 'Отправить во Вселенную', 'manifest.sent_cosmic': 'Отправлено во Вселенную', 'manifest.sent_sub_cosmic': 'Ваше намерение теперь космическая энергия'
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

        'conn.title': 'Conexões da Alma', 'conn.mark_all_read': 'Marcar tudo como lido', 'conn.soul_connections': 'Conexões da Alma',

        'match.optin_title': 'Match Cósmico', 'match.optin_subtitle': 'Compartilhe seu perfil numerológico com outros usuários e descubra as almas gêmeas que o universo escolheu para você.', 'match.optin_shared_title': 'O que é compartilhado?', 'match.optin_shared_desc': 'Apenas seu nome, caminho de vida e números numerológicos', 'match.optin_privacy_title': 'Privacidade', 'match.optin_privacy_desc': 'Sua data de nascimento e dados pessoais não são compartilhados', 'match.optin_toggle_title': 'Desative quando quiser', 'match.optin_toggle_desc': 'Desative sua visibilidade nas configurações do perfil', 'match.select_city_label': 'Selecione sua Cidade', 'match.select_province': '\u2014 Selecionar estado \u2014', 'match.join_discovery_btn': 'Participar da Descoberta', 'match.you_label': 'Você', 'match.soul_harmony': 'Harmonia da Alma', 'match.cosmic_bond': 'Vínculo Cósmico', 'match.reveal_profile': 'Revelar Perfil', 'match.no_credits_msg': 'Seus créditos de revelação de hoje acabaram', 'match.credits_tomorrow': '5 novos créditos amanhã', 'match.waiting_match': 'Aguardando Match', 'match.empty_bond_desc': 'Matches começarão quando mais usuários entrarem. Seu vínculo cósmico surgirá em breve!', 'match.daily_matches_title': 'Matches Diários', 'match.cosmic_map_title': 'Mapa Cósmico', 'match.city_btn': 'Cidade', 'match.save_btn': 'Salvar', 'match.map_empty': 'Nenhuma alma no mapa ainda...', 'match.cosmic_analysis_title': 'Análise Cósmica', 'match.harmony_analysis': 'Análise de Harmonia', 'match.past_matches_title': 'Matches Passados', 'match.history_empty': 'Seu histórico de matches aparecerá aqui', 'match.add_connection': 'Adicionar Conexão',
        'connections.notifications': 'Notificações', 'connections.add': 'Adicionar', 'connections.match_connections': 'Conexões de Match', 'connections.recent_analyses': 'Análises Recentes', 'connections.no_analyses': 'Nenhuma análise ainda.', 'connections.start_new_analysis': '+ Iniciar Nova Análise', 'connections.new_analysis_btn': 'Iniciar Nova Análise',
        'manifest_community.my_manifests_btn': 'Meus Manifestos', 'manifest_community.sort_newest': 'Mais Novos', 'manifest_community.sort_top_rated': 'Mais Curtidos', 'manifest_community.sort_weekly': 'Semanal', 'manifest_community.cat_all': 'Todos', 'manifest_community.cat_money': 'Dinheiro', 'manifest_community.cat_love': 'Amor', 'manifest_community.cat_health': 'Saúde', 'manifest_community.cat_career': 'Carreira', 'manifest_community.cat_soul': 'Alma', 'manifest_community.info_title': 'Portal de Manifestação', 'manifest_community.info_desc': 'Descubra manifestos da comunidade, inspire-se e envie suas intenções ao universo.', 'manifest_community.info_ok_btn': 'Entendi', 'manifest_community.my_manifests_title': 'Meus Manifestos',
        'manifest_portal.header_title': 'Portal de Manifestação', 'manifest_portal.hero_title': 'Tela do Espaço', 'manifest_portal.hero_subtitle': 'Suas intenções são as estrelas que iluminam seu universo pessoal.', 'manifest_portal.go_premium': 'Obter Premium \u2192', 'manifest_portal.no_manifest_title': 'Nenhum manifesto ainda', 'manifest_portal.no_manifest_desc': 'O universo aguarda suas intenções. Comece sua jornada colocando seus desejos em palavras.', 'manifest_portal.write_manifest_btn': 'Escrever Manifesto', 'manifest_portal.premium_title': 'Vantagem Premium', 'manifest_portal.premium_desc': 'Crie manifestos ilimitados e amplifique seu fluxo de energia cósmica com a assinatura premium.', 'manifest_portal.view_benefits_btn': 'Ver Todos os Benefícios',
        'breakdown1.header_title': 'Análise do Nome', 'breakdown1.expression_label': 'Expressão', 'breakdown1.tap_to_calculate': 'Toque para ver o cálculo', 'breakdown1.soul_urge_title': 'Desejo da Alma', 'breakdown1.soul_urge_badge': 'Interior', 'breakdown1.soul_urge_desc': 'Um buscador profundo de verdade ansiando por compreensão espiritual.', 'breakdown1.personality_title': 'Personalidade', 'breakdown1.personality_badge': 'Exterior', 'breakdown1.personality_desc': 'Percebido como reservado, analítico e altamente competente.', 'breakdown1.life_path_title': 'Caminho de Vida', 'breakdown1.life_path_badge': 'Destino', 'breakdown1.life_path_desc': 'O plano do seu destino guiando seu propósito e crescimento.', 'breakdown1.karmic_bond_title': 'Vínculo Cármico', 'breakdown1.karmic_bond_badge': 'Dívida', 'breakdown1.karmic_bond_desc': 'Análise de dívidas cármicas e lições de vidas passadas.', 'breakdown1.ask_master_btn': 'Perguntar ao Mestre da Numerologia', 'breakdown1.key_energy_label': 'Energia Chave', 'breakdown1.key_energy_value': 'Harmonia', 'breakdown1.focus_label': 'Foco', 'breakdown1.focus_value': 'Mente', 'breakdown1.context_analysis_title': 'Análise Contextual', 'breakdown1.context_analysis_desc': 'Interpretação combinada dos seus números + contexto temporal', 'breakdown1.intensity_label': 'Intensidade', 'breakdown1.context_loading': 'Preparando análise contextual...', 'breakdown1.view_detailed_reading': 'Ver Leitura Detalhada', 'breakdown1.master_modal_title': 'MESTRE DA NUMEROLOGIA', 'breakdown1.master_modal_subtitle': 'Respondendo suas perguntas cármicas', 'breakdown1.master_input_placeholder': 'Pergunte sobre sua dívida cármica...',
        'breakdown2.header_label': 'Análise Completa', 'breakdown2.karmic_bond_title': 'Vínculo Cármico', 'breakdown2.karmic_bond_loading': 'Lendo vínculo cármico...', 'breakdown2.communication_title': 'Harmonia de Comunicação', 'breakdown2.comm_logic': 'Lógica', 'breakdown2.comm_intuition': 'Intuição', 'breakdown2.comm_verbal': 'Verbal', 'breakdown2.comm_empathy': 'Empatia', 'breakdown2.communication_loading': 'Analisando harmonia de comunicação...', 'breakdown2.emotional_synergy_title': 'Sinergia Emocional', 'breakdown2.soul_urge_match_label': 'Correspondência do Desejo da Alma', 'breakdown2.emotional_loading': 'Calculando harmonia emocional...', 'breakdown2.shared_destiny_title': 'Destino Compartilhado', 'breakdown2.shared_destiny_loading': 'Lendo destino compartilhado...', 'breakdown2.download_pdf_btn': 'Baixar como PDF',
        'breakdown3.header_title': 'Análise de Relacionamento', 'breakdown3.cosmic_resonance': 'Ressonância Cósmica', 'breakdown3.karmic_title': 'Vínculo Cármico Relacional', 'breakdown3.karmic_badge': 'Karma', 'breakdown3.karmic_analyze': 'ANALISAR', 'breakdown3.karmic_desc': 'Análise do vínculo cármico e traços de vidas passadas entre duas almas.', 'breakdown3.ask_guide_btn': 'Perguntar ao Guia de Relacionamento', 'breakdown3.soul_urge_title': 'Harmonia do Desejo da Alma', 'breakdown3.soul_urge_badge': 'Coração', 'breakdown3.soul_urge_desc': 'A harmonia dos seus desejos internos e necessidades emocionais.', 'breakdown3.personality_title': 'Harmonia de Personalidade', 'breakdown3.personality_badge': 'Exterior', 'breakdown3.personality_desc': 'Suas dinâmicas sociais e como vocês se refletem ao mundo exterior.', 'breakdown3.life_path_title': 'União do Caminho de Vida', 'breakdown3.life_path_badge': 'Destino', 'breakdown3.life_path_desc': 'O ponto de convergência dos seus caminhos de destino e jornada compartilhada.', 'breakdown3.expression_title': 'Harmonia de Expressão', 'breakdown3.expression_badge': 'Expressão', 'breakdown3.expression_desc': 'A harmonia das energias dos nomes e como se complementam.', 'breakdown3.communication_title': 'Harmonia de Comunicação', 'breakdown3.communication_badge': 'Comunicação', 'breakdown3.communication_desc': 'Seus estilos de comunicação e como se entendem.', 'breakdown3.bond_quality_label': 'Qualidade do Vínculo', 'breakdown3.growth_area_label': 'Área de Crescimento', 'breakdown3.full_analysis_btn': 'Ver Análise Completa', 'breakdown3.guide_modal_title': 'GUIA DE RELACIONAMENTO', 'breakdown3.guide_modal_subtitle': 'Respondendo suas perguntas sobre relacionamento', 'breakdown3.guide_input_placeholder': 'Pergunte sobre seu relacionamento...', 'breakdown3.share_title': 'Compartilhar Carta de Alma Gêmea', 'breakdown3.share_cta': 'Compartilhe esta carta com seus entes queridos', 'breakdown3.save_to_gallery': 'Salvar na Galeria', 'breakdown3.copy_link': 'Copiar', 'breakdown3.other': 'Outro',
        'compat_form.header_title': 'Compatibilidade de Relacionamento', 'compat_form.headline': 'Descubra seu alinhamento cósmico', 'compat_form.subheadline': 'Insira os detalhes para revelar o vínculo espiritual entre duas almas.', 'compat_form.you_label': 'Você', 'compat_form.main_account': 'Conta Principal', 'compat_form.your_name_label': 'Seu Nome', 'compat_form.profile_loading_placeholder': 'Carregando informações do perfil...', 'compat_form.your_birthdate_label': 'Sua Data de Nascimento', 'compat_form.partner_label': 'Parceiro(a)', 'compat_form.partner_name_label': 'Nome do Parceiro(a)', 'compat_form.partner_name_placeholder': 'Insira o nome completo', 'compat_form.partner_birthdate_label': 'Data de Nascimento do Parceiro(a)', 'compat_form.footer_note': 'Cálculos baseados em princípios numerológicos e alinhamentos astrológicos.', 'compat_form.check_btn': 'Verificar Compatibilidade',
        'compat_analysis.header_title': 'Análise de Compatibilidade', 'compat_analysis.harmony_label': 'Harmonia', 'compat_analysis.you_name': 'Você', 'compat_analysis.life_path_label': 'Caminho de Vida', 'compat_analysis.personality_label': 'Personalidade', 'compat_analysis.soul_urge_label': 'Desejo da Alma', 'compat_analysis.expression_label': 'Expressão', 'compat_analysis.cosmic_bond_title': 'Vínculo Cósmico', 'compat_analysis.cosmic_bond_loading': 'Calculando vínculo cósmico...', 'compat_analysis.unlock_love_guide': 'Desbloquear Guia de Amor Completo', 'compat_analysis.share_title': 'Compartilhar Carta de Alma Gêmea', 'compat_analysis.share_cta': 'Compartilhe esta carta com seus entes queridos', 'compat_analysis.save_to_gallery': 'Salvar na Galeria', 'compat_analysis.copy_link': 'Copiar', 'compat_analysis.other': 'Outro',
        'daily_guide.header_title': 'Guia Diário', 'daily_guide.title': 'Análise Diária', 'daily_guide.subtitle': 'Orientação numérica para hoje', 'daily_guide.share_btn': 'Compartilhar', 'daily_guide.share_title': 'Compartilhar Análise', 'daily_guide.share_badge': 'Análise Diária', 'daily_guide.share_desc': 'Compartilhe sua análise diária', 'daily_guide.share_instagram': 'Instagram Stories', 'daily_guide.share_whatsapp': 'WhatsApp Status', 'daily_guide.share_save': 'Salvar na Galeria', 'daily_guide.share_copy': 'Copiar Link', 'daily_guide.share_other': 'Outro',
        'deep_dive.header_title': 'Mergulho Diário', 'deep_dive.day_title': 'Dia da Intuição', 'deep_dive.vibration_badge': 'Vibração Espiritual', 'deep_dive.focus_title': 'Focar Em', 'deep_dive.avoid_title': 'Evitar', 'deep_dive.planetary_label': 'Alinhamento Planetário', 'deep_dive.mantra_label': 'Mantra Diário', 'deep_dive.reminder_btn': 'Definir Lembrete Diário',
        'calendar.menu_title': 'Menu', 'calendar.menu_calendar': 'Calendário', 'calendar.menu_planner': 'Planejador', 'calendar.menu_ritual': 'Ritual', 'calendar.menu_daily_guide': 'Guia Diário', 'calendar.menu_profile': 'Perfil', 'calendar.menu_settings': 'Configurações', 'calendar.header_title': 'Calendário de Decisões', 'calendar.day_sun': 'Do', 'calendar.day_mon': 'Se', 'calendar.day_tue': 'Te', 'calendar.day_wed': 'Qu', 'calendar.day_thu': 'Qi', 'calendar.day_fri': 'Se', 'calendar.day_sat': 'Sá', 'calendar.daily_analysis': 'Análise Diária', 'calendar.active_cycle': 'Ciclo Ativo', 'calendar.today_vibration': 'Vibração de Hoje', 'calendar.supported_label': 'Apoiado', 'calendar.challenging_label': 'Desafiante', 'calendar.timing_cta': 'Ver o Momento de Decisão de Hoje',
        'lunar.header_title': 'Energia Lunar', 'lunar.vibration_phase': 'Fase de Vibração', 'lunar.detailed_reading': 'Leitura Detalhada', 'lunar.guidance_title': 'Orientação Lunar', 'lunar.crystal_wisdom': 'Sabedoria Cristalina', 'lunar.end_reading': 'Fim da Leitura Diária',
        'messaging.not_connected_text': 'Você precisa se conectar para enviar mensagens.', 'messaging.back_to_connections': 'Voltar às Conexões', 'messaging.no_messages': 'Nenhuma mensagem ainda', 'messaging.input_placeholder': 'Digite uma mensagem...',
        'friendship.title': 'Dinâmica de Amizade', 'friendship.bond_analysis': 'Análise do Vínculo de Amizade', 'friendship.harmony': 'Harmonia', 'friendship.life_path': 'Caminho de Vida', 'friendship.soul_urge': 'Desejo da Alma', 'friendship.personality': 'Personalidade', 'friendship.expression': 'Expressão', 'friendship.energy_title': 'Energia de Amizade', 'friendship.energy_subtitle': 'A essência e dinâmica fundamental do seu vínculo', 'friendship.communication_title': 'Dinâmica de Comunicação', 'friendship.communication_subtitle': 'Como vocês se entendem', 'friendship.strengths_title': 'Forças Compartilhadas', 'friendship.strengths_subtitle': 'Onde vocês brilham juntos', 'friendship.challenges_title': 'Pontos de Atenção', 'friendship.challenges_subtitle': 'Áreas de atrito e equilíbrio necessário', 'friendship.roadmap_title': 'Roteiro', 'friendship.roadmap_subtitle': 'Um guia para fortalecer esta amizade', 'friendship.numerology_comparison': 'Comparação Numerológica', 'friendship.tbl_life_path': 'Caminho de Vida', 'friendship.tbl_expression': 'Expressão', 'friendship.tbl_soul_urge': 'Desejo da Alma', 'friendship.tbl_personality': 'Personalidade', 'friendship.share_title': 'Compartilhar Carta de Amizade', 'friendship.share_subtitle': 'Compartilhar análise de amizade', 'friendship.save_to_gallery': 'Salvar na Galeria', 'friendship.copy': 'Copiar', 'friendship.other': 'Outro',
        'quiz.title': 'Quiz de Numerologia', 'quiz.correct': 'Correto', 'quiz.win_streak': 'Sequência de Vitórias', 'quiz.quick_quiz': 'Quiz Rápido', 'quiz.quick_quiz_desc': '10 perguntas \u00b7 Teste seu conhecimento \u00b7 Ganhe XP', 'quiz.duel': 'Duelo', 'quiz.duel_desc': '5 perguntas \u00b7 Contra oponente \u00b7 Recompensa 2x XP', 'quiz.cosmic_league': 'Liga Cósmica', 'quiz.cosmic_league_desc': 'Ranking semanal \u00b7 Sistema de ligas \u00b7 Recompensas', 'quiz.your_badges': 'Suas Insígnias', 'quiz.question_label': 'Pergunta', 'quiz.you': 'Você', 'quiz.opponent': 'Oponente', 'quiz.next': 'Próximo \u2192', 'quiz.menu': '\u2190 Menu', 'quiz.play_again': 'Jogar Novamente',
        'wheel.title': 'Roda Numantic', 'wheel.main_title': 'Roda Numantic', 'wheel.subtitle': 'Descubra seu alinhamento cósmico', 'wheel.spin': 'GIRAR', 'wheel.not_spun_yet': 'Você ainda não girou...', 'wheel.daily_rewards': 'Recompensas Cósmicas do Dia', 'wheel.refreshes_daily': 'Renova uma vez por dia', 'wheel.reward_1_day': '1 Dia Premium', 'wheel.chance_15': '15% de chance', 'wheel.reward_5_days': '5 Dias Premium', 'wheel.chance_5': '5% de chance', 'wheel.reward_10_days': '10 Dias Premium', 'wheel.chance_2': '2% de chance', 'wheel.stars_aligning': 'Estrelas se alinhando', 'wheel.premium_reward_won': 'Recompensa Premium Ganha!', 'wheel.claim_reward': 'RESGATAR RECOMPENSA',
        'leaderboard.title': 'Liga Cósmica', 'leaderboard.weekly_rewards': 'Recompensas Semanais', 'leaderboard.prize_1_premium': '2 Dias Premium', 'leaderboard.prize_1_bonus': '+ Coroa de Campeão', 'leaderboard.prize_2_premium': '1 Dia Premium', 'leaderboard.prize_2_bonus': '+ Coroa de Prata', 'leaderboard.prize_3_premium': 'Carta Rara', 'leaderboard.prize_3_bonus': '+ Coroa de Bronze', 'leaderboard.league_closing': 'Encerramento da Liga:', 'leaderboard.weekly_ranking': 'Ranking Semanal', 'leaderboard.top3_promotion': 'Top 3 = Promoção', 'leaderboard.bottom3_relegation': 'Últimos 3 = Rebaixamento', 'leaderboard.promotion_info': 'No final da semana, os 3 primeiros sobem e os 3 últimos descem.', 'leaderboard.quiz_cta': 'Fazer Quiz & Subir no Ranking',
        'premium.header_title': 'Pagamento', 'premium.plan_name': 'Numantic Premium', 'premium.trial_info': 'Primeiros 3 dias grátis \u00b7 Cancele quando quiser', 'premium.secure_payment': 'Pagamento Seguro', 'premium.payment_desc': 'Ao pressionar abaixo, a janela de pagamento seguro do Paddle abrirá', 'premium.security_note': 'Pagamento seguro Paddle \u00b7 IVA incluído automaticamente', 'premium.complete_payment': 'Concluir Pagamento', 'premium.terms_text': 'Ao concluir o pagamento, você aceita os Termos de Serviço.', 'premium.skip_free': 'Continuar grátis por enquanto \u2192', 'premium.success_title': 'Premium Ativo!', 'premium.success_desc': 'Parabéns! Agora você tem acesso ilimitado a todos os recursos.', 'premium.trial_started': 'Teste grátis de 3 dias iniciado', 'premium.explore_btn': 'Começar a Explorar',
        'store.header_title': 'Numantic Premium', 'store.premium_active': 'Premium Ativo', 'store.feature_ai': 'Análise IA Ilimitada', 'store.feature_friends': 'Amigos & Compatibilidade Ilimitados', 'store.feature_cosmic': 'Revelação Cosmic Match', 'store.feature_deep': 'Deep Insight Completo (3 páginas)', 'store.feature_guide': 'Guia IA Diário & Calendário Cósmico', 'store.hero_title': 'Desbloqueie todo o Poder da Numerologia', 'store.hero_desc': 'Análise IA ilimitada, revelação Cosmic Match, relatórios de compatibilidade completos e muito mais.', 'store.monthly': 'Mensal', 'store.save_badge': '37% ECONOMIA', 'store.yearly': 'Anual', 'store.go_premium': 'Obter Premium', 'store.cancel_info': 'Cancele quando quiser \u00b7 3 dias de teste grátis', 'store.comparison_title': 'Grátis vs Premium', 'store.feature_col': 'Recurso', 'store.perks_title': 'Vantagens Premium', 'store.try_free': '3 Dias Grátis',
        'kisi.personality_analysis': 'Análise de Personalidade', 'kisi.deep_insight_desc': 'Pitágoras \u00b7 Expressão \u00b7 Desejo da Alma \u00b7 Caminho de Vida', 'kisi.friendship_dynamics': 'Dinâmica de Amizade', 'kisi.friendship_desc': 'Harmonia entre vocês \u00b7 Roteiro \u00b7 Análise', 'kisi.compatibility_analysis': 'Análise de Compatibilidade', 'kisi.compatibility_desc': 'Harmonia romântica \u00b7 Vínculo cármico \u00b7 Pontuação alma gêmea',
        'meaning.header_title': 'Significados Numerológicos', 'meaning.close': 'Fechar', 'meaning.core_vibrations': 'Vibrações Fundamentais 1-9', 'meaning.core_subtitle': 'Descubra a energia fundamental de cada número', 'meaning.num1_title': 'Pioneiro', 'meaning.num1_desc': 'Liderança, independência, inícios, ambição, determinação', 'meaning.num2_title': 'Pacificador', 'meaning.num2_desc': 'Parceria, dualidade, diplomacia, intuição, equilíbrio', 'meaning.num3_title': 'Criativo', 'meaning.num3_desc': 'Expressão, criatividade, comunicação, otimismo', 'meaning.num4_title': 'Construtor', 'meaning.num4_desc': 'Determinação, estrutura, diligência, praticidade', 'meaning.num5_title': 'Aventureiro', 'meaning.num5_desc': 'Liberdade, mudança, aventura, versatilidade', 'meaning.num6_title': 'Guardião', 'meaning.num6_desc': 'Responsabilidade, proteção, cuidado, comunidade, equilíbrio', 'meaning.num7_title': 'Buscador', 'meaning.num7_desc': 'Conhecimento, contemplação, espiritualidade, análise, compreensão', 'meaning.num8_title': 'Executivo', 'meaning.num8_desc': 'Poder, abundância, finanças, gestão, liberdade material', 'meaning.num9_title': 'Humanitário', 'meaning.num9_desc': 'Altruísmo, conclusão, compaixão, idealismo', 'meaning.get_full_chart': 'Obter seu Mapa Completo',
        'vibration.header_title': 'Compartilhar Análise', 'vibration.analysis_card': 'Carta de Análise', 'vibration.life_path_number': 'Número do Caminho de Vida', 'vibration.archetype': 'Buscador Espiritual Profundo', 'vibration.archetype_traits': 'Sabedoria \u00b7 Introspecção \u00b7 Verdade', 'vibration.card_info': 'Esta carta é ideal para stories e atualizações de status.', 'vibration.instagram': 'Instagram Stories', 'vibration.whatsapp': 'WhatsApp Status', 'vibration.save_gallery': 'Salvar na Galeria', 'vibration.copy_link': 'Copiar Link', 'vibration.other': 'Outro',
        'archive.header_title': 'Arquivo Sagrado', 'archive.eternal_record': 'Registro Eterno do Arquivo', 'archive.destiny_analysis': 'Análise Completa do Destino', 'archive.life_path_label': 'Caminho de Vida', 'archive.soul_urge_label': 'Desejo da Alma', 'archive.destiny_label': 'Destino', 'archive.inscribed_date': 'Data de registro', 'archive.closing_question': 'Como essa sabedoria moldou sua jornada?',
        'onboarding.slide1_title_1': 'Cósmico', 'onboarding.slide1_title_2': 'Descubra seu Propósito', 'onboarding.slide1_desc': 'Ilumine sua jornada espiritual descobrindo as vibrações ocultas em sua data de nascimento e nome.', 'onboarding.slide2_title_1': 'Encontre sua Alma Gêmea', 'onboarding.slide2_title_2': 'Descubra Novos Vínculos Espirituais', 'onboarding.slide2_desc': 'Descubra vínculos cósmicos no amor, amizade e relações de trabalho através da análise de compatibilidade numerológica.', 'onboarding.slide3_title_1': 'Diário', 'onboarding.slide3_title_2': 'Guia Cósmico', 'onboarding.slide3_desc': 'Tome as melhores decisões todos os dias de acordo com seu calendário de energia pessoal.', 'onboarding.slide4_title_1': 'Envie sua Intenção', 'onboarding.slide4_title_2': 'ao Universo', 'onboarding.slide4_desc': 'Defina suas intenções no portal de manifestação, libere na energia cósmica e manifeste junto com a comunidade.', 'onboarding.btn_continue': 'Continuar', 'onboarding.btn_start': 'Começar', 'onboarding.btn_login': 'Entrar', 'onboarding.theme_light': 'Modo Claro', 'onboarding.theme_dark': 'Modo Escuro',
        'splash.brand_name': 'NUMANTIC', 'splash.brand_tagline': 'Heavenly Insights', 'splash.msg_reading': 'Lendo as estrelas', 'splash.msg_aligning': 'O cosmos se alinha', 'splash.msg_channeling': 'Canalizando sua energia', 'splash.msg_awakening': 'Seu destino está despertando',
        'branded_splash.brand_name': 'Numantic', 'branded_splash.brand_tagline': 'Orientação Celestial', 'branded_splash.loading_text': 'Sincronizando com o cosmos...',
        'soulmate_loading.title': 'Sincronizando suas almas...', 'soulmate_loading.subtitle': 'Caminhos cármicos se tocando...', 'soulmate_loading.progress_label': 'Sintetizando Frequências de Amor', 'soulmate_loading.engine_label': 'Motor Alma Gêmea v2.0', 'calc_loading.title': 'Calculando suas vibrações...', 'calc_loading.subtitle': 'Consultando as estrelas e alinhando caminhos cósmicos', 'calc_loading.msg_syncing': 'Sincronizando com o universo', 'calc_loading.msg_calculating': 'Calculando suas vibrações', 'calc_loading.msg_aligning': 'Alinhando caminhos cósmicos', 'calc_loading.msg_reading': 'Lendo números sagrados', 'calc_loading.msg_almost': 'Quase pronto...', 'calc_loading.engine_label': 'Motor de Numerologia v2.0',
        'wheel_reward.header_title': 'Presente do Destino', 'wheel_reward.title': 'O Destino Falou', 'wheel_reward.subtitle': 'Um Presente Sagrado Surgiu', 'wheel_reward.reward_title': '3 Cristais Grátis', 'wheel_reward.reward_subtitle': 'Análise Profunda do Nome Desbloqueada', 'wheel_reward.reward_desc': 'Use-os para desbloquear seu horóscopo diário e explorar seu caminho espiritual.', 'wheel_reward.btn_claim': 'Resgatar Recompensa', 'wheel_reward.btn_vault': 'Adicionar ao meu cofre espiritual', 'wheel_reward.nav_home': 'Início', 'wheel_reward.nav_readings': 'Leituras', 'wheel_reward.nav_wheel': 'Roda', 'wheel_reward.nav_store': 'Loja', 'wheel_reward.nav_profile': 'Perfil',
        'manifest.cat_love': 'Amor', 'manifest.cat_money': 'Dinheiro', 'manifest.cat_health': 'Saúde', 'manifest.cat_career': 'Carreira', 'manifest.cat_spiritual': 'Alma', 'manifest.phase_full': 'Fase da Lua Cheia', 'manifest.energy_release': 'Energia: Liberação & Conclusão', 'manifest.title_release': 'Liberte & Solte', 'manifest.sub_release': 'Entregue à luz prateada da lua o que não serve mais ao seu caminho mais elevado.', 'manifest.placeholder_release': 'O que você está pronto para liberar ao universo?', 'manifest.hint_release': 'Solte. Entregue. Seja livre.', 'manifest.btn_release': 'Liberar ao Universo', 'manifest.sent_release': 'Liberado ao Universo', 'manifest.sent_sub_release': 'Sua intenção está sendo tecida no tecido cósmico', 'manifest.phase_new': 'Fase da Lua Nova', 'manifest.energy_new': 'Energia: Novas Intenções', 'manifest.title_new': 'Novas Intenções', 'manifest.sub_new': 'Plante seus desejos cósmicos na escuridão fértil do novo ciclo.', 'manifest.placeholder_new': 'Que sementes você está pronto para plantar hoje?', 'manifest.hint_new': 'Plante a semente. Confie no cosmos.', 'manifest.btn_new': 'Plantar Minha Semente', 'manifest.sent_new': 'Semente Plantada no Cosmos', 'manifest.sent_sub_new': 'Sua intenção está criando raízes na escuridão fértil', 'manifest.energy_waning': 'Energia: Minguante & Liberadora', 'manifest.energy_waxing': 'Energia: Crescente & Construtora', 'manifest.title_cosmic': 'Portal Cósmico', 'manifest.sub_cosmic': 'Vibre na frequência dos seus desejos.', 'manifest.placeholder_cosmic': 'Escreva sua intenção ao universo...', 'manifest.hint_cosmic': 'Seja específico. Sinta a vibração.', 'manifest.btn_cosmic': 'Enviar ao Universo', 'manifest.sent_cosmic': 'Enviado ao Universo', 'manifest.sent_sub_cosmic': 'Sua intenção agora é energia cósmica'
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
