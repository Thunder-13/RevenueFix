from flask import Blueprint, jsonify
from models.revenue import RevenueModel

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('', methods=['GET'])
def get_dashboard_data():
    """Get dashboard data"""
    return jsonify({
        'status': 'success',
        'data': RevenueModel.get_dashboard_metrics()
    })