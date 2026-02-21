/**
 * KADER — API Base URL Helper
 * Native app (Capacitor) ortamında API çağrılarını Vercel'e yönlendirir.
 */
(function() {
  var isNative = window.location.protocol === 'capacitor:' ||
                 window.location.protocol === 'ionic:' ||
                 window.location.hostname === 'localhost' ||
                 window.location.protocol === 'file:' ||
                 (typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  window.__KADER_API_BASE = isNative ? 'https://soulmate-kohl.vercel.app' : '';
})();
