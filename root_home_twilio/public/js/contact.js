frappe.ui.form.on('Contact', {
  refresh(frm) {
    // CSS/JS helpers (ok to keep)
    if (!document.getElementById('fa-icons')) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.id = 'fa-icons';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
      document.head.appendChild(fa);
    }
    if (!window.bootstrap) {
      const bsScript = document.createElement('script');
      bsScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      document.head.appendChild(bsScript);
    }

    if (!frm.doc.mobile_no) return;

    frm.add_custom_button('📞 Browser Call', async () => {
      try {
        // ✅ Wait for the global device (already setup elsewhere)
        if (window.twilioDeviceReady) {
          await window.twilioDeviceReady;
        }

        // Build/ensure the modal once
        await ensureModal();
        const number = normalizeNumber(frm.doc.mobile_no);
        startOutboundCall(number);
      } catch (e) {
        console.error('Browser Call failed before connect:', e);
        frappe.msgprint(__('Twilio device is not ready yet. Try again in a second.'));
      }
    }, __('Actions'));
  }
});

/* ---------- helpers ---------- */

// Build the modal only once
async function ensureModal() {
  if (document.getElementById('twilio-call-modal')) return;

  const { message: html } = await frappe.call({
    method: 'root_home_twilio.api.twilio.get_twilio_modal'
  });

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div);
}

// Basic phone cleanup. Server will still normalize to E.164.
function normalizeNumber(raw) {
  // remove spaces, dashes, parentheses
  const cleaned = String(raw).replace(/[()\s-]/g, '');
  return cleaned;
}

function startOutboundCall(number) {
  const el = document.getElementById('twilio-call-modal');
  const bsModal = new bootstrap.Modal(el, { backdrop: 'static', keyboard: false });

  // Reset UI
  el.querySelector('#modal-call-number').textContent = number;
  el.querySelector('#modal-call-status').textContent = 'Connecting...';
  el.querySelector('#call-timer').textContent = '';
  el.querySelector('#btnHangUp').disabled = true;

  bsModal.show();

  let timer;
  let startedAt;

  // 🔑 Use existing device — do NOT call Device.setup here
  const conn = Twilio.Device.connect({ To: number });

  // Button wiring
  el.querySelector('#btnHangUp').onclick = () => {
    try { conn.disconnect(); } catch {}
  };

  // Per-connection events
  conn.on('ringing', () => {
    el.querySelector('#modal-call-status').textContent = 'Ringing…';
  });

  conn.on('accept', () => {
    el.querySelector('#modal-call-status').textContent = 'Connected';
    el.querySelector('#btnHangUp').disabled = false;
    startedAt = Date.now();
    timer = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      el.querySelector('#call-timer').textContent = `${mm}:${ss}`;
    }, 1000);
  });

  conn.on('disconnect', () => {
    el.querySelector('#modal-call-status').textContent = 'Disconnected';
    if (timer) clearInterval(timer);
    setTimeout(() => bsModal.hide(), 600);
  });

  conn.on('reject', () => {
    el.querySelector('#modal-call-status').textContent = 'Rejected';
    setTimeout(() => bsModal.hide(), 600);
  });

  conn.on('cancel', () => {
    el.querySelector('#modal-call-status').textContent = 'Cancelled';
    setTimeout(() => bsModal.hide(), 600);
  });

  conn.on('error', (e) => {
    console.error('❌ Connection error:', e);
    el.querySelector('#modal-call-status').textContent = `Error: ${e?.message || e}`;
    setTimeout(() => bsModal.hide(), 1000);
  });

  // (Optional) Still useful to keep a device-level error
  Twilio.Device.on('error', (e) => console.error('❌ Device error:', e));
}
