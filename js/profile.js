/**
 * PROFILE & NUMEROLOGY MODULE
 * Profile loading/saving and Life Path Number calculations
 */

var profile = {
    // Load user profile
    getProfile: async function(userId) {
        var result = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (result.error && result.error.code !== 'PGRST116') throw result.error; // PGRST116 is code for no rows found
        return result.data;
    },

    // Save or update profile (full_name, birth_date)
    updateProfile: async function(userId, updates) {
        var upsertData = { id: userId, updated_at: new Date().toISOString() };
        var keys = Object.keys(updates);
        for (var k = 0; k < keys.length; k++) {
            upsertData[keys[k]] = updates[keys[k]];
        }

        var result = await window.supabaseClient
            .from('profiles')
            .upsert(upsertData);

        if (result.error) throw result.error;
        return result.data;
    },

    // Calculate Life Path Number
    // Sum all digits of the birth date until a single digit (or master number 11, 22) is reached
    calculateLifePathNumber: function(birthDateStr) {
        if (!birthDateStr) return null;

        var digits = birthDateStr.replace(/\D/g, '');
        var sum = digits.split('').reduce(function(acc, digit) { return acc + parseInt(digit); }, 0);

        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            sum = sum.toString().split('').reduce(function(acc, digit) { return acc + parseInt(digit); }, 0);
        }

        return sum;
    },

    // ─── CONNECTIONS (Saved Contacts — Supabase) ──────────────────

    // Helper: get userId
    _getUserId: async function() {
        var session = await window.auth.getSession();
        return session && session.user ? session.user.id : null;
    },

    // Helper: localStorage key (fallback/cache)
    getStorageKey: async function() {
        var userId = await this._getUserId();
        return 'numerael_connections_' + (userId || 'guest');
    },

    // Save a new connection (another person) — Supabase + localStorage cache
    saveConnection: async function(data) {
        var userId = await this._getUserId();
        var lp = this.calculateLifePathNumber(data.birthDate);
        var newConn = {
            id: Date.now().toString(),
            fullName: data.fullName,
            birthDate: data.birthDate,
            gender: data.gender || 'unknown',
            lifePath: lp,
            createdAt: new Date().toISOString()
        };

        // Supabase'e kaydet
        if (userId && window.supabaseClient) {
            try {
                var res = await window.supabaseClient.from('saved_contacts').insert({
                    user_id: userId,
                    full_name: data.fullName,
                    birth_date: data.birthDate || null,
                    gender: data.gender || 'unknown',
                    life_path: lp
                }).select();
                if (res.data && res.data[0]) {
                    newConn.id = res.data[0].id;
                }
            } catch(e) { console.warn('[Profile] Supabase contact kaydetme hatası:', e.message); }
        }

        // localStorage cache güncelle
        var key = await this.getStorageKey();
        var connections = [];
        try { connections = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
        connections.push(newConn);
        try { localStorage.setItem(key, JSON.stringify(connections)); } catch(e) {}
        return newConn;
    },

    // Get all connections — Supabase first, localStorage fallback
    getConnections: async function() {
        var userId = await this._getUserId();

        // Supabase'den çek (tek doğru kaynak)
        if (userId && window.supabaseClient) {
            try {
                var res = await window.supabaseClient.from('saved_contacts')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true });
                if (res.data) {
                    var contacts = res.data.map(function(c) {
                        return {
                            id: c.id,
                            fullName: c.full_name,
                            birthDate: c.birth_date,
                            gender: c.gender || 'unknown',
                            lifePath: c.life_path,
                            createdAt: c.created_at
                        };
                    });
                    // localStorage cache güncelle
                    var key = 'numerael_connections_' + userId;
                    try { localStorage.setItem(key, JSON.stringify(contacts)); } catch(e) {}
                    return contacts;
                }
            } catch(e) {
                console.warn('[Profile] Supabase contacts çekme hatası (offline?):', e.message);
            }
        }

        // Fallback: localStorage cache
        var key = await this.getStorageKey();
        try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { return []; }
    },

    // Get connection by name (slugified or simple match)
    getConnectionDetail: async function(name) {
        var connections = await this.getConnections();
        var lowerName = name.toLowerCase();
        for (var i = 0; i < connections.length; i++) {
            if (connections[i].fullName && connections[i].fullName.toLowerCase().indexOf(lowerName) !== -1) {
                return connections[i];
            }
        }
        return null;
    },

    // Delete connection by name — Supabase + localStorage
    deleteConnection: async function(fullName) {
        var userId = await this._getUserId();

        // Supabase'den sil
        if (userId && window.supabaseClient) {
            try {
                await window.supabaseClient.from('saved_contacts')
                    .delete()
                    .eq('user_id', userId)
                    .eq('full_name', fullName);
            } catch(e) { console.warn('[Profile] Supabase contact silme hatası:', e.message); }
        }

        // localStorage cache güncelle
        var key = await this.getStorageKey();
        var connections = [];
        try { connections = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) {}
        connections = connections.filter(function(c) { return c.fullName !== fullName; });
        try { localStorage.setItem(key, JSON.stringify(connections)); } catch(e) {}
        return true;
    },

    // Show loading spinner
    toggleLoading: function(show) {
        var loader = document.getElementById('supabase-loader');
        if (!loader && show) {
            loader = document.createElement('div');
            loader.id = 'supabase-loader';
            loader.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;">' +
                '<div style="width:50px;height:50px;border:5px solid #fff;border-top:5px solid #6366f1;border-radius:50%;animation:spin 1s linear infinite;"></div>' +
                '</div>' +
                '<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>';
            document.body.appendChild(loader);
        } else if (loader && !show) {
            loader.remove();
        }
    }
};

window.profile = profile;
