/**
 * Kriz Algilama Modulu - Turkce kriz anahtar kelimeleri tespit eder.
 * Kullanici mesajlarinda intihar/kendine zarar verme ifadeleri
 * tespit edildiginde OpenAI cagrisi yerine acil yardim bilgisi doner.
 */

const CRISIS_PATTERNS = [
    /intihar/i,
    /kendimi\s+öldür/i,
    /kendimi\s+oldur/i,
    /yaşamak\s+istemi/i,
    /yasamak\s+istemi/i,
    /hayatım\s*bit/i,
    /hayatim\s*bit/i,
    /her\s+şey\s+bitsin/i,
    /her\s+sey\s+bitsin/i,
    /ölmek\s+isti/i,
    /olmek\s+isti/i,
    /canıma\s+kıy/i,
    /canima\s+kiy/i,
    /kendime\s+zarar/i,
    /hayata\s+son/i,
    /yaşamak\s+anlamsız/i,
    /yasamak\s+anlamsiz/i
];

const CRISIS_RESPONSE = [
    "Seni duyuyorum ve bu hislerin ne kadar ağır olabileceğini anlıyorum. Lütfen yalnız olmadığını bil.",
    "",
    "🆘 **Acil Yardım Hatları:**",
    "",
    "📞 **182 — İntihar Önleme Hattı** (7/24 ücretsiz)",
    "📞 **112 — Acil Yardım**",
    "📞 **ALO 184 — Sabim Hattı** (Ruh sağlığı destek)",
    "",
    "Bu uygulama profesyonel psikolojik destek sağlayamaz. Lütfen yukarıdaki hatlardan birini arayarak uzman desteği al. Seninle konuşacak, seni dinleyecek insanlar var.",
    "",
    "⚠️ *Bu uygulama eğlence ve kişisel gelişim amacılıdır; tıbbi veya psikolojik danışmanlık yerine geçmez.*"
].join("\n");

/**
 * Metinde kriz ifadesi tespit eder.
 *
 * @param {string} text - Kontrol edilecek metin
 * @returns {{ isCrisis: boolean, response: string|null }}
 */
export function detectCrisis(text) {
    if (typeof text !== "string" || text.length === 0) {
        return { isCrisis: false, response: null };
    }

    const normalized = text.toLowerCase();

    for (const pattern of CRISIS_PATTERNS) {
        if (pattern.test(normalized)) {
            return { isCrisis: true, response: CRISIS_RESPONSE };
        }
    }

    return { isCrisis: false, response: null };
}
