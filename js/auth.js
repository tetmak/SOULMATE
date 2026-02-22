/**
 * AUTHENTICATION MODULE
 * Handlers for signup, login, logout, and session management
 */
var auth = {
    async signUp(email, password) {
        if (!window.supabaseClient) throw new Error('Supabase not available');
        var res = await window.supabaseClient.auth.signUp({ email: email, password: password });
        if (res.error) throw res.error;
        return res.data;
    },

    async signIn(email, password) {
        if (!window.supabaseClient) throw new Error('Supabase not available');
        var res = await window.supabaseClient.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw res.error;
        return res.data;
    },

    async signInWithGoogle() {
        if (!window.supabaseClient) throw new Error('Supabase not available');
        var res = await window.supabaseClient.auth.signInWithOAuth({ provider: 'google' });
        if (res.error) throw res.error;
        return res.data;
    },

    async signOut() {
        if (!window.supabaseClient) return;
        var res = await window.supabaseClient.auth.signOut();
        if (res.error) throw res.error;
    },

    async getSession() {
        if (!window.supabaseClient) return null;
        var res = await window.supabaseClient.auth.getSession();
        if (res.error) return null;
        return res.data.session;
    },

    onAuthStateChange(callback) {
        if (!window.supabaseClient) return { data: { subscription: { unsubscribe: function(){} } } };
        return window.supabaseClient.auth.onAuthStateChange(function(event, session) {
            callback(event, session);
        });
    },

    async checkSession() {
        var currentPage = window.location.pathname.split('/').pop() || 'index.html';

        var authPages = [
            'mystic_splash_screen.html',
            'cosmic_onboarding_welcome.html',
            'mystic_sign_up_screen.html',
            'branded_celestial_splash_screen.html',
            'index.html'
        ];

        var publicPages = authPages.concat(['data-ready_birth_form.html']);

        var session = null;
        try {
            session = await this.getSession();
            // Session varsa güveniyoruz — getUser() ile doğrulama YAPMIYORUZ
            // Supabase SDK zaten token'ı otomatik refresh ediyor
            // getUser() ağ hatalarında session'ı öldürüyordu — bu mobilde sürekli sorun çıkarıyordu
        } catch(e) {
            session = null;
        }

        // Session var + auth sayfasındaysa → ana sayfaya yönlendir
        if (session && authPages.indexOf(currentPage) !== -1) {
            window.location.href = 'mystic_numerology_home_1.html';
            return;
        }

        // Session var ama localStorage boş — Supabase'den doldur
        if (session && publicPages.indexOf(currentPage) === -1) {
            var existingData = null;
            try { existingData = JSON.parse(localStorage.getItem('numerael_user_data')); } catch(e) {}
            
            if (!existingData || !existingData.name || !existingData.birthDate) {
                try {
                    var userId = session.user ? session.user.id : null;
                    if (userId && window.supabaseClient) {
                        var profResult = await window.supabaseClient
                            .from('profiles')
                            .select('*')
                            .eq('id', userId)
                            .single();
                        var prof = profResult.data;
                        if (prof && (prof.full_name || prof.name) && prof.birth_date) {
                            localStorage.setItem('numerael_user_data', JSON.stringify({
                                name: prof.full_name || prof.name,
                                birthDate: prof.birth_date,
                                birthTime: prof.birth_time || '',
                                birthPlace: prof.birth_place || '',
                                gender: prof.gender || 'unknown'
                            }));
                            console.log('[Auth] Supabase profili localStorage\'a yazıldı');
                        }
                    }
                } catch(hydErr) { console.warn('[Auth] Profil hydrate hatası:', hydErr); }
            }
        }

        // Session yok + korumalı sayfadaysa → login'e yönlendir
        if (!session && publicPages.indexOf(currentPage) === -1) {
            window.location.href = 'mystic_sign_up_screen.html';
        }
    }
};

// authReady: Supabase session recover olduktan sonra resolve olan promise.
// Diğer sayfalar (cosmic_match vb.) session kontrolünden önce bunu beklemeli.
var _authResolve;
auth._ready = new Promise(function(resolve) { _authResolve = resolve; });
auth.whenReady = function() { return auth._ready; };

window.auth = auth;

document.addEventListener('DOMContentLoaded', function() {
    // onAuthStateChange INITIAL_SESSION event'ini bekle — Supabase'in
    // session'ı localStorage'dan recover etmesini garanti eder.
    // KRITIK: Sadece INITIAL_SESSION'da checkSession() çağır.
    // SIGNED_IN/SIGNED_OUT event'lerinde çağırma! Çünkü:
    // - Kullanıcı sign_up sayfasında sign up yapınca SIGNED_IN event'i fırlatılır
    // - checkSession() "session var + auth sayfası" görüp HOME'a yönlendirir
    // - Sign up sayfasının kendi yönlendirmesi (→ birth form) hiç çalışamaz
    // - Bu race condition yüzünden yeni kullanıcılar birth form'u hiç görmüyordu
    if (window.supabaseClient && window.supabaseClient.auth) {
        var done = false;
        var sub = window.supabaseClient.auth.onAuthStateChange(function(event) {
            if (done) return;
            if (event === 'INITIAL_SESSION') {
                // Sayfa ilk yüklendiğinde session recover oldu — yönlendirme yap
                done = true;
                try { sub.data.subscription.unsubscribe(); } catch(e) {}
                _authResolve();
                auth.checkSession();
            } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                // Aktif login/signup — sayfanın kendi kodu yönlendirmeyi yapacak
                done = true;
                try { sub.data.subscription.unsubscribe(); } catch(e) {}
                _authResolve();
                // checkSession() ÇAĞIRMA — race condition'ı önle
            }
        });
        // Fallback: 3 saniye içinde event gelmezse yine de kontrol et
        setTimeout(function() {
            if (!done) {
                done = true;
                try { sub.data.subscription.unsubscribe(); } catch(e) {}
                _authResolve();
                auth.checkSession();
            }
        }, 3000);
    } else {
        _authResolve();
        auth.checkSession();
    }
});
