// Load Twilio SDK if not loaded
if (!document.getElementById("twilio-lib")) {
  const script = document.createElement("script");
  script.src = "https://sdk.twilio.com/js/client/v1.13/twilio.min.js";
  script.id = "twilio-lib";
  document.head.appendChild(script);
}

// Wait for Twilio to be ready
const waitTwilio = setInterval(() => {
  if (window.Twilio) {
    clearInterval(waitTwilio);
    initializeTwilio();
  }
}, 500);

// Inject modal HTML once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const modalHTML = `
    <div id="inbound-call-modal"
         style="display:none;position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);
                background:white;padding:30px;border-radius:12px;box-shadow:0 0 20px rgba(0,0,0,0.3);
                z-index:9999;text-align:center;font-family:sans-serif;width:360px;max-width:90vw;">
      <h3 style="margin-bottom:6px;">📞 Incoming Call</h3>
      <p id="caller-id" style="font-size:14px;color:#555;margin:0 0 6px 0;"></p>
      <p id="inbound-status" style="font-size:13px;color:#666;margin:0 0 10px 0;">Ringing…</p>

      <!-- live timer (hidden until connected) -->
      <div id="inbound-timer" style="display:none;font-weight:700;margin-bottom:14px;">00:00</div>

      <div>
        <button id="accept-call"
                style="padding:10px 20px;margin:0 6px;background:green;color:white;border:none;border-radius:5px;">
          Accept
        </button>
        <button id="reject-call"
                style="padding:10px 20px;margin:0 6px;background:#d9534f;color:white;border:none;border-radius:5px;">
          Reject
        </button>

        <!-- hang up appears only after accepted -->
        <button id="hangup-call"
                style="display:none;padding:10px 20px;margin:0 6px;background:#d9534f;color:white;border:none;border-radius:5px;">
          Hang Up
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
});

function initializeTwilio() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log("🎤 Mic access OK"))
    .catch(() => console.warn("⚠️ Mic access denied"));

  frappe.call({
    method: "root_home_twilio.api.twilio.get_twilio_token",
    callback: function (r) {
      if (!(r.message && r.message.token)) return;

      Twilio.Device.setup(r.message.token, { debug: true });

      // expose a promise so other scripts can await the device
      window.twilioDeviceReady = new Promise((resolve) => {
        Twilio.Device.on("ready", () => resolve());
      });

      Twilio.Device.on("error", (error) => {
        console.error("❌ Twilio error", error);
      });

      let activeConn = null;
      let tHandle = null;
      let startedAt = null;

      const modalEl   = () => document.getElementById("inbound-call-modal");
      const statusEl  = () => document.getElementById("inbound-status");
      const timerEl   = () => document.getElementById("inbound-timer");
      const acceptBtn = () => document.getElementById("accept-call");
      const rejectBtn = () => document.getElementById("reject-call");
      const hangupBtn = () => document.getElementById("hangup-call");

      function showModal()   { modalEl().style.display = "block"; }
      function hideModal()   { modalEl().style.display = "none"; }
      function resetModal() {
        statusEl().textContent = "Ringing…";
        timerEl().style.display = "none";
        timerEl().textContent = "00:00";
        acceptBtn().style.display = "inline-block";
        rejectBtn().style.display = "inline-block";
        hangupBtn().style.display = "none";
      }

      function startTimer() {
        startedAt = Date.now();
        timerEl().style.display = "block";
        tHandle = setInterval(() => {
          const s = Math.floor((Date.now() - startedAt) / 1000);
          const mm = String(Math.floor(s / 60)).padStart(2, "0");
          const ss = String(s % 60).padStart(2, "0");
          timerEl().textContent = `${mm}:${ss}`;
        }, 1000);
      }
      function stopTimer() { if (tHandle) clearInterval(tHandle); tHandle = null; }

      Twilio.Device.on("incoming", (connection) => {
        // Present ring UI
        document.getElementById("caller-id").innerText = "From: " + connection.parameters.From;
        resetModal();
        showModal();
        activeConn = connection;

        // Accept -> keep dialog open, show timer + Hang Up
        acceptBtn().onclick = () => {
          connection.accept();
          statusEl().textContent = "Connected";
          acceptBtn().style.display = "none";
          rejectBtn().style.display = "none";
          hangupBtn().style.display = "inline-block";
          startTimer();

          

          // (optional) log immediately as "Answered"
          frappe.call({
            method: "root_home_twilio.api.twilio.log_inbound_call",
            args: {
              caller_number: connection.parameters.From,
              call_sid: connection.parameters.CallSid,
              status: "Answered",
            }
          });

          hangupBtn().onclick = () => {
            try { connection.disconnect(); } catch {}
          };
        };

        // Reject -> close dialog (unchanged behavior)
        rejectBtn().onclick = () => {
          connection.reject();
          hideModal();

          frappe.call({
            method: "root_home_twilio.api.twilio.log_inbound_call",
            args: {
              caller_number: connection.parameters.From,
              call_sid: connection.parameters.CallSid,
              status: "Rejected",
            }
          });
        };

        // Connection lifecycle
        connection.on("ringing", () => {
          statusEl().textContent = "Ringing…";
        });

        connection.on("accept", () => {
          // already handled in click; still ensure status if auto-accepted elsewhere
          statusEl().textContent = "Connected";
          if (!tHandle) startTimer();
          acceptBtn().style.display = "none";
          rejectBtn().style.display = "none";
          hangupBtn().style.display = "inline-block";
        });

        connection.on("disconnect", () => {
          stopTimer();
          statusEl().textContent = "Disconnected";
          setTimeout(() => {
            hideModal();
            resetModal();
          }, 500);

          frappe.call({
            method: "root_home_twilio.api.twilio.update_call_end",
            args: { call_sid: connection.parameters.CallSid }
          });
        });

        connection.on("error", (e) => {
          console.error("Incoming call error:", e);
          statusEl().textContent = "Error: " + (e?.message || e);
          stopTimer();
          setTimeout(() => { hideModal(); resetModal(); }, 800);
        });
      });
    }
  });
}
