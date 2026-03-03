import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from './supabase.js';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * JWT dogrulama ve kullanici bilgisi cekme.
 *
 * @param {object} req - HTTP request
 * @returns {{ userId: string, role: string, isSuspended: boolean, token: string } | { error: string, status: number }}
 */
export async function verifyAuth(req) {
    const header = req.headers.authorization || req.headers.Authorization || '';
    if (!header.startsWith('Bearer ')) {
        return { error: 'missing_token', status: 401 };
    }
    const token = header.slice(7);

    if (!JWT_SECRET) {
        // JWT_SECRET yoksa Supabase'in kendi dogrulama mekanizmasini kullan
        try {
            const supabase = getSupabaseAdmin();
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (error || !user) {
                return { error: 'invalid_token', status: 401 };
            }
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, is_suspended')
                .eq('id', user.id)
                .single();

            return {
                userId: user.id,
                role: (profile && profile.role) || 'user',
                isSuspended: (profile && profile.is_suspended) || false,
                token
            };
        } catch (e) {
            return { error: 'auth_failed', status: 401 };
        }
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        const userId = payload.sub;
        if (!userId) {
            return { error: 'invalid_token', status: 401 };
        }

        // Profil'den rol ve suspension durumunu cek
        const supabase = getSupabaseAdmin();
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, is_suspended')
            .eq('id', userId)
            .single();

        return {
            userId,
            role: (profile && profile.role) || 'user',
            isSuspended: (profile && profile.is_suspended) || false,
            token
        };
    } catch (e) {
        // Token suresi dolmus veya gecersiz
        if (e.name === 'TokenExpiredError') {
            return { error: 'token_expired', status: 401 };
        }
        return { error: 'invalid_token', status: 401 };
    }
}

/**
 * Auth dogrulama guard — basarisizsa response gonderir, true/false doner.
 */
export function requireAuth(authResult, res) {
    if (authResult.error) {
        res.status(authResult.status).json({ error: authResult.error });
        return false;
    }
    if (authResult.isSuspended) {
        res.status(403).json({ error: 'account_suspended' });
        return false;
    }
    return true;
}

/**
 * Admin guard — sadece role='admin' veya 'moderator' olan kullanicilar.
 */
export function requireAdmin(authResult, res) {
    if (!requireAuth(authResult, res)) return false;
    if (authResult.role !== 'admin' && authResult.role !== 'moderator') {
        res.status(403).json({ error: 'admin_required' });
        return false;
    }
    return true;
}
