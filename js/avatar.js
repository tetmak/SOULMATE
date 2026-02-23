/**
 * NUMERAEL — Avatar Utility Module
 * Merkezi avatar URL çözümleme. Tüm sayfalar bu modülü kullanır.
 * Öncelik: avatar_url (custom photo) → cinsiyet bazlı default.
 */
(function() {
    'use strict';

    var MALE_PHOTO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuOsAz49QL47Y42kzevX6C-TTqnQcn-fKw9bm9U03OA6_buy44Ic8bt_wBUtcV1MJ5sSb6R8X_DJ-8lXNkSzsIERq3NcoxgBJpX1j8AHhsCx98dsslHkQKdYdaF2cK9NTMVQ_OIb_O9MJ9U-ow3guDO7mGY7CZqxCnsEYsQtxoblSjPmW1y00tP0EZpQ-aEvg3xi3jiQQYomz46nlrrOFmED0f3iCzkJ1soKbGh7PjJ9Gt3wTvCduVO9zVt_o3gQ0nIpmOLHD736c';
    var FEMALE_PHOTO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwVIwPfxW7vQTdT6_K5paisRbNWYqgoOiwgoxaVjFXEkx2Hocf55LzYmz1rXyDXknrbMiB8X59nhq-ptzZsewBCHh9Bi4547zbTT3ZGBQPNn6awMcDKio5VTuc-gUc0V9YR2bAFRCjLTR5wqzwERZcGYXOLcXEN3lp4szkNmpf1Pd1-9lj37_4nq74Sfu5spZUv6QDfvpVwS7fZTl7cHKYVI8htJIgEwQ7EgFwZuHn8KfRUOgWtjHWZ3pu_qj4AgsK0fYYsgjY2_g';
    var FEMALE_NAMES = ['şevval','ayşe','leyla','fatma','zeynep','elif','meryem','selin','buse','esra','merve','büşra','naz','nur','ece','derya','gül','pınar','havva','hatice','emine','hülya','sultan','yasemin','melek','cemre','defne','ilayda','irem','cansu','dilara','gamze','gizem','tuğba','ebru','aslı','özge','damla','beyza','aysun','sevgi','sibel','mine','deniz','ceren'];

    /**
     * Cinsiyet bazlı default avatar URL döndür.
     */
    function getDefaultAvatar(name, gender) {
        if (gender === 'female') return FEMALE_PHOTO;
        if (gender === 'male') return MALE_PHOTO;
        var low = (name || '').toLowerCase().replace(/\s+/g, '');
        var isFem = FEMALE_NAMES.some(function(fn) { return low.startsWith(fn); });
        return isFem ? FEMALE_PHOTO : MALE_PHOTO;
    }

    /**
     * Avatar URL çözümle.
     * @param {Object} opts - { avatarUrl, name, gender }
     * @returns {string} Avatar URL
     */
    function getAvatarUrl(opts) {
        opts = opts || {};
        if (opts.avatarUrl) return opts.avatarUrl;
        return getDefaultAvatar(opts.name, opts.gender);
    }

    /**
     * Container element içine avatar img yerleştir.
     * @param {HTMLElement} el - container div
     * @param {Object} opts - { avatarUrl, name, gender }
     */
    function setAvatar(el, opts) {
        if (!el) return;
        var url = getAvatarUrl(opts);
        el.innerHTML = '<img src="' + url + '" alt="' + (opts.name || '') + '" class="w-full h-full object-cover">';
    }

    /**
     * Mevcut kullanıcının avatar URL'ini localStorage'dan al.
     */
    function getMyAvatarUrl() {
        var ud = null;
        try { ud = JSON.parse(localStorage.getItem('numerael_user_data') || 'null'); } catch(e) {}
        if (!ud) return MALE_PHOTO;
        return getAvatarUrl({
            avatarUrl: ud.avatarUrl || null,
            name: ud.name,
            gender: ud.gender
        });
    }

    window.avatarUtil = {
        getAvatarUrl: getAvatarUrl,
        getDefaultAvatar: getDefaultAvatar,
        setAvatar: setAvatar,
        getMyAvatarUrl: getMyAvatarUrl,
        MALE_PHOTO: MALE_PHOTO,
        FEMALE_PHOTO: FEMALE_PHOTO,
        FEMALE_NAMES: FEMALE_NAMES
    };

})();
