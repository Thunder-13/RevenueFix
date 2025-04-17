from models.base import BaseModel
import random
from datetime import datetime, timedelta

class OperationsModel(BaseModel):
    """Model for operations data including alarms and cases"""
    
    @staticmethod
    def generate_time_series(days=30, base_value=100, volatility=0.2):
        """Generate time series data for charts"""
        data = []
        today = datetime.now()
        
        for i in range(days):
            date = today - timedelta(days=days-i-1)
            # Add some randomness to the value
            change = (random.random() - 0.5) * 2 * volatility
            value = base_value * (1 + change)
            base_value = value  # For the next day
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'value': round(value, 2)
            })
            
        return data
    
    @classmethod
    def get_alarm_data(cls):
        """Get alarm management data"""
        return {
            'summary': {
                'total_alarms': 1234,
                'critical_alarms': 56,
                'major_alarms': 234,
                'minor_alarms': 944,
                'resolved_today': 345
            },
            'alarm_by_category': [
                {'category': 'Network', 'count': 567},
                {'category': 'Billing', 'count': 345},
                {'category': 'Security', 'count': 123},
                {'category': 'Performance', 'count': 199}
            ],
            'alarm_trend': cls.generate_time_series(),
            'top_alarm_sources': [
                {'source': 'Core Network', 'count': 234},
                {'source': 'Billing System', 'count': 198},
                {'source': 'Data Center', 'count': 156},
                {'source': 'Access Network', 'count': 123},
                {'source': 'CRM System', 'count': 98}
            ],
            'recent_alarms': [
                {'id': 'ALM-1234', 'severity': 'Critical', 'source': 'Billing System', 'message': 'Database connection failure', 'timestamp': '2023-06-15T14:23:45'},
                {'id': 'ALM-1233', 'severity': 'Major', 'source': 'Core Network', 'message': 'High CPU utilization on router', 'timestamp': '2023-06-15T14:15:22'},
                {'id': 'ALM-1232', 'severity': 'Minor', 'source': 'CRM System', 'message': 'API response time degradation', 'timestamp': '2023-06-15T14:05:17'},
                {'id': 'ALM-1231', 'severity': 'Critical', 'source': 'Data Center', 'message': 'Power supply failure', 'timestamp': '2023-06-15T13:58:03'},
                {'id': 'ALM-1230', 'severity': 'Minor', 'source': 'Access Network', 'message': 'Signal strength degradation', 'timestamp': '2023-06-15T13:45:51'}
            ]
        }
    
    @classmethod
    def get_case_data(cls):
        """Get case management data"""
        return {
            'summary': {
                'total_cases': 5678,
                'open_cases': 1234,
                'cases_created_today': 123,
                'cases_closed_today': 145,
                'average_resolution_time': 36.5  # hours
            },
            'case_by_priority': [
                {'priority': 'P1', 'count': 234},
                {'priority': 'P2', 'count': 567},
                {'priority': 'P3', 'count': 890},
                {'priority': 'P4', 'count': 1234}
            ],
            'case_by_department': [
                {'department': 'Technical Support', 'count': 2345},
                {'department': 'Billing Support', 'count': 1567},
                {'department': 'Sales Support', 'count': 987},
                {'department': 'General Inquiry', 'count': 779}
            ],
            'case_trend': cls.generate_time_series(base_value=200),
            'recent_cases': [
                {'id': 'CS-5678', 'priority': 'P1', 'customer': 'Global Corp', 'subject': 'Service outage', 'status': 'Open', 'created_at': '2023-06-15T14:23:45'},
                {'id': 'CS-5677', 'priority': 'P2', 'customer': 'John Smith', 'subject': 'Billing dispute', 'status': 'In Progress', 'created_at': '2023-06-15T14:15:22'},
                {'id': 'CS-5676', 'priority': 'P3', 'customer': 'Tech Solutions', 'subject': 'Plan upgrade request', 'status': 'Pending Customer', 'created_at': '2023-06-15T14:05:17'},
                {'id': 'CS-5675', 'priority': 'P1', 'customer': 'City Hospital', 'subject': 'Network connectivity issue', 'status': 'Open', 'created_at': '2023-06-15T13:58:03'},
                {'id': 'CS-5674', 'priority': 'P4', 'customer': 'Jane Doe', 'subject': 'Account information update', 'status': 'Closed', 'created_at': '2023-06-15T13:45:51'}
            ]
        }