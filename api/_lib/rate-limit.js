/**
 * Rate Limiting — In-memory Map + opsiyonel Supabase persistent storage.
 *
 * Vercel serverless instance'lari kisa omurlu oldugu icin in-memory
 * tam guvenilir degil ama cogu durumda yeterli. Kritik limitler icin
 * Supabase rate_limits tablosu da kullanilabilir.
 */

// In-memory rate limit store
const rateLimitMap = new Map();

// Temizlik: 5 dakikada bir suresi dolmus kayitlari sil
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
        if (entry.resetAt <= now) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Rate limit kontrolu.
 *
 * @param {string} key - Benzersiz anahtar (ornek: 'ai:userId', 'msg:userId', 'ip:1.2.3.4')
 * @param {number} maxRequests - Pencere icinde izin verilen maks istek
 * @param {number} windowSeconds - Zaman penceresi (saniye)
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(key, maxRequests, windowSeconds) {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    let entry = rateLimitMap.get(key);

    if (!entry || entry.resetAt <= now) {
        // Yeni pencere baslat
        entry = {
            count: 1,
            resetAt: now + windowMs
        };
        rateLimitMap.set(key, entry);
        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetAt: entry.resetAt
        };
    }

    entry.count++;
    if (entry.count > maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt
        };
    }

    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetAt: entry.resetAt
    };
}

/**
 * IP adresini request'ten cikar (Vercel proxy arkasinda).
 */
export function getClientIP(req) {
    return req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}
