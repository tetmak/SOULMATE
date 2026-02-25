/**
 * NUMERAEL — Soulmate Share Card
 * Kart görselini oluşturur, Instagram/WhatsApp/Gallery paylaşım desteği sağlar.
 */
(function() {
  'use strict';

  // ─── html2canvas lazy load ───────────────────────────────────
  var h2cLoaded = false;
  var h2cPromise = null;

  function loadHtml2Canvas() {
    if (h2cLoaded && window.html2canvas) return Promise.resolve();
    if (h2cPromise) return h2cPromise;
    h2cPromise = new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = function() { h2cLoaded = true; resolve(); };
      s.onerror = function() { reject(new Error('html2canvas yüklenemedi')); };
      document.head.appendChild(s);
    });
    return h2cPromise;
  }

  // ─── Kartı görüntüye çevir ──────────────────────────────────
  function captureCard() {
    return new Promise(function(resolve, reject) {
      var cardEl = document.querySelector('#sm-sheet > div[style*="aspect-ratio"]');
      if (!cardEl) {
        // Fallback: sm-sheet içindeki ilk büyük div
        var sheet = document.getElementById('sm-sheet');
        if (sheet) {
          var divs = sheet.querySelectorAll(':scope > div');
          for (var i = 0; i < divs.length; i++) {
            if (divs[i].offsetHeight > 200) { cardEl = divs[i]; break; }
          }
        }
      }
      if (!cardEl) return reject(new Error('Kart bulunamadı'));

      loadHtml2Canvas().then(function() {
        return window.html2canvas(cardEl, {
          backgroundColor: '#0a0907',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false
        });
      }).then(function(canvas) {
        canvas.toBlob(function(blob) {
          if (blob) resolve(blob);
          else reject(new Error('Görüntü oluşturulamadı'));
        }, 'image/png');
      }).catch(reject);
    });
  }

  // ─── Toast mesajı ───────────────────────────────────────────
  function showToast(msg, isError) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:' +
      (isError ? '#ef4444' : '#cfa117') + ';color:' + (isError ? 'white' : '#0a0907') +
      ';padding:10px 20px;border-radius:20px;font-size:13px;font-weight:800;z-index:999;white-space:nowrap;font-family:Manrope,sans-serif';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2500);
  }

  // ─── Dosya paylaşımı (Web Share API) ────────────────────────
  function shareFile(blob, platform) {
    var file = new File([blob], 'numerael-soulmate.png', { type: 'image/png' });

    // Web Share API Level 2 destekli mi?
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      var shareData = {
        files: [file],
        title: 'Numerael — Ruh Eşi Kartı',
        text: 'Numerael ile ruh eşi uyumumuzu keşfettik! ✨'
      };
      navigator.share(shareData).then(function() {
        showToast('Paylaşıldı ✓');
      }).catch(function(err) {
        if (err.name !== 'AbortError') {
          console.warn('[Share] Share API error:', err);
          // Fallback: download
          downloadBlob(blob);
        }
      });
    } else {
      // Share API yok → platform'a göre fallback
      if (platform === 'whatsapp') {
        // WhatsApp text share fallback
        var text = encodeURIComponent('Numerael ile ruh eşi uyumumuzu keşfettik! ✨ https://numerael.app');
        window.open('https://wa.me/?text=' + text, '_blank');
      } else if (platform === 'instagram') {
        // Instagram: dosyayı indir + talimat göster
        downloadBlob(blob);
        showToast('Görsel indirildi — Instagram Stories\'e yükle');
      } else {
        downloadBlob(blob);
      }
    }
  }

  // ─── Dosya indirme ──────────────────────────────────────────
  function downloadBlob(blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'numerael-soulmate.png';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() { a.remove(); URL.revokeObjectURL(url); }, 1000);
    showToast('Galeriye kaydedildi ✓');
  }

  // ─── ANA FONKSİYONLAR ──────────────────────────────────────
  window.smOpen = function() {
    var o = document.getElementById('sm-overlay');
    var s = document.getElementById('sm-sheet');
    if (o) o.style.display = 'flex';
    if (s) setTimeout(function() { s.style.transform = 'translateY(0)'; }, 10);
    // Lazy preload html2canvas
    loadHtml2Canvas().catch(function() {});
  };

  window.smClose = function() {
    var s = document.getElementById('sm-sheet');
    if (s) s.style.transform = 'translateY(100%)';
    setTimeout(function() {
      var o = document.getElementById('sm-overlay');
      if (o) o.style.display = 'none';
    }, 400);
  };

  window.smAction = function(t) {
    if (t === 'instagram' || t === 'whatsapp' || t === 'save') {
      // Kart yakalama ve paylaşım
      showToast('Kart hazırlanıyor...');
      captureCard().then(function(blob) {
        if (t === 'save') {
          downloadBlob(blob);
        } else {
          shareFile(blob, t);
        }
      }).catch(function(err) {
        console.error('[Share] Capture error:', err);
        showToast('Kart oluşturulamadı', true);
      });
    } else if (t === 'copy') {
      // Link kopyala
      var url = window.location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function() {
          showToast('Link kopyalandı ✓');
        }).catch(function() {
          showToast('Link kopyalandı ✓');
        });
      } else {
        showToast('Link kopyalandı ✓');
      }
    } else if (t === 'other') {
      // Genel paylaşım
      captureCard().then(function(blob) {
        var file = new File([blob], 'numerael-soulmate.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'Numerael — Ruh Eşi Kartı',
            text: 'Numerael ile ruh eşi uyumumuzu keşfettik! ✨'
          }).catch(function() {});
        } else if (navigator.share) {
          navigator.share({
            title: 'Numerael — Ruh Eşi Kartı',
            text: 'Numerael ile ruh eşi uyumumuzu keşfettik! ✨',
            url: window.location.href
          }).catch(function() {});
        }
      }).catch(function() {
        if (navigator.share) {
          navigator.share({
            title: 'Numerael — Ruh Eşi Kartı',
            text: 'Numerael ile ruh eşi uyumumuzu keşfettik! ✨',
            url: window.location.href
          }).catch(function() {});
        }
      });
    }
  };

  // openSoulmateShare alias
  window.openSoulmateShare = function() {
    window.smOpen();
  };

})();
