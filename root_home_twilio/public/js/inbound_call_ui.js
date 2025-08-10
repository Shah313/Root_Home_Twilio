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
        <div id="inbound-call-modal" style="display:none;position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:12px;box-shadow:0 0 20px rgba(0,0,0,0.3);z-index:9999;text-align:center;font-family:sans-serif;">
            <h3 style="margin-bottom:10px;">📞 Incoming Call</h3>
            <p id="caller-id" style="font-size:14px;color:#555;margin-bottom:20px;"></p>
            <button id="accept-call" style="padding:10px 20px;margin:0 10px;background:green;color:white;border:none;border-radius:5px;">Accept</button>
            <button id="reject-call" style="padding:10px 20px;background:red;color:white;border:none;border-radius:5px;">Reject</button>
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
            if (r.message && r.message.token) {
                Twilio.Device.setup(r.message.token, { debug: true });

              // expose a promise so other scripts can await the device
window.twilioDeviceReady = new Promise((resolve) => {
  Twilio.Device.on('ready', () => resolve());
});


                Twilio.Device.on('error', error => {
                    console.error("❌ Twilio error", error);
                });

                Twilio.Device.on('incoming', connection => {
                    // Show modal
                    document.getElementById("inbound-call-modal").style.display = "block";
                    document.getElementById("caller-id").innerText = "From: " + connection.parameters.From;

                    document.getElementById("accept-call").onclick = () => {
    connection.accept();
    document.getElementById("inbound-call-modal").style.display = "none";

    // Log call on acceptance
    frappe.call({
        method: "root_home_twilio.api.twilio.log_inbound_call",
        args: {
            caller_number: connection.parameters.From,
            call_sid: connection.parameters.CallSid,
            status: "Answered"
        }
    });
                    };

                    document.getElementById("reject-call").onclick = () => {
    connection.reject();
    document.getElementById("inbound-call-modal").style.display = "none";

    // Log call on rejection
    frappe.call({
        method: "root_home_twilio.api.twilio.log_inbound_call",
        args: {
            caller_number: connection.parameters.From,
            call_sid: connection.parameters.CallSid,
            status: "Rejected"
        }
    });
                    };

                    connection.on("disconnect", () => {
    frappe.call({
        method: "root_home_twilio.api.twilio.update_call_end",
        args: { call_sid: connection.parameters.CallSid }
    });

                    });
                });
            }
        }
    });
}
