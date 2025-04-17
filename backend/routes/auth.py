from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    data = request.get_json()
    
    # In a real implementation, validate credentials against database
    # For demo, accept any email with a password
    if 'email' in data and 'password' in data:
        return jsonify({
            'status': 'success',
            'data': {
                'user': {
                    'id': 1,
                    'name': 'Demo User',
                    'email': data['email'],
                    'role': 'admin'
                },
                'token': 'demo-jwt-token'
            }
        })
    
    return jsonify({
        'status': 'error',
        'message': 'Invalid credentials'
    }), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint"""
    return jsonify({
        'status': 'success',
        'message': 'Logged out successfully'
    })

@auth_bp.route('/me', methods=['GET'])
def me():
    """Get current user info"""
    # In a real implementation, get user from JWT token
    return jsonify({
        'status': 'success',
        'data': {
            'user': {
                'id': 1,
                'name': 'Demo User',
                'email': 'demo@revenuefix.com',
                'role': 'admin'
            }
        }
    })