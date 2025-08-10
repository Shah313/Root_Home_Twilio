// Inject Twilio Incoming Call Modal HTML
function injectTwilioModal() {
    const modalHTML = `
<div id="twilio-incoming-modal" class="modal" tabindex="-1" style="display: none; position: fixed; z-index: 1050; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5);">
  <div class="modal-dialog" style="margin: 10% auto; max-width: 400px;">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">📞 Incoming Call</h5>
      </div>
      <div class="modal-body">
        <p><strong>From:</strong> <span id="caller-number"></span></p>
      </div>
      <div class="modal-footer">
        <button id="accept-call" class="btn btn-success">Accept</button>
        <button id="end-call" class="btn btn-danger">Disconnect</button>
      </div>
    </div>
  </div>
</div>
    `;
    if (!document.getElementById("twilio-incoming-modal")) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = modalHTML;
        document.body.appendChild(wrapper);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    if (!document.getElementById("twilio-lib")) {
        const script = document.createElement("script");
        script.src = "https://sdk.twilio.com/js/client/v1.13/twilio.min.js";
        script.id = "twilio-lib";
        document.head.appendChild(script);
    }

    injectTwilioModal();

    const waitForTwilio = setInterval(() => {
        if (window.Twilio) {
            clearInterval(waitForTwilio);
            setupTwilioDevice();
        }
    }, 500);
});

let activeConnection = null;

function setupTwilioDevice() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
            console.log("🎤 Microphone permission granted");
        })
        .catch(() => {
            console.warn("⚠️ Microphone access denied");
        });

    frappe.call({
        method: "root_home_twilio.api.twilio.get_twilio_token",
        callback: function (r) {
            if (r.message && r.message.token) {
                console.log("🔑 Received Twilio token");
                Twilio.Device.setup(r.message.token, { debug: true });

                window.twilioDeviceReady = new Promise((resolve) => {
  Twilio.Device.on('ready', () => resolve());
                });

                Twilio.Device.on('error', function(error) {
                    console.error("❌ Twilio Device Error:", error);
                });

                Twilio.Device.on("incoming", (connection) => {
                    const callerNumber = connection.parameters.From;
    const callSID = connection.parameters.CallSid;
                    console.log("📞 INCOMING CALL:", connection);
                        document.getElementById("caller-number").innerText = callerNumber;
    $("#twilio-incoming-modal").modal("show");


                    document.getElementById("accept-call").onclick = () => {
                        connection.accept();
                        activeConnection = connection;
                         frappe.call({
            method: "root_home_twilio.api.twilio.log_inbound_call",
            args: {
                caller_number: callerNumber,
                call_sid: callSID
            },
            callback: function (r) {
                console.log("📁 Inbound call logged in ERPNext");
            }
        });
                    };

                    document.getElementById("end-call").onclick = () => {
                        if (activeConnection) {
                            activeConnection.disconnect();
                            activeConnection = null;
                        }
                        $("#twilio-incoming-modal").modal("hide");
                    };

                    connection.on("disconnect", () => {
                        console.log("📴 Call disconnected");
                        $("#twilio-incoming-modal").modal("hide");
                        frappe.show_alert({
                            message: "📴 Call ended",
                            indicator: "orange"
                        });

                                frappe.call({
            method: "root_home_twilio.api.twilio.update_call_end",
            args: {
                call_sid: callSID
            },
            callback: function (r) {
                console.log("✅ Inbound call log updated with end time");
            }
        });

                    });
                });

                Twilio.Device.on('connect', function(conn) {
                    console.log("✅ Call connected", conn);
                });

                Twilio.Device.on('disconnect', function(conn) {
                    console.log("📴 Call disconnected", conn);
                });
            } else {
                console.error("❌ Failed to get Twilio token", r);
            }
        }
    });

  


}
