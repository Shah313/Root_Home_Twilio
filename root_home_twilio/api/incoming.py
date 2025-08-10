import frappe
from twilio.twiml.voice_response import VoiceResponse, Dial
from werkzeug.wrappers import Response

@frappe.whitelist(allow_guest=True, methods=["POST"])
def handle_incoming_call():
    resp = VoiceResponse()
    resp.say("Welcome! Connecting you now.", voice="alice")
    dial = Dial()
    dial.client("Administrator")  # Must match browser client identity
    resp.append(dial)
    # Return raw XML with correct content type
    return Response(str(resp), content_type='text/xml')