from flask import Blueprint, jsonify
from models.services import ServicesModel

fixed_line_bp = Blueprint('fixed_line', __name__)

@fixed_line_bp.route('', methods=['GET'])
def get_fixed_line_data():
    """Get fixed line data"""
    return jsonify({
        'status': 'success',
        'data': ServicesModel.get_fixed_line_data()
    })