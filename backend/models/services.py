from models.base import BaseModel
import random
from datetime import datetime, timedelta

class ServicesModel(BaseModel):
    """Model for telecom services data"""
    
    @staticmethod
    def generate_time_series(days=30, base_value=1000000, volatility=0.05):
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
    def get_fixed_line_data(cls):
        """Get fixed line service data"""
        return {
            'summary': {
                'total_revenue': 2345678.90,
                'active_lines': 234567,
                'average_revenue_per_line': 10.00,
                'growth_rate': 3.2
            },
            'revenue_by_service_type': [
                {'type': 'Residential', 'revenue': 1234567.89},
                {'type': 'Business', 'revenue': 876543.21},
                {'type': 'Enterprise', 'revenue': 234567.80}
            ],
            'top_packages': [
                {'name': 'Fiber Premium', 'revenue': 654321.09, 'subscribers': 65432},
                {'name': 'Business Line Pro', 'revenue': 543210.98, 'subscribers': 54321},
                {'name': 'Home Essentials', 'revenue': 432109.87, 'subscribers': 43210},
                {'name': 'Enterprise Connect', 'revenue': 321098.76, 'subscribers': 32109},
                {'name': 'Basic Line', 'revenue': 210987.65, 'subscribers': 21098}
            ],
            'installation_trend': cls.generate_time_series(base_value=500, volatility=0.1),
            'revenue_trend': cls.generate_time_series(base_value=2300000)
        }
    
    @classmethod
    def get_voice_sms_data_metrics(cls):
        """Get voice, SMS, and data service metrics"""
        return {
            'voice': {
                'total_revenue': 3456789.01,
                'call_minutes': 987654321,
                'average_revenue_per_minute': 0.0035,
                'growth_rate': -1.2,
                'revenue_trend': cls.generate_time_series(base_value=3500000, volatility=0.03)
            },
            'sms': {
                'total_revenue': 1234567.89,
                'message_count': 876543210,
                'average_revenue_per_message': 0.0014,
                'growth_rate': -2.5,
                'revenue_trend': cls.generate_time_series(base_value=1250000, volatility=0.04)
            },
            'data': {
                'total_revenue': 5678901.23,
                'data_usage_tb': 98765,
                'average_revenue_per_gb': 0.0576,
                'growth_rate': 15.7,
                'revenue_trend': cls.generate_time_series(base_value=5600000, volatility=0.06)
            },
            'service_distribution': [
                {'name': 'Voice', 'percentage': 33.4},
                {'name': 'SMS', 'percentage': 11.9},
                {'name': 'Data', 'percentage': 54.7}
            ]
        }