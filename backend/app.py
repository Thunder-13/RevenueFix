from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS # type: ignore
import os
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp
from routes.network_billing import network_billing_bp
from routes.mediation_billing import mediation_billing_bp
from routes.crm_billing import crm_billing_bp
from routes.b2b import b2b_bp
from routes.b2c import b2c_bp
from routes.fixed_line import fixed_line_bp
from routes.voice_sms_data import voice_sms_data_bp
from routes.crm import crm_bp
from routes.alarms import alarms_bp
from routes.users import users_bp
from routes.cases import cases_bp
from routes.settings import settings_bp
from routes.upcoming_features import upcoming_features_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
app.register_blueprint(network_billing_bp, url_prefix='/api/network-billing')
app.register_blueprint(mediation_billing_bp, url_prefix='/api/mediation-billing')
app.register_blueprint(crm_billing_bp, url_prefix='/api/crm-billing')
app.register_blueprint(b2b_bp, url_prefix='/api/b2b')
app.register_blueprint(b2c_bp, url_prefix='/api/b2c')
app.register_blueprint(fixed_line_bp, url_prefix='/api/fixed-line')
app.register_blueprint(voice_sms_data_bp, url_prefix='/api/voice-sms-data')
app.register_blueprint(crm_bp, url_prefix='/api/crm')
app.register_blueprint(alarms_bp, url_prefix='/api/alarms')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(cases_bp, url_prefix='/api/cases')
app.register_blueprint(settings_bp, url_prefix='/api/settings')
app.register_blueprint(upcoming_features_bp, url_prefix='/api/upcoming-features')

@app.route('/')
def index():
    return jsonify({
        "status": "success",
        "message": "RevenueFix API is running"
    })

# if __name__ == '__main__':
#     port = int(os.environ.get('PORT', 5000))
#     app.run(host='0.0.0.0', port=port, debug=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)