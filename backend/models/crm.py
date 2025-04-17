from models.base import BaseModel
import random
from datetime import datetime, timedelta

class CRMModel(BaseModel):
    """Model for CRM data"""
    
    @staticmethod
    def generate_time_series(days=30, base_value=1000, volatility=0.05):
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
    def get_crm_insights(cls):
        """Get CRM insights data"""
        return {
            'summary': {
                'total_customers': 1234567,
                'new_customers_mtd': 12345,
                'churn_rate': 2.3,
                'customer_satisfaction': 87.5
            },
            'customer_segments': [
                {'segment': 'High Value', 'count': 123456, 'percentage': 10.0},
                {'segment': 'Medium Value', 'count': 370370, 'percentage': 30.0},
                {'segment': 'Low Value', 'count': 740741, 'percentage': 60.0}
            ],
            'customer_lifecycle': [
                {'stage': 'Acquisition', 'count': 12345},
                {'stage': 'Onboarding', 'count': 9876},
                {'stage': 'Growth', 'count': 345678},
                {'stage': 'Retention', 'count': 654321},
                {'stage': 'At Risk', 'count': 23456},
                {'stage': 'Churned', 'count': 7890}
            ],
            'top_complaints': [
                {'issue': 'Network Coverage', 'count': 5432},
                {'issue': 'Billing Issues', 'count': 4321},
                {'issue': 'Data Speed', 'count': 3210},
                {'issue': 'Customer Service', 'count': 2109},
                {'issue': 'Plan Features', 'count': 1098}
            ],
            'customer_satisfaction_trend': cls.generate_time_series(base_value=87, volatility=0.02),
            'churn_trend': cls.generate_time_series(base_value=2.3, volatility=0.1)
        }