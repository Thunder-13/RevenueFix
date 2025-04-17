from flask import Blueprint, jsonify
from models.revenue import RevenueModel

network_billing_bp = Blueprint('network_billing', __name__)

@network_billing_bp.route('', methods=['GET'])
def get_network_billing_data():
    """Get network vs billing data"""
    return jsonify({
        'status': 'success',
        'data': RevenueModel.get_network_vs_billing()
    })