from models.base import BaseModel

class UserModel(BaseModel):
    """Model for user data"""
    
    dummy_data = [
        {
            'id': 1,
            'name': 'Admin User',
            'email': 'admin@revenuefix.com',
            'role': 'admin',
            'department': 'IT',
            'last_login': '2023-06-15T14:23:45',
            'status': 'active'
        },
        {
            'id': 2,
            'name': 'John Smith',
            'email': 'john.smith@revenuefix.com',
            'role': 'manager',
            'department': 'Finance',
            'last_login': '2023-06-15T10:15:22',
            'status': 'active'
        },
        {
            'id': 3,
            'name': 'Jane Doe',
            'email': 'jane.doe@revenuefix.com',
            'role': 'analyst',
            'department': 'Revenue Assurance',
            'last_login': '2023-06-14T16:05:17',
            'status': 'active'
        },
        {
            'id': 4,
            'name': 'Robert Johnson',
            'email': 'robert.johnson@revenuefix.com',
            'role': 'viewer',
            'department': 'Marketing',
            'last_login': '2023-06-13T09:58:03',
            'status': 'active'
        },
        {
            'id': 5,
            'name': 'Emily Wilson',
            'email': 'emily.wilson@revenuefix.com',
            'role': 'analyst',
            'department': 'Customer Service',
            'last_login': '2023-06-15T11:45:51',
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