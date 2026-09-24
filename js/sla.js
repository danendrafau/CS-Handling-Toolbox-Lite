/* ============================================================
   sla.js — logic khusus tool SLA Calculator saja.
   Butuh js/common.js sudah dimuat lebih dulu (pakai HT.copyText,
   HT.flashButton).
   ============================================================ */

(function () {
  // ---- holiday panel ----
  const holToggle = document.getElementById('holToggle');
  const holList = document.getElementById('holList');
  holToggle.addEventListener('click', () => {
    holToggle.classList.toggle('open');
    holList.classList.toggle('open');
  });

  // ---- holidays: official SKB Tiga Menteri, 2026 & 2027 ----
  const holidays = [
    "2026-01-01","2026-01-16","2026-02-17","2026-03-19","2026-03-21","2026-03-22",
    "2026-04-03","2026-04-05","2026-05-01","2026-05-14","2026-05-27","2026-05-31",
    "2026-06-01","2026-06-16","2026-08-17","2026-08-25","2026-12-25",
    "2027-01-01","2027-01-05","2027-02-06","2027-03-08","2027-03-10","2027-03-11",
    "2027-03-26","2027-03-28","2027-05-01","2027-05-06","2027-05-17","2027-05-20",
    "2027-06-01","2027-06-06","2027-08-15","2027-08-17","2027-12-25","2027-12-26"
  ];

  document.querySelectorAll('.year-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.year-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('[data-year-table]').forEach(t => {
        t.style.display = t.dataset.yearTable === tab.dataset.year ? '' : 'none';
      });
    });
  });

  const startDate = document.getElementById('startDate');
  const startTime = document.getElementById('startTime');
  const startTimeWrap = document.getElementById('startTimeWrap');
  const duration = document.getElementById('duration');
  const slaType = document.getElementById('slaType');
  const exSabtu = document.getElementById('exSabtu');
  const exMinggu = document.getElementById('exMinggu');
  const exLibur = document.getElementById('exLibur');
  const excludeWrap = document.getElementById('excludeWrap');
  const dueDateOut = document.getElementById('dueDateOut');
  const copyDueBtn = document.getElementById('copyDueBtn');
  const dueSubOut = document.getElementById('dueSubOut');
  const remainOut = document.getElementById('remainOut');
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');

  const today = new Date();
  startDate.value = today.toISOString().slice(0,10);

  function isoLocal(d) {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function isSkipDay(d, opts) {
    const day = d.getDay();
    const iso = isoLocal(d);
    if (opts.sabtu && day === 6) return true;
    if (opts.minggu && day === 0) return true;
    if (opts.libur && holidays.includes(iso)) return true;
    return false;
  }

  function fmtDateFull(d) {
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function fmtDateTimeFull(d) {
    const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return fmtDateFull(d) + ', ' + time + ' WIB';
  }

  function workingDaysBetween(from, to, opts) {
    let count = 0;
    let cur = new Date(from); cur.setHours(0,0,0,0);
    let target = new Date(to); target.setHours(0,0,0,0);
    const dir = target >= cur ? 1 : -1;
    while (cur.getTime() !== target.getTime()) {
      cur.setDate(cur.getDate() + dir);
      if (!isSkipDay(cur, opts)) count++;
    }
    return count;
  }

  function recalc() {
    const type = slaType.value;
    const dur = parseFloat(duration.value) || 0;
    const opts = { sabtu: exSabtu.checked, minggu: exMinggu.checked, libur: exLibur.checked };
    const showTime = (type === 'jam' || type === 'jam24');

    startTimeWrap.style.display = showTime ? 'flex' : 'none';
    excludeWrap.style.display = 'flex';

    if (!startDate.value) return;
    const timeStr = showTime ? (startTime.value || '00:00') : '00:00';
    let cursor = new Date(startDate.value + 'T' + timeStr + ':00');
    let due = new Date(cursor);

    if (type === 'kalender') {
      due.setDate(due.getDate() + dur);
    } else if (type === 'kerja') {
      let counted = 0;
      while (counted < dur) {
        due.setDate(due.getDate() + 1);
        if (!isSkipDay(due, opts)) counted++;
      }
    } else { // jam or jam24
      let remaining = type === 'jam24' ? dur * 24 : dur;
      while (remaining > 0) {
        if (isSkipDay(due, opts)) {
          due.setDate(due.getDate() + 1);
          due.setHours(0,0,0,0);
          continue;
        }
        due.setHours(due.getHours() + 1);
        remaining -= 1;
      }
    }

    dueDateOut.textContent = showTime ? fmtDateTimeFull(due) : fmtDateFull(due);
    const unitText = type === 'kerja' ? `${dur} hari kerja`
      : type === 'kalender' ? `${dur} hari kalender`
      : type === 'jam24' ? `${dur} × 24 jam`
      : `${dur} jam`;
    dueSubOut.textContent = `${unitText} dari ${showTime ? fmtDateTimeFull(cursor) : fmtDateFull(cursor)}`;

    const now = new Date();
    const diffMs = due - now;
    const diffH = diffMs / 3600000;

    let statusClass = 'safe', statusLabel = 'Aman';
    if (diffMs < 0) { statusClass = 'danger'; statusLabel = 'Lewat SLA'; }
    else if (diffH <= 24) { statusClass = 'warn'; statusLabel = 'Mendekati deadline'; }
    statusPill.className = 'status-pill ' + statusClass;
    statusText.textContent = statusLabel;

    const overdue = diffMs < 0;
    const sign = overdue ? '−' : '';
    if (type === 'kalender') {
      const days = Math.ceil(Math.abs(diffMs) / 86400000);
      remainOut.textContent = `${sign}${days} hari`;
    } else if (type === 'kerja') {
      const days = workingDaysBetween(now, due, opts);
      remainOut.textContent = `${sign}${Math.abs(days)} hari kerja`;
    } else {
      const absH = Math.abs(diffH);
      if (absH > 48) {
        remainOut.textContent = `${sign}${Math.floor(absH/24)} hari ${Math.round(absH%24)} jam`;
      } else {
        remainOut.textContent = `${sign}${Math.ceil(absH)} jam`;
      }
    }
  }

  slaType.addEventListener('change', () => {
    const checked = slaType.value === 'kerja';
    exSabtu.checked = checked;
    exMinggu.checked = checked;
    exLibur.checked = checked;
    recalc();
  });

  [startDate, startTime, duration, slaType, exSabtu, exMinggu, exLibur].forEach(el => el.addEventListener('input', recalc));
  recalc();

  // ---- copy due date ----
  copyDueBtn.addEventListener('click', async () => {
    const text = dueDateOut.textContent;
    if (!text || text === '—') return;
    await HT.copyText(text);
    HT.flashButton(copyDueBtn, copyDueBtn.querySelector('.txt'), 'Disalin!', 'Salin');
  });

  // ---- add custom holiday ----
  const addHolidayBtn = document.getElementById('addHolidayBtn');
  const addHolidayRow = document.getElementById('addHolidayRow');
  const newHolDate = document.getElementById('newHolDate');
  const newHolDesc = document.getElementById('newHolDesc');
  const confirmAddHol = document.getElementById('confirmAddHol');
  const cancelAddHol = document.getElementById('cancelAddHol');

  addHolidayBtn.addEventListener('click', () => {
    addHolidayRow.style.display = 'flex';
    addHolidayBtn.style.display = 'none';
    newHolDate.focus();
  });

  function closeAddHolidayForm() {
    addHolidayRow.style.display = 'none';
    addHolidayBtn.style.display = 'block';
    newHolDate.value = '';
    newHolDesc.value = '';
    newHolDate.classList.remove('field-error');
  }
  cancelAddHol.addEventListener('click', closeAddHolidayForm);

  confirmAddHol.addEventListener('click', () => {
    const iso = newHolDate.value;
    if (!iso) {
      newHolDate.classList.add('field-error');
      newHolDate.focus();
      return;
    }
    newHolDate.classList.remove('field-error');

    if (!holidays.includes(iso)) {
      holidays.push(iso);
    }

    const desc = newHolDesc.value.trim() || 'Cuti bersama / libur tambahan';
    const d = new Date(iso + 'T00:00:00');
    const hariName = d.toLocaleDateString('id-ID', { weekday: 'long' });
    const year = iso.slice(0, 4);

    const table = document.getElementById('holTable' + year);
    if (table && !table.querySelector(`tr[data-iso="${iso}"]`)) {
      const newRow = document.createElement('tr');
      newRow.className = 'custom-row';
      newRow.setAttribute('data-iso', iso);
      newRow.innerHTML = `<td>${iso}</td><td>${hariName}</td><td class="desc">${desc}</td>`;
      table.appendChild(newRow);

      const tab = document.querySelector(`.year-tab[data-year="${year}"]`);
      if (tab) tab.click();
      if (!holToggle.classList.contains('open')) holToggle.click();
    }

    closeAddHolidayForm();
    recalc();
  });
})();
