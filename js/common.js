/* ============================================================
   common.js — logic yang dipakai di SEMUA tools:
   - switch antar halaman/tools di sidebar
   - toggle dark mode
   - helper clipboard (copy & paste) + animasi tombol "copied"
     dipakai oleh voucher.js, sla.js, retry-reallocate.js lewat
     namespace global `HT`

   File ini HARUS dimuat paling awal (sebelum js/voucher.js,
   js/sla.js, js/retry-reallocate.js) karena file-file itu
   memakai fungsi HT.* di bawah ini.
   ============================================================ */

window.HT = window.HT || {};

(function () {
  // ---- page switching ----
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item[data-page]').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + item.dataset.page).classList.add('active');
    });
  });

  // ---- theme ----
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
  });

  // ---- clipboard helpers (dipakai tools lain lewat window.HT) ----

  // salin teks ke clipboard, dengan fallback untuk browser lama
  HT.copyText = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (e2) {
        return false;
      }
    }
  };

  // ambil teks dari clipboard (dipakai tombol paste), null kalau gagal/ditolak
  HT.pasteText = async function () {
    try {
      return await navigator.clipboard.readText();
    } catch (e) {
      return null;
    }
  };

  // animasi tombol "copied"/"pasted": ganti class + label sebentar lalu balik lagi
  HT.flashButton = function (btn, textEl, onLabel, offLabel, duration) {
    duration = duration || 1500;
    btn.classList.add('copied');
    if (textEl) textEl.textContent = onLabel;
    setTimeout(() => {
      btn.classList.remove('copied');
      if (textEl) textEl.textContent = offLabel;
    }, duration);
  };
})();
