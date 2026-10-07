/* ============================================================
   voucher.js — logic khusus tool Voucher Leniency saja.
   Butuh js/common.js sudah dimuat lebih dulu (pakai HT.copyText,
   HT.flashButton).
   ============================================================ */

(function () {
  const voucherNominal = document.getElementById('voucherNominal');
  const userType = document.getElementById('userType');
  const voucherPercent = document.getElementById('voucherPercent');
  const voucherMin = document.getElementById('voucherMin');
  const voucherMax = document.getElementById('voucherMax');
  const voucherResultOut = document.getElementById('voucherResultOut');
  const voucherResultSub = document.getElementById('voucherResultSub');
  const voucherTemplateOut = document.getElementById('voucherTemplateOut');
  const copyTemplateBtn = document.getElementById('copyTemplateBtn');

  const voucherDefaults = {
    vip: { percent: 20, min: 10000, max: 50000 },
    reguler: { percent: 10, min: 5000, max: 20000 }
  };

  function formatRupiah(n) {
    return 'Rp' + Math.round(n || 0).toLocaleString('id-ID');
  }

  function applyVoucherDefaults() {
    const d = voucherDefaults[userType.value];
    voucherPercent.value = d.percent;
    voucherMin.value = d.min;
    voucherMax.value = d.max;
  }

  function voucherRecalc() {
    const nominal = parseInt(voucherNominal.value, 10) || 0;
    const percent = parseFloat(voucherPercent.value) || 0;
    const min = parseFloat(voucherMin.value) || 0;
    const max = parseFloat(voucherMax.value) || 0;

    let result = nominal * (percent / 100);
    if (min > 0) result = Math.max(result, min);
    if (max > 0) result = Math.min(result, max);
    result = Math.floor(result);

    voucherResultOut.textContent = formatRupiah(result);
    voucherResultSub.textContent = `${percent}% dari ${formatRupiah(nominal)}, dibatasi ${formatRupiah(min)} \u2013 ${formatRupiah(max)}`;

    const jenisLabel = userType.value === 'vip' ? 'VIP' : 'Reguler';
    const amountStr = formatRupiah(result);

    voucherTemplateOut.textContent =
`Hi Team,

Mohon dibantu approve voucher kompensasi sebesar ${amountStr},- untuk kendala XXX, dengan data berikut:

(+) Case ID: #{Case ID}
(+) Username: #{CS User Name}
(+) User ID: XXX
(+) Amount voucher yang akan diberikan : ${amountStr} ,-
(+) Nomor pesanan : #{Order SN}
(+) Jenis User: ${jenisLabel}

Thanks team`;
  }

  voucherNominal.addEventListener('input', () => {
    const digitsOnly = voucherNominal.value.replace(/[^0-9]/g, '');
    if (voucherNominal.value !== digitsOnly) voucherNominal.value = digitsOnly;
    voucherRecalc();
  });

  userType.addEventListener('change', () => {
    applyVoucherDefaults();
    voucherRecalc();
  });

  [voucherPercent, voucherMin, voucherMax].forEach(el => el.addEventListener('input', voucherRecalc));

  applyVoucherDefaults();
  voucherRecalc();

  copyTemplateBtn.addEventListener('click', async () => {
    await HT.copyText(voucherTemplateOut.textContent);
    HT.flashButton(copyTemplateBtn, copyTemplateBtn.querySelector('.txt'), 'Disalin!', 'Salin Template');
  });
})();

// ---- salin nominal hasil voucher ----
(function () {
  const btn = document.getElementById('copyVoucherBtn');
  const out = document.getElementById('voucherResultOut');
  btn.addEventListener('click', async () => {
    await HT.copyText(out.textContent);
    HT.flashButton(btn, btn.querySelector('.txt'), 'Disalin!', 'Salin');
  });
})();
