from flask import Blueprint, jsonify
from models.operations import OperationsModel

alarms_bp = Blueprint('alarms', __name__)

@alarms_bp.route('', methods=['GET'])
def get_alarm_data():
    """Get alarm management data"""
    return jsonify({
        'status': 'success',
        'data': OperationsModel.get_alarm_data()
    })