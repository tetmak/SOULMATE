/**
 * Input validation ve sanitization yardimcilari.
 */

/**
 * Metin sanitize et: trim, max uzunluk, HTML tag'lerini strip et.
 * @param {string} str
 * @param {number} maxLen - Maksimum karakter sayisi
 * @returns {string|null} - Bos veya gecersizse null
 */
export function sanitizeText(str, maxLen) {
    if (typeof str !== 'string') return null;
    // HTML tag'lerini kaldir
    let clean = str.replace(/<[^>]*>/g, '').trim();
    if (clean.length === 0) return null;
    if (maxLen && clean.length > maxLen) {
        clean = clean.slice(0, maxLen);
    }
    return clean;
}

/**
 * UUID v4 format dogrulama.
 */
export function validateUUID(str) {
    if (typeof str !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Enum deger dogrulama.
 * @param {string} value
 * @param {string[]} allowed - Izin verilen degerler
 */
export function validateEnum(value, allowed) {
    if (typeof value !== 'string') return false;
    return allowed.includes(value);
}

/**
 * Pagination parametrelerini dogrula.
 * @param {string|undefined} cursor - UUID cursor
 * @param {string|number|undefined} limit - Sayi limiti
 * @param {number} maxLimit - Maksimum izin verilen limit
 * @returns {{ cursor: string|null, limit: number }}
 */
export function validatePagination(cursor, limit, maxLimit) {
    maxLimit = maxLimit || 50;
    let parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) parsedLimit = 20;
    if (parsedLimit > maxLimit) parsedLimit = maxLimit;

    let parsedCursor = null;
    if (cursor && validateUUID(cursor)) {
        parsedCursor = cursor;
    }

    return { cursor: parsedCursor, limit: parsedLimit };
}

/**
 * Pozitif integer dogrulama.
 */
export function validatePositiveInt(value) {
    const num = parseInt(value, 10);
    return !isNaN(num) && num > 0 ? num : null;
}
