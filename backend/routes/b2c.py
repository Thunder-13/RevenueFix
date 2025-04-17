from flask import Blueprint, jsonify
from models.business import BusinessModel

b2c_bp = Blueprint('b2c', __name__)

@b2c_bp.route('', methods=['GET'])
def get_b2c_data():
    """Get B2C analysis data"""
    return jsonify({
        'status': 'success',
        'data': BusinessModel.get_b2c_analysis()
    })