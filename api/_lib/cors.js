/**
 * CORS middleware — guvenli origin whitelist.
 * Eger OPTIONS preflight ise true doner (handler return etmeli).
 */

const ALLOWED_ORIGINS = [
    'https://soulmate-kohl.vercel.app',
    'capacitor://localhost',
    'https://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5173'
];

export function handleCors(req, res) {
    const origin = req.headers.origin || '';

    // Origin whitelist kontrolu
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
        // Server-to-server cagrilar veya same-origin (Vercel)
        res.setHeader('Access-Control-Allow-Origin', 'https://soulmate-kohl.vercel.app');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}
