from flask import Blueprint, jsonify
from models.crm import CRMModel

crm_bp = Blueprint('crm', __name__)

@crm_bp.route('', methods=['GET'])
def get_crm_data():
    """Get CRM insights data"""
    return jsonify({
        'status': 'success',
        'data': CRMModel.get_crm_insights()
    })