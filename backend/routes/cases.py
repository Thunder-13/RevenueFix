from flask import Blueprint, jsonify
from models.operations import OperationsModel

cases_bp = Blueprint('cases', __name__)

@cases_bp.route('', methods=['GET'])
def get_case_data():
    """Get case management data"""
    return jsonify({
        'status': 'success',
        'data': OperationsModel.get_case_data()
    })