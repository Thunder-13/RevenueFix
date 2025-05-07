from flask import Blueprint, jsonify, request
from models.revenue import RevenueModel

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('', methods=['GET'])
def get_dashboard_data():
    """Get dashboard data"""
    return jsonify({
        'status': 'success',
        'data': RevenueModel.get_dashboard_metriics()
    })

@dashboard_bp.route('/kra/<kra_id>', methods=['GET'])
def get_kra_data(kra_id):
    """Get KRA data for specific KRA ID"""
    return jsonify({
        'status': 'success',
        'data': RevenueModel.get_kra_data(kra_id)
    })

@dashboard_bp.route('/kpi/<kpi_id>', methods=['GET'])
def get_kpi_data(kpi_id):
    """Get KPI data for specific KPI ID"""
    return jsonify({
        'status': 'success',
        'data': RevenueModel.get_kpi_data(kpi_id)
    })