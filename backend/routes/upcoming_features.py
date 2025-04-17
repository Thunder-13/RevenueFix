from flask import Blueprint, jsonify
from models.settings import SettingsModel

upcoming_features_bp = Blueprint('upcoming_features', __name__)

@upcoming_features_bp.route('', methods=['GET'])
def get_upcoming_features():
    """Get upcoming features"""
    return jsonify({
        'status': 'success',
        'data': SettingsModel.get_upcoming_features()
    })