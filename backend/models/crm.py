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
                'total_customers': 10741,
                'new_customers_mtd': 124,
                'churn_rate': 2.3,
                'customer_satisfaction': 87.5,
                'arpu': 48.3,
            },
            'customer_segments': [
                {'segment': 'High Value', 'count': 271, 'percentage': 10.0},
                {'segment': 'Medium Value', 'count': 4781, 'percentage': 30.0},
                {'segment': 'Low Value', 'count': 5689, 'percentage': 60.0}
            ],
            'customer_lifecycle': [
                {'stage': 'Acquisition', 'count': 1234},
                {'stage': 'Onboarding', 'count': 987},
                {'stage': 'Growth', 'count': 34567},
                {'stage': 'Retention', 'count': 65432},
                {'stage': 'At Risk', 'count': 234},
                {'stage': 'Churned', 'count': 789}
            ],
            'top_complaints': [
                {'issue': 'Network Coverage', 'count': 543},
                {'issue': 'Billing Issues', 'count': 432},
                {'issue': 'Data Speed', 'count': 321},
                {'issue': 'Customer Service', 'count': 210},
                {'issue': 'Plan Features', 'count': 109}
            ],
            'customer_satisfaction_trend': cls.generate_time_series(base_value=87, volatility=0.02),
            'churn_trend': cls.generate_time_series(base_value=2.3, volatility=0.1)
        }