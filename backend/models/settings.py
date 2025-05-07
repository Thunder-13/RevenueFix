from models.base import BaseModel

class SettingsModel(BaseModel):
    """Model for application settings"""
    
    @classmethod
    def get_app_settings(cls):
        """Get application settings"""
        return {
            'general': {
                'app_name': 'RevenueFix',
                'company_name': 'Telecom Analytics Inc.',
                'date_format': 'MM/DD/YYYY',
                'time_format': '12h',
                'default_currency': 'USD',
                'default_language': 'en-US',
                'timezone': 'UTC-5'
            },
            'display': {
                'theme': 'light',
                'sidebar_collapsed': False,
                'table_rows_per_page': 10,
                'chart_animation': True,
                'notifications_enabled': True
            },
            'data': {
                'data_refresh_interval': 15,  # minutes
                'cache_duration': 60,  # minutes
                'export_formats': ['csv', 'excel', 'pdf'],
                'default_date_range': '30d'
            },
            'notifications': {
                'email_alerts': True,
                'browser_notifications': True,
                'alert_threshold_revenue': 10,  # percent
                'alert_threshold_discrepancy': 5  # percent
            },
            'integrations': {
                'crm_system': 'Enabled',
                'billing_system': 'Enabled',
                'network_monitoring': 'Enabled',
                'data_warehouse': 'Enabled'
            }
        }
    
    @classmethod
    def get_upcoming_features(cls):
        """Get upcoming features"""
        return [
            {
                'id': 1,
                'name': 'AI-Powered Revenue Forecasting',
                'description': 'Machine learning algorithms to predict future revenue trends with higher accuracy',
                'status': 'In Development',
                'release_date': '2025-08-15'
            },
            {
                'id': 2,
                'name': 'Advanced Fraud Detection',
                'description': 'Real-time fraud detection system using pattern recognition and anomaly detection',
                'status': 'Planning',
                'release_date': '2025-10-01'
            },
            {
                'id': 3,
                'name': 'Interactive Revenue Maps',
                'description': 'Geographical visualization of revenue data with drill-down capabilities',
                'status': 'In Development',
                'release_date': '2025-07-30'
            },
            {
                'id': 4,
                'name': 'Custom Report Builder',
                'description': 'Drag-and-drop interface for creating custom reports and dashboards',
                'status': 'Beta Testing',
                'release_date': '2025-07-15'
            },
            {
                'id': 5,
                'name': 'Mobile App',
                'description': 'Native mobile application for iOS and Android with key metrics and alerts',
                'status': 'Planning',
                'release_date': '2025-11-15'
            }
        ]