from flask import Blueprint, jsonify
from models.revenue import RevenueModel

mediation_billing_bp = Blueprint('mediation_billing', __name__)

@mediation_billing_bp.route('', methods=['GET'])
def get_mediation_billing_data():
    """Get mediation vs billing data"""
    return jsonify({
        'status': 'success',
        'data': RevenueModel.get_mediation_vs_billing()
    })