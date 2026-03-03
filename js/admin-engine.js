(function() {
    'use strict';
    var API_BASE = window.__NUMERAEL_API_BASE || '';
    async function _headers() {
        var h = { 'Content-Type': 'application/json' };
        try { var s = await window.auth.getSession();
            if (s && s.access_token) h['Authorization'] = 'Bearer ' + s.access_token;
        } catch(e) {} return h; }
    async function _get(url) { var h=await _headers(); var r=await fetch(API_BASE+url,{headers:h}); return r.json(); }
    async function _post(url,body) { var h=await _headers(); var r=await fetch(API_BASE+url,{method:'POST',headers:h,body:JSON.stringify(body)}); return r.json(); }
    window.adminEngine = {
        getReports: function(st,cur,lim) { var q='/api/admin-reports?status='+(st||'pending'); if(cur)q+='&cursor='+cur; if(lim)q+='&limit='+lim; return _get(q); },
        actionReport: function(id,act,note) { return _post('/api/admin-reports',{reportId:id,action:act,note:note}); },
        getUser: function(id) { return _get('/api/admin-users?id='+id); },
        searchUsers: function(q,lim) { return _get('/api/admin-users?q='+encodeURIComponent(q)+'&limit='+(lim||20)); },
        banUser: function(id,reason) { return _post('/api/admin-users',{userId:id,action:'ban',reason:reason}); },
        unbanUser: function(id) { return _post('/api/admin-users',{userId:id,action:'unban'}); },
        shadowbanUser: function(id,reason) { return _post('/api/admin-users',{userId:id,action:'shadowban',reason:reason}); },
        setRole: function(id,role) { return _post('/api/admin-users',{userId:id,action:'set_role',role:role}); },
        hideContent: function(type,id) { return _post('/api/admin-content',{action:'hide',targetType:type,targetId:id}); },
        unhideContent: function(type,id) { return _post('/api/admin-content',{action:'unhide',targetType:type,targetId:id}); },
        deleteContent: function(type,id) { return _post('/api/admin-content',{action:'delete',targetType:type,targetId:id}); },
        getStats: function() { return _get('/api/admin-stats'); }
    };
})();
