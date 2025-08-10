// let outboundDocName = null;
// let outboundCallSid = null;

// function dial(number) {
//   const conn = Twilio.Device.connect({ To: number });

//   Twilio.Device.once("connect", (c) => {
//     outboundCallSid = c.parameters.CallSid;

//     // create the log now that we have a real CallSid
//     frappe.call({
//       method: "root_home_twilio.api.twilio.log_call",
//       args: {
//         direction: "Outbound",
//         from_number: "client:" + (frappe.session.user || "anonymous"), // or your callerId
//         to_number: number,
//         call_sid: outboundCallSid,
//         status: "Answered"
//       },
//       callback: (r) => { outboundDocName = r.message?.name || null; }
//     });
//   });

//   Twilio.Device.once("disconnect", () => {
//     frappe.call({
//       method: "root_home_twilio.api.twilio.update_call_end",
//       args: { call_sid: outboundCallSid || null, name: outboundDocName || null, status: "Completed" }
//     });
//   });
// }
