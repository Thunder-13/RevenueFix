from models.base import BaseModel
import random
from datetime import datetime, timedelta

class RevenueModel(BaseModel):
    """Model for revenue data"""
    
    @staticmethod
    def generate_time_series(days=30, base_value=1000000, volatility=0.05):
        """Generate time series data for revenue charts"""
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
    def get_dashboard_metrics(cls):
        """Get metrics for the dashboard"""
        return {
            'total_revenue': 12458932.45,
            'revenue_growth': 8.7,
            'average_revenue_per_user': 42.35,
            'churn_rate': 2.1,
            'revenue_by_channel': [
                {'name': 'Voice', 'value': 4523651.23},
                {'name': 'SMS', 'value': 1245789.56},
                {'name': 'Data', 'value': 5689472.34},
                {'name': 'Fixed Line', 'value': 1000019.32}
            ],
            'revenue_trend': cls.generate_time_series(),
            'top_products': [
                {'name': 'Premium Data Plan', 'revenue': 2345678.90},
                {'name': 'Family Voice Bundle', 'revenue': 1987654.32},
                {'name': 'Business Fiber', 'revenue': 1456789.01},
                {'name': 'International SMS Pack', 'revenue': 987654.32},
                {'name': 'IoT Connectivity', 'revenue': 876543.21}
            ]
        }
    
    @classmethod
    def get_network_vs_billing(cls):
        """Get network vs billing reconciliation data"""
        return {
            'summary': {
                'total_network_records': 1245789,
                'total_billing_records': 1243567,
                'discrepancy_count': 2222,
                'discrepancy_percentage': 0.18,
                'financial_impact': 156789.45
            },
            'trend': cls.generate_time_series(days=14, base_value=0.2, volatility=0.1),
            'top_discrepancies': [
                {'service_type': 'International Roaming', 'count': 876, 'value': 65432.12},
                {'service_type': 'Premium SMS', 'count': 543, 'value': 43210.98},
                {'service_type': 'Data Bundles', 'count': 432, 'value': 32109.87},
                {'service_type': 'Voice Calls', 'count': 371, 'value': 15678.90}
            ]
        }
    
    @classmethod
    def get_mediation_vs_billing(cls):
        """Get mediation vs billing reconciliation data"""
        return {
            'summary': {
                'total_mediation_records': 9876543,
                'total_billing_records': 9875432,
                'discrepancy_count': 1111,
                'discrepancy_percentage': 0.01,
                'financial_impact': 87654.32
            },
            'trend': cls.generate_time_series(days=14, base_value=0.015, volatility=0.2),
            'top_discrepancies': [
                {'service_type': 'Content Services', 'count': 456, 'value': 34567.89},
                {'service_type': 'Third-party Billing', 'count': 321, 'value': 23456.78},
                {'service_type': 'Premium Services', 'count': 234, 'value': 12345.67},
                {'service_type': 'Subscription Services', 'count': 100, 'value': 9876.54}
            ]
        }