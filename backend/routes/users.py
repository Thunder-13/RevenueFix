from flask import Blueprint, jsonify, request
from models.users import UserModel

users_bp = Blueprint('users', __name__)

@users_bp.route('', methods=['GET'])
def get_users():
    """Get all users"""
    return jsonify({
        'status': 'success',
        'data': UserModel.get_all()
    })

@users_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    user = UserModel.get_by_id(user_id)
    if user:
        return jsonify({
            'status': 'success',
            'data': user
        })
    return jsonify({
        'status': 'error',
        'message': 'User not found'
    }), 404

@users_bp.route('/roles', methods=['GET'])
def get_roles():
    """Get available user roles"""
    return jsonify({
        'status': 'success',
        'data': UserModel.get_user_roles()
    })

@users_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """Get available task"""

    return jsonify({
        'status': 'success',
        'data': UserModel.get_tasks()
    })