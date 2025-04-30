from flask import Blueprint, jsonify
from models.services import ServicesModel

network_billing_sms_bp = Blueprint('network_billing_sms', __name__)

@network_billing_sms_bp.route('', methods=['GET'])
def get_network_billing_sms():
    """Get Network vs Billing data"""
    try:
        
        return jsonify({
            'status': 'success',
            'data': ServicesModel.get_network_vs_billing_sms()
        })
        
    except Exception as e:
        print(f"Error processing Network vs Billing data: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500