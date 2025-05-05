from models.base import BaseModel
from datetime import datetime, timedelta
import random
class UserModel(BaseModel):
    """Model for user data"""
    current_time = datetime.now()
    dummy_data = [
        {
            'id': 1,
            'name': 'Saravanan',
            'email': 'saravanan@revenuefix.com',
            'role': 'admin',
            'department': 'IT',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 2,
            'name': 'Aravinth',
            'email': 'Aravinth@revenuefix.com',
            'role': 'manager',
            'department': 'Finance',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 3,
            'name': 'Abinesh',
            'email': 'abinesh@revenuefix.com',
            'role': 'analyst',
            'department': 'Revenue Assurance',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 4,
            'name': 'Sayantani',
            'email': 'sayantani@revenuefix.com',
            'role': 'viewer',
            'department': 'Marketing',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 5,
            'name': 'Ganesh',
            'email': 'Ganesh@revenuefix.com',
            'role': 'analyst',
            'department': 'Customer Service',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 6,
            'name': 'Muthulakshmi',
            'email': 'Aravinth@revenuefix.com',
            'role': 'manager',
            'department': 'Finance',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 7,
            'name': 'Anselm',
            'email': 'anselm@revenuefix.com',
            'role': 'analyst',
            'department': 'Revenue Assurance',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 8,
            'name': 'Sampath',
            'email': 'sampath@revenuefix.com',
            'role': 'viewer',
            'department': 'Marketing',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'active'
        },
        {
            'id': 9,
            'name': 'Murugan',
            'email': 'murugan@revenuefix.com',
            'role': 'analyst',
            'department': 'Customer Service',
            'last_login': (current_time - timedelta(hours=random.randint(1, 3))).isoformat(),
            'status': 'inactive'
        }
    ]
    
    @classmethod
    def get_user_roles(cls):
        """Get available user roles"""
        return [
            {'id': 1, 'name': 'admin', 'description': 'Full system access'},
            {'id': 2, 'name': 'manager', 'description': 'Department-level access and reporting'},
            {'id': 3, 'name': 'analyst', 'description': 'Data analysis and reporting access'},
            {'id': 4, 'name': 'viewer', 'description': 'Read-only access to reports'}
        ]
    
    
    @classmethod
    def get_departments(cls):
        """Get available departments"""
        return [
            {'id': 1, 'name': 'IT'},
            {'id': 2, 'name': 'Finance'},
            {'id': 3, 'name': 'Revenue Assurance'},
            {'id': 4, 'name': 'Marketing'},
            {'id': 5, 'name': 'Customer Service'},
            {'id': 6, 'name': 'Operations'},
            {'id': 7, 'name': 'Sales'}
        ]