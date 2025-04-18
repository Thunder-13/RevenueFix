from flask import Blueprint, jsonify
from models.data_processor import DataProcessor

crm_billing_bp = Blueprint('crm_billing', __name__)

@crm_billing_bp.route('', methods=['GET'])
def get_crm_billing_data():
    """Get CRM vs Billing reconciliation data"""
    try:
        # Process CRM and Billing data
        data = DataProcessor.get_crm_billing_analytics()
        
        return jsonify({
            'status': 'success',
            'data': data
        })
        
    except Exception as e:
        print(f"Error processing CRM vs Billing data: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500