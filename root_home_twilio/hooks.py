app_name = "root_home_twilio"
app_title = "Root Home Twilio"
app_publisher = "zikpro"
app_description = "implentation of twilio in root home"
app_email = "shoaib@zikpro.com"
app_license = "mit"
# required_apps = []


doctype_js = {
    "Contact": "public/js/contact.js"
}



# app_include_js = "/assets/root_home_twilio/js/twilio_browser_call.js"

app_include_js = "/assets/root_home_twilio/js/inbound_call_ui.js"

# app_include_js = "/assets/root_home_twilio/js/twilio_outbound.js"


# webhooks = [
#     {
#         "method": "POST",
#         "path": "/api/method/root_home_twilio.api.incoming.handle_incoming_call",
#         "handler": "root_home_twilio.api.incoming.handle_incoming_call"
#     }
# ]




# app_include_templates = ["root_home_twilio/templates/includes/twilio_call_modal.html"]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/root_home_twilio/css/root_home_twilio.css"
# app_include_js = "/assets/root_home_twilio/js/root_home_twilio.js"

# include js, css files in header of web template
# web_include_css = "/assets/root_home_twilio/css/root_home_twilio.css"
# web_include_js = "/assets/root_home_twilio/js/root_home_twilio.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "root_home_twilio/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "root_home_twilio/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "root_home_twilio.utils.jinja_methods",
# 	"filters": "root_home_twilio.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "root_home_twilio.install.before_install"
# after_install = "root_home_twilio.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "root_home_twilio.uninstall.before_uninstall"
# after_uninstall = "root_home_twilio.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "root_home_twilio.utils.before_app_install"
# after_app_install = "root_home_twilio.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "root_home_twilio.utils.before_app_uninstall"
# after_app_uninstall = "root_home_twilio.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "root_home_twilio.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"root_home_twilio.tasks.all"
# 	],
# 	"daily": [
# 		"root_home_twilio.tasks.daily"
# 	],
# 	"hourly": [
# 		"root_home_twilio.tasks.hourly"
# 	],
# 	"weekly": [
# 		"root_home_twilio.tasks.weekly"
# 	],
# 	"monthly": [
# 		"root_home_twilio.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "root_home_twilio.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "root_home_twilio.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "root_home_twilio.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["root_home_twilio.utils.before_request"]
# after_request = ["root_home_twilio.utils.after_request"]

# Job Events
# ----------
# before_job = ["root_home_twilio.utils.before_job"]
# after_job = ["root_home_twilio.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"root_home_twilio.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

