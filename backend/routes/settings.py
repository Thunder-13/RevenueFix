from flask import Blueprint, jsonify
from models.settings import SettingsModel

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('', methods=['GET'])
def get_settings():
    """Get application settings"""
    return jsonify({
        'status': 'success',
        'data': SettingsModel.get_app_settings()
    })