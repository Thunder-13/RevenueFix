from flask import Blueprint, jsonify
from models.business import BusinessModel

b2b_bp = Blueprint('b2b', __name__)

@b2b_bp.route('', methods=['GET'])
def get_b2b_data():
    """Get B2B analysis data"""
    return jsonify({
        'status': 'success',
        'data': BusinessModel.get_b2b_analysis()
    })