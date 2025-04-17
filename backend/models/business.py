from models.base import BaseModel
import random
from datetime import datetime, timedelta

class BusinessModel(BaseModel):
    """Model for business analytics data"""
    
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
    def get_b2b_analysis(cls):
        """Get B2B analysis data"""
        return {
            'summary': {
                'total_b2b_revenue': 7654321.09,
                'revenue_growth': 12.5,
                'active_contracts': 1234,
                'average_contract_value': 6201.23
            },
            'revenue_by_industry': [
                {'industry': 'Financial Services', 'revenue': 2345678.90},
                {'industry': 'Healthcare', 'revenue': 1876543.21},
                {'industry': 'Manufacturing', 'revenue': 1234567.89},
                {'industry': 'Retail', 'revenue': 987654.32},
                {'industry': 'Technology', 'revenue': 765432.10}
            ],
            'top_clients': [
                {'name': 'Global Bank Corp', 'revenue': 876543.21, 'growth': 15.3},
                {'name': 'MediHealth Systems', 'revenue': 765432.10, 'growth': 8.7},
                {'name': 'TechInnovate Inc', 'revenue': 654321.09, 'growth': 22.1},
                {'name': 'Retail Giant Ltd', 'revenue': 543210.98, 'growth': 5.4},
                {'name': 'Industrial Mfg Co', 'revenue': 432109.87, 'growth': 9.8}
            ],
            'contract_renewal_rate': 87.5,
            'revenue_trend': cls.generate_time_series(base_value=7500000)
        }
    
    @classmethod
    def get_b2c_analysis(cls):
        """Get B2C analysis data"""
        return {
            'summary': {
                'total_b2c_revenue': 4876543.21,
                'revenue_growth': 7.8,
                'active_customers': 987654,
                'average_revenue_per_user': 4.94
            },
            'revenue_by_segment': [
                {'segment': 'Youth', 'revenue': 1234567.89},
                {'segment': 'Family', 'revenue': 1654321.09},
                {'segment': 'Professional', 'revenue': 1098765.43},
                {'segment': 'Senior', 'revenue': 889876.54}
            ],
            'top_packages': [
                {'name': 'Unlimited Everything', 'revenue': 987654.32, 'subscribers': 123456},
                {'name': 'Family Bundle', 'revenue': 876543.21, 'subscribers': 98765},
                {'name': 'Youth Data Pack', 'revenue': 765432.10, 'subscribers': 87654},
                {'name': 'Basic Talk & Text', 'revenue': 654321.09, 'subscribers': 76543},
                {'name': 'Senior Essentials', 'revenue': 543210.98, 'subscribers': 65432}
            ],
            'churn_rate': 2.3,
            'revenue_trend': cls.generate_time_series(base_value=4800000)
        }