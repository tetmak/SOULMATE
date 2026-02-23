/**
 * NUMERAEL — TTS API Endpoint (Vercel Serverless)
 * OpenAI TTS API'sine sunucu taraflı proxy.
 * API anahtarını sunucu tarafında ekler, istemciye ses verisi döndürür.
 *
 * Kullanım: POST /api/tts
 * Gövde: { model, voice, input, response_format }
 */
export default async function handler(req, res) {
    // CORS başlıkları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Yalnızca POST metodu desteklenir' });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API anahtarı yapılandırılmamış' });
        }

        const { model, voice, input, response_format } = req.body;

        if (!input || typeof input !== 'string') {
            return res.status(400).json({ error: 'Geçersiz veya eksik giriş metni' });
        }

        // Kötüye kullanımı önlemek için giriş uzunluğunu sınırla
        const trimmedInput = input.slice(0, 4096);

        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: model || 'tts-1',
                voice: voice || 'nova',
                input: trimmedInput,
                response_format: response_format || 'mp3'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: 'OpenAI TTS hatası: ' + errorText });
        }

        // Ses yanıtını aktar
        const contentType = response.headers.get('content-type') || 'audio/mpeg';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return res.status(200).send(buffer);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
