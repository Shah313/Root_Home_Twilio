import frappe
from frappe import _
import json

import os
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VoiceGrant
from frappe.utils.response import Response
from twilio.twiml.voice_response import VoiceResponse
from werkzeug.wrappers import Response
from twilio.jwt.client import ClientCapabilityToken
from frappe.utils import now_datetime

@frappe.whitelist()
def get_twilio_modal():
    modal_html = """
    <div class="modal fade" id="twilio-call-modal" tabindex="-1" role="dialog" aria-labelledby="callModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content shadow-lg border-0">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="callModalLabel">📞 Calling...</h5>
            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="font-size: 1.5rem;">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body text-center py-4">
            <h4 id="modal-call-number" class="font-weight-bold mb-3 text-secondary">+44XXXXXXXXXX</h4>
            <p class="text-muted" id="modal-call-status">Connecting...</p>
            <div id="call-timer" class="text-dark font-weight-bold mt-2" style="font-size: 1.25rem;"></div>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" id="btnHangUp" class="btn btn-danger btn-lg">
              <i class="fa fa-phone-slash mr-2"></i>Hang Up
            </button>
          </div>
        </div>
      </div>
    </div>
    """
    return modal_html

@frappe.whitelist()
def get_twilio_token():
    account_sid = frappe.conf.twilio_account_sid
    auth_token = frappe.conf.twilio_auth_token
    twiml_app_sid = frappe.conf.twilio_twiml_app_sid

    identity = frappe.session.user  # use email or user ID
    token = ClientCapabilityToken(account_sid, auth_token)
    token.allow_client_incoming(identity)
    token.allow_client_outgoing(twiml_app_sid)
    jwt_token = token.to_jwt()  # <-- FIXED: removed .decode()
    
    return {"token": jwt_token}



@frappe.whitelist()
def log_inbound_call(caller_number, call_sid, status="Answered"):
    doc = frappe.new_doc("Call Logs")
    doc.caller_number = caller_number
    doc.call_sid = call_sid
    doc.start_time = now_datetime()
    doc.status = status
    doc.insert(ignore_permissions=True)
    return doc.name


@frappe.whitelist()
def update_call_end(call_sid):
    log = frappe.get_doc("Call Logs", {"call_sid": call_sid})
    log.end_time = now_datetime()
    seconds = int((log.end_time - log.start_time).total_seconds())
    log.duration = seconds
    log.duration_formatted = format_duration(seconds)
    log.save(ignore_permissions=True)
    return True


def format_duration(seconds):
    mins, sec = divmod(seconds, 60)
    hrs, mins = divmod(mins, 60)
    parts = []
    if hrs: parts.append(f"{hrs} hr")
    if mins: parts.append(f"{mins} min")
    if sec or not parts: parts.append(f"{sec} sec")
    return ", ".join(parts)















@frappe.whitelist(allow_guest=True)
def twiml_voice():
    to_number = frappe.form_dict.get("To")
    caller_id = frappe.conf.get("twilio_phone_number") or "+447476928868"

    if not to_number:
        return "Missing 'To' parameter", 400

    # Format number to E.164
    if not to_number.startswith("+"):
        to_number = "+44" + to_number.lstrip("0")

    xml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial callerId="{caller_id}">{to_number}</Dial>
</Response>"""

    return Response(xml_response, content_type='text/xml')
