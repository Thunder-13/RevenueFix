from models.base import BaseModel
from datetime import datetime, timedelta
import random
import pandas as pd
import os
from collections import defaultdict
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
    def get_tasks(cls):
        """Get available departments"""
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        alarm = pd.read_csv(file_path).to_dict('records')
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        cases = pd.read_csv(file_path).to_dict('records')

        user_map = defaultdict(int)
        for alarm in alarm:
            user_map[alarm['assigned_to']] += 1
        for case in cases:
            user_map[case['assigned_to']] += 1

        return [{"name": name, "tasks": id_} for name, id_ in user_map.items()]