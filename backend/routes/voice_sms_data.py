from flask import Blueprint, jsonify
from models.services import ServicesModel

voice_sms_data_bp = Blueprint('voice_sms_data', __name__)

@voice_sms_data_bp.route('', methods=['GET'])
def get_voice_sms_data():
    """Get voice, SMS, and data metrics"""
    return jsonify({
        'status': 'success',
        'data': ServicesModel.get_voice_sms_data_metrics()
    })