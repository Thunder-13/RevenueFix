from flask import Blueprint, jsonify
from models.services import ServicesModel
 
network_billing_voice_bp = Blueprint('network_billing_voice', __name__)
 
@network_billing_voice_bp.route('', methods=['GET'])
def get_network_billing_voice():
    """Get Network vs Billing Voice"""
    try:
       
        return jsonify({
            'status': 'success',
            'data': ServicesModel.get_network_vs_billing_voice_opt()
        })
       
    except Exception as e:
        print(f"Error processing Network vs Billing Voice: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500