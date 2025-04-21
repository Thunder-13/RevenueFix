import pandas as pd
import os
import json
from datetime import datetime, timedelta
import random

class DataProcessor:
    """Process CSV data files and generate analytics"""
    
    @staticmethod
    def load_csv(file_path):
        """Load CSV file into pandas DataFrame"""
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            print(f"Error loading CSV file {file_path}: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def get_crm_billing_analytics():
        """Process CRM and Billing data for reconciliation"""
        crm_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'KRA4-CRM-100rows.csv')
        billing_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'KRA4-Billing-100rows.csv')
        
        try:
            # Check if files exist
            if not os.path.exists(crm_file) or not os.path.exists(billing_file):
                print("CSV files not found, using dummy data")
                return DataProcessor.generate_dummy_crm_billing_data()
            
            # Load CSV files
            crm_df = pd.read_csv(crm_file)
            billing_df = pd.read_csv(billing_file)
            
            # Clean and prepare data
            # Remove leading/trailing spaces from column names
            crm_df.columns = crm_df.columns.str.strip()
            billing_df.columns = billing_df.columns.str.strip()
            
            # Identify duplicate rows in CRM and Billing
            crm_duplicates = crm_df.duplicated(subset=['Account_ID', 'Customer_ID', 'MSISDN']).sum()
            billing_duplicates = billing_df.duplicated(subset=['Account_ID', 'Customer_ID', 'MSISDN']).sum()
            total_duplicates = crm_duplicates + billing_duplicates
            
            # Remove duplicates for analysis
            crm_df = crm_df.drop_duplicates(subset=['Account_ID', 'Customer_ID', 'MSISDN'])
            billing_df = billing_df.drop_duplicates(subset=['Account_ID', 'Customer_ID', 'MSISDN'])
            
            # Merge datasets on common keys for comparison
            merged_df = pd.merge(
                crm_df, 
                billing_df, 
                on=['Account_ID', 'Customer_ID', 'MSISDN'], 
                how='inner',
                suffixes=('_crm', '_billing')
            )
            
            # Calculate mismatches
            # Bill Plan mismatches
            bill_plan_mismatches = merged_df[merged_df['Bill_Plan'] != merged_df['BillPlan_ID']]
            
            # Account Status mismatches
            account_status_mismatches = merged_df[merged_df['Account_Status_crm'] != merged_df['Account_Status_billing']]
            crm_active_billing_inactive = merged_df[(merged_df['Account_Status_crm'] == 'ACT') & (merged_df['Account_Status_billing'] == 'INACT')].shape[0]
            crm_inactive_billing_active = merged_df[(merged_df['Account_Status_crm'] == 'INACT') & (merged_df['Account_Status_billing'] == 'ACT')].shape[0]
            
            # Start Date mismatches
            start_date_mismatches = merged_df[merged_df['Account_Creation_Date'] != merged_df['Account_Start_Date']]
            
            # Enterprise category breakdown
            enterprise_breakdown = []
            for category in merged_df['BUS_ENT'].unique():
                category_df = merged_df[merged_df['BUS_ENT'] == category]
                category_bill_plan_mismatches = category_df[category_df['Bill_Plan'] != category_df['BillPlan_ID']].shape[0]
                category_crm_active_billing_inactive = category_df[(category_df['Account_Status_crm'] == 'ACT') & (category_df['Account_Status_billing'] == 'INACT')].shape[0]
                category_crm_inactive_billing_active = category_df[(category_df['Account_Status_crm'] == 'INACT') & (category_df['Account_Status_billing'] == 'ACT')].shape[0]
                
                enterprise_breakdown.append({
                    'category': category,
                    'mismatched_bill_plans': category_bill_plan_mismatches,
                    'crm_active_billing_inactive': category_crm_active_billing_inactive,
                    'crm_inactive_billing_active': category_crm_inactive_billing_active,
                    'total_accounts': category_df.shape[0]
                })
            
            # Generate trend data for mismatches over time
            trend_data = []
            today = datetime.now()
            for i in range(30):
                date = today - timedelta(days=30-i-1)
                # Simulate decreasing trend in mismatches
                mismatch_percentage = max(0.1, (bill_plan_mismatches.shape[0] + account_status_mismatches.shape[0] + start_date_mismatches.shape[0]) / merged_df.shape[0] * 100 * (1 - i/60))
                trend_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'value': round(mismatch_percentage, 2)
                })
            
            # Sample mismatched accounts for display
            mismatched_accounts = []
            
            # Add bill plan mismatches
            for _, row in bill_plan_mismatches.head(2).iterrows():
                mismatched_accounts.append({
                    'customer_id': row['Customer_ID'],
                    'account_id': row['Account_ID'],
                    'msisdn': row['MSISDN'],
                    'crm_status': row['Account_Status_crm'],
                    'billing_status': row['Account_Status_billing'],
                    'crm_bill_plan': row['Bill_Plan'],
                    'billing_bill_plan': row['BillPlan_ID'],
                    'enterprise_category': row['BUS_ENT'],
                    'mismatch_type': 'Bill Plan'
                })
            
            # Add account status mismatches
            for _, row in account_status_mismatches.head(2).iterrows():
                mismatched_accounts.append({
                    'customer_id': row['Customer_ID'],
                    'account_id': row['Account_ID'],
                    'msisdn': row['MSISDN'],
                    'crm_status': row['Account_Status_crm'],
                    'billing_status': row['Account_Status_billing'],
                    'crm_bill_plan': row['Bill_Plan'],
                    'billing_bill_plan': row['BillPlan_ID'],
                    'enterprise_category': row['BUS_ENT'],
                    'mismatch_type': 'Account Status'
                })
            
            # Add start date mismatches
            for _, row in start_date_mismatches.head(1).iterrows():
                mismatched_accounts.append({
                    'customer_id': row['Customer_ID'],
                    'account_id': row['Account_ID'],
                    'msisdn': row['MSISDN'],
                    'crm_status': row['Account_Status_crm'],
                    'billing_status': row['Account_Status_billing'],
                    'crm_bill_plan': row['Bill_Plan'],
                    'billing_bill_plan': row['BillPlan_ID'],
                    'enterprise_category': row['BUS_ENT'],
                    'mismatch_type': 'Start Date'
                })
            
            # Calculate total accounts and mismatch percentage
            total_accounts = merged_df.shape[0]
            total_mismatches = bill_plan_mismatches.shape[0] + account_status_mismatches.shape[0] + start_date_mismatches.shape[0]
            mismatch_percentage = (total_mismatches / total_accounts) * 100 if total_accounts > 0 else 0
            
            # Generate visualization data
            mismatch_visualization = [
                {'name': 'Bill Plan Mismatches', 'value': bill_plan_mismatches.shape[0]},
                {'name': 'Account Status Mismatches', 'value': account_status_mismatches.shape[0]},
                {'name': 'Start Date Mismatches', 'value': start_date_mismatches.shape[0]},
                {'name': 'Matched Records', 'value': total_accounts - total_mismatches}
            ]
            
            return {
                'summary': {
                    'total_accounts': total_accounts + total_duplicates,  # Include duplicates in total count
                    'mismatched_bill_plans': bill_plan_mismatches.shape[0],
                    'mismatched_account_status': account_status_mismatches.shape[0],
                    'mismatched_start_dates': start_date_mismatches.shape[0],
                    'duplicate_records': total_duplicates,
                    'mismatch_percentage': round(mismatch_percentage, 2)
                },
                'account_status': {
                    'crm_active_billing_inactive': crm_active_billing_inactive,
                    'crm_inactive_billing_active': crm_inactive_billing_active
                },
                'enterprise_breakdown': enterprise_breakdown,
                'trend_data': trend_data,
                'mismatched_accounts': mismatched_accounts,
                'mismatch_visualization': mismatch_visualization
            }
            
        except Exception as e:
            print(f"Error processing CRM vs Billing data: {e}")
            import traceback
            traceback.print_exc()
            return DataProcessor.generate_dummy_crm_billing_data()
    
    @staticmethod
    def generate_dummy_crm_billing_data():
        """Generate dummy CRM vs Billing data"""
        total_accounts = 10000
        mismatched_bill_plans = 245
        mismatched_account_status = 178
        mismatched_start_dates = 89
        duplicate_records = 32
        
        return {
            'summary': {
                'total_accounts': total_accounts,
                'mismatched_bill_plans': mismatched_bill_plans,
                'mismatched_account_status': mismatched_account_status,
                'mismatched_start_dates': mismatched_start_dates,
                'duplicate_records': duplicate_records,
                'mismatch_percentage': round((mismatched_bill_plans + mismatched_account_status + mismatched_start_dates) / total_accounts * 100, 2)
            },
            'account_status': {
                'crm_active_billing_inactive': 103,
                'crm_inactive_billing_active': 75
            },
            'enterprise_breakdown': [
                {
                    'category': 'Enterprise',
                    'mismatched_bill_plans': 87,
                    'crm_active_billing_inactive': 42,
                    'crm_inactive_billing_active': 31,
                    'total_accounts': 3500
                },
                {
                    'category': 'SME',
                    'mismatched_bill_plans': 65,
                    'crm_active_billing_inactive': 28,
                    'crm_inactive_billing_active': 19,
                    'total_accounts': 2800
                },
                {
                    'category': 'Government',
                    'mismatched_bill_plans': 43,
                    'crm_active_billing_inactive': 18,
                    'crm_inactive_billing_active': 12,
                    'total_accounts': 1200
                },
                {
                    'category': 'Education',
                    'mismatched_bill_plans': 32,
                    'crm_active_billing_inactive': 9,
                    'crm_inactive_billing_active': 8,
                    'total_accounts': 1500
                },
                {
                    'category': 'Healthcare',
                    'mismatched_bill_plans': 18,
                    'crm_active_billing_inactive': 6,
                    'crm_inactive_billing_active': 5,
                    'total_accounts': 1000
                }
            ],
            'trend_data': DataProcessor.generate_time_series(30, 5, 0.3),
            'mismatched_accounts': [
                {
                    'customer_id': 'C10045678',
                    'account_id': 'A20056789',
                    'msisdn': '9876543210',
                    'crm_status': 'Active',
                    'billing_status': 'Inactive',
                    'crm_bill_plan': 'Enterprise Premium',
                    'billing_bill_plan': 'Enterprise Standard',
                    'enterprise_category': 'Enterprise',
                    'mismatch_type': 'Bill Plan, Account Status'
                },
                {
                    'customer_id': 'C10045679',
                    'account_id': 'A20056790',
                    'msisdn': '9876543211',
                    'crm_status': 'Inactive',
                    'billing_status': 'Active',
                    'crm_bill_plan': 'SME Basic',
                    'billing_bill_plan': 'SME Basic',
                    'enterprise_category': 'SME',
                    'mismatch_type': 'Account Status'
                },
                {
                    'customer_id': 'C10045680',
                    'account_id': 'A20056791',
                    'msisdn': '9876543212',
                    'crm_status': 'Active',
                    'billing_status': 'Active',
                    'crm_bill_plan': 'Government Special',
                    'billing_bill_plan': 'Government Standard',
                    'enterprise_category': 'Government',
                    'mismatch_type': 'Bill Plan'
                },
                {
                    'customer_id': 'C10045681',
                    'account_id': 'A20056792',
                    'msisdn': '9876543213',
                    'crm_status': 'Active',
                    'billing_status': 'Active',
                    'crm_bill_plan': 'Education Premium',
                    'billing_bill_plan': 'Education Premium',
                    'enterprise_category': 'Education',
                    'mismatch_type': 'Start Date'
                },
                {
                    'customer_id': 'C10045682',
                    'account_id': 'A20056793',
                    'msisdn': '9876543214',
                    'crm_status': 'Active',
                    'billing_status': 'Inactive',
                    'crm_bill_plan': 'Healthcare Basic',
                    'billing_bill_plan': 'Healthcare Basic',
                    'enterprise_category': 'Healthcare',
                    'mismatch_type': 'Account Status'
                }
            ],
            'mismatch_visualization': [
                {'name': 'Bill Plan Mismatches', 'value': mismatched_bill_plans},
                {'name': 'Account Status Mismatches', 'value': mismatched_account_status},
                {'name': 'Start Date Mismatches', 'value': mismatched_start_dates},
                {'name': 'Matched Records', 'value': total_accounts - mismatched_bill_plans - mismatched_account_status - mismatched_start_dates}
            ]
        }
    
    @staticmethod
    def get_crm_analytics():
        """Process CRM data and return analytics"""
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'KRA4-CRM-100rows.csv')
        
        try:
            df = DataProcessor.load_csv(file_path)
            if df.empty:
                return DataProcessor.generate_dummy_crm_data()
            
            # Process actual data
            total_customers = len(df['CustomerID'].unique())
            new_customers = len(df[df['CustomerAge'] < 30])
            churn_rate = round(len(df[df['ChurnRisk'] > 0.7]) / total_customers * 100, 1)
            satisfaction = round(df['Satisfaction'].mean() * 20, 1)  # Assuming 0-5 scale, converting to percentage
            
            # Customer segments
            segments = df.groupby('Segment').agg({
                'CustomerID': 'nunique'
            }).reset_index()
            segments['percentage'] = round(segments['CustomerID'] / total_customers * 100, 1)
            segments.columns = ['segment', 'count', 'percentage']
            
            # Customer lifecycle
            lifecycle_stages = ['Acquisition', 'Onboarding', 'Growth', 'Retention', 'At Risk', 'Churned']
            lifecycle_counts = [
                len(df[df['CustomerAge'] < 30]),
                len(df[(df['CustomerAge'] >= 30) & (df['CustomerAge'] < 90)]),
                len(df[(df['CustomerAge'] >= 90) & (df['CustomerAge'] < 365)]),
                len(df[(df['CustomerAge'] >= 365) & (df['ChurnRisk'] < 0.4)]),
                len(df[(df['ChurnRisk'] >= 0.4) & (df['ChurnRisk'] < 0.7)]),
                len(df[df['ChurnRisk'] >= 0.7])
            ]
            
            lifecycle = [{'stage': stage, 'count': count} for stage, count in zip(lifecycle_stages, lifecycle_counts)]
            
            # Top complaints (simulated)
            complaints = [
                {'issue': 'Network Coverage', 'count': random.randint(100, 500)},
                {'issue': 'Billing Issues', 'count': random.randint(100, 500)},
                {'issue': 'Data Speed', 'count': random.randint(100, 500)},
                {'issue': 'Customer Service', 'count': random.randint(100, 500)},
                {'issue': 'Plan Features', 'count': random.randint(100, 500)}
            ]
            
            # Generate trend data
            satisfaction_trend = DataProcessor.generate_time_series(30, satisfaction, 0.02)
            churn_trend = DataProcessor.generate_time_series(30, churn_rate, 0.1)
            
            return {
                'summary': {
                    'total_customers': total_customers,
                    'new_customers_mtd': new_customers,
                    'churn_rate': churn_rate,
                    'customer_satisfaction': satisfaction
                },
                'customer_segments': segments.to_dict('records'),
                'customer_lifecycle': lifecycle,
                'top_complaints': complaints,
                'customer_satisfaction_trend': satisfaction_trend,
                'churn_trend': churn_trend
            }
            
        except Exception as e:
            print(f"Error processing CRM data: {e}")
            return DataProcessor.generate_dummy_crm_data()
    
    @staticmethod
    def get_billing_analytics():
        """Process Billing data and return analytics"""
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'KRA4-Billing-100rows.csv')
        
        try:
            df = DataProcessor.load_csv(file_path)
            if df.empty:
                return DataProcessor.generate_dummy_billing_data()
            
            # Process actual data
            total_revenue = df['Amount'].sum()
            previous_revenue = total_revenue * 0.92  # Simulating previous period
            revenue_growth = round((total_revenue - previous_revenue) / previous_revenue * 100, 1)
            
            # Revenue by channel
            if 'Channel' in df.columns:
                channels = df.groupby('Channel').agg({
                    'Amount': 'sum'
                }).reset_index()
                channels.columns = ['name', 'value']
                revenue_by_channel = channels.to_dict('records')
            else:
                # Simulate channels if not in data
                revenue_by_channel = [
                    {'name': 'Voice', 'value': total_revenue * 0.35},
                    {'name': 'SMS', 'value': total_revenue * 0.10},
                    {'name': 'Data', 'value': total_revenue * 0.45},
                    {'name': 'Fixed Line', 'value': total_revenue * 0.10}
                ]
            
            # Revenue trend
            revenue_trend = DataProcessor.generate_time_series(30, total_revenue/30, 0.05)
            
            # Top products
            if 'Product' in df.columns:
                products = df.groupby('Product').agg({
                    'Amount': 'sum'
                }).reset_index().sort_values('Amount', ascending=False).head(5)
                products.columns = ['name', 'revenue']
                top_products = products.to_dict('records')
            else:
                # Simulate products if not in data
                top_products = [
                    {'name': 'Premium Data Plan', 'revenue': total_revenue * 0.20},
                    {'name': 'Family Voice Bundle', 'revenue': total_revenue * 0.15},
                    {'name': 'Business Fiber', 'revenue': total_revenue * 0.12},
                    {'name': 'International SMS Pack', 'revenue': total_revenue * 0.08},
                    {'name': 'IoT Connectivity', 'revenue': total_revenue * 0.07}
                ]
            
            # Calculate ARPU
            if 'CustomerID' in df.columns:
                total_users = len(df['CustomerID'].unique())
                arpu = round(total_revenue / total_users, 2)
            else:
                # Simulate ARPU if customer data not available
                arpu = round(total_revenue / 10000, 2)
            
            # Simulate churn rate
            churn_rate = round(random.uniform(1.8, 2.5), 1)
            
            return {
                'total_revenue': total_revenue,
                'revenue_growth': revenue_growth,
                'average_revenue_per_user': arpu,
                'churn_rate': churn_rate,
                'revenue_by_channel': revenue_by_channel,
                'revenue_trend': revenue_trend,
                'top_products': top_products
            }
            
        except Exception as e:
            print(f"Error processing Billing data: {e}")
            return DataProcessor.generate_dummy_billing_data()
    
    @staticmethod
    def get_network_billing_reconciliation():
        """Process Network and Billing data for reconciliation"""
        billing_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'KRA4-Billing-100rows.csv')
        
        try:
            df = DataProcessor.load_csv(billing_file)
            if df.empty:
                return DataProcessor.generate_dummy_network_billing_data()
            
            # Simulate network records based on billing data
            total_billing_records = len(df)
            total_network_records = total_billing_records + random.randint(10, 50)
            
            discrepancy_count = total_network_records - total_billing_records
            discrepancy_percentage = round(discrepancy_count / total_network_records * 100, 2)
            
            # Calculate financial impact
            avg_amount = df['Amount'].mean() if 'Amount' in df.columns else 50
            financial_impact = discrepancy_count * avg_amount
            
            # Generate trend data
            trend = DataProcessor.generate_time_series(14, discrepancy_percentage/100, 0.1)
            
            # Generate top discrepancies
            service_types = ['International Roaming', 'Premium SMS', 'Data Bundles', 'Voice Calls']
            top_discrepancies = []
            
            remaining_count = discrepancy_count
            for service_type in service_types:
                if remaining_count <= 0:
                    break
                    
                count = random.randint(1, min(remaining_count, 500))
                remaining_count -= count
                value = count * avg_amount
                
                top_discrepancies.append({
                    'service_type': service_type,
                    'count': count,
                    'value': value
                })
            
            return {
                'summary': {
                    'total_network_records': total_network_records,
                    'total_billing_records': total_billing_records,
                    'discrepancy_count': discrepancy_count,
                    'discrepancy_percentage': discrepancy_percentage,
                    'financial_impact': financial_impact
                },
                'trend': trend,
                'top_discrepancies': top_discrepancies
            }
            
        except Exception as e:
            print(f"Error processing Network-Billing reconciliation: {e}")
            return DataProcessor.generate_dummy_network_billing_data()
    
    @staticmethod
    def get_kra_data(kra_id):
        """Get KRA data for specific KRA ID"""
        # This would typically come from a database or specific analysis
        # For now, we'll generate some sample KRA data
        
        kra_types = {
            "revenue": {
                "title": "Revenue KRA",
                "description": "Key Revenue Analytics",
                "metrics": [
                    {"name": "Total Revenue", "value": 12458932.45, "target": 13000000, "achievement": 95.8},
                    {"name": "ARPU", "value": 42.35, "target": 45.00, "achievement": 94.1},
                    {"name": "Revenue Growth", "value": 8.7, "target": 10.0, "achievement": 87.0}
                ],
                "trend": DataProcessor.generate_time_series(12, 1000000, 0.05, "monthly")
            },
            "customer": {
                "title": "Customer KRA",
                "description": "Key Customer Analytics",
                "metrics": [
                    {"name": "Customer Satisfaction", "value": 87.5, "target": 90.0, "achievement": 97.2},
                    {"name": "Churn Rate", "value": 2.1, "target": 1.8, "achievement": 85.7},
                    {"name": "New Customers", "value": 12345, "target": 15000, "achievement": 82.3}
                ],
                "trend": DataProcessor.generate_time_series(12, 10000, 0.08, "monthly")
            },
            "operations": {
                "title": "Operations KRA",
                "description": "Key Operational Analytics",
                "metrics": [
                    {"name": "Network Uptime", "value": 99.95, "target": 99.99, "achievement": 99.9},
                    {"name": "Ticket Resolution Time", "value": 4.2, "target": 4.0, "achievement": 95.2},
                    {"name": "First Call Resolution", "value": 78.3, "target": 85.0, "achievement": 92.1}
                ],
                "trend": DataProcessor.generate_time_series(12, 99.9, 0.001, "monthly")
            }
        }
        
        if kra_id in kra_types:
            return kra_types[kra_id]
        else:
            # Default to revenue if KRA ID not found
            return kra_types["revenue"]
    
    @staticmethod
    def get_kpi_data(kpi_id):
        """Get KPI data for specific KPI ID"""
        # This would typically come from a database or specific analysis
        # For now, we'll generate some sample KPI data
        
        kpi_types = {
            "arpu": {
                "title": "Average Revenue Per User",
                "description": "ARPU across different segments",
                "current_value": 42.35,
                "previous_value": 40.12,
                "change_percentage": 5.6,
                "breakdown": [
                    {"segment": "Consumer", "value": 35.45},
                    {"segment": "Business", "value": 87.23},
                    {"segment": "Enterprise", "value": 245.67}
                ],
                "trend": DataProcessor.generate_time_series(24, 40, 0.03, "monthly"),
                "details": [
                    {"id": 1, "segment": "Consumer", "plan": "Basic", "arpu": 25.45, "users": 45678},
                    {"id": 2, "segment": "Consumer", "plan": "Premium", "arpu": 45.45, "users": 23456},
                    {"id": 3, "segment": "Business", "plan": "Small Business", "arpu": 65.78, "users": 5678},
                    {"id": 4, "segment": "Business", "plan": "Corporate", "arpu": 108.67, "users": 3456},
                    {"id": 5, "segment": "Enterprise", "plan": "Standard", "arpu": 187.45, "users": 1234},
                    {"id": 6, "segment": "Enterprise", "plan": "Premium", "arpu": 303.89, "users": 567}
                ]
            },
            "churn": {
                "title": "Customer Churn Rate",
                "description": "Churn rate across different segments",
                "current_value": 2.1,
                "previous_value": 2.3,
                "change_percentage": -8.7,
                "breakdown": [
                    {"segment": "Consumer", "value": 2.4},
                    {"segment": "Business", "value": 1.7},
                    {"segment": "Enterprise", "value": 0.9}
                ],
                "trend": DataProcessor.generate_time_series(24, 2.3, 0.1, "monthly"),
                "details": [
                    {"id": 1, "segment": "Consumer", "plan": "Basic", "churn": 2.8, "users": 45678},
                    {"id": 2, "segment": "Consumer", "plan": "Premium", "churn": 2.0, "users": 23456},
                    {"id": 3, "segment": "Business", "plan": "Small Business", "churn": 1.9, "users": 5678},
                    {"id": 4, "segment": "Business", "plan": "Corporate", "churn": 1.5, "users": 3456},
                    {"id": 5, "segment": "Enterprise", "plan": "Standard", "churn": 1.1, "users": 1234},
                    {"id": 6, "segment": "Enterprise", "plan": "Premium", "churn": 0.7, "users": 567}
                ]
            },
            "revenue": {
                "title": "Revenue Growth",
                "description": "Revenue growth across different segments",
                "current_value": 8.7,
                "previous_value": 7.5,
                "change_percentage": 16.0,
                "breakdown": [
                    {"segment": "Consumer", "value": 7.2},
                    {"segment": "Business", "value": 9.5},
                    {"segment": "Enterprise", "value": 12.3}
                ],
                "trend": DataProcessor.generate_time_series(24, 7.5, 0.1, "monthly"),
                "details": [
                    {"id": 1, "segment": "Consumer", "product": "Voice", "growth": 5.2, "revenue": 4523651.23},
                    {"id": 2, "segment": "Consumer", "product": "Data", "growth": 9.1, "revenue": 5689472.34},
                    {"id": 3, "segment": "Business", "product": "Voice", "growth": 6.7, "revenue": 2345678.90},
                    {"id": 4, "segment": "Business", "product": "Data", "growth": 12.3, "revenue": 3456789.01},
                    {"id": 5, "segment": "Enterprise", "product": "Voice", "growth": 8.9, "revenue": 1876543.21},
                    {"id": 6, "segment": "Enterprise", "product": "Data", "growth": 15.7, "revenue": 2987654.32}
                ]
            }
        }
        
        if kpi_id in kpi_types:
            return kpi_types[kpi_id]
        else:
            # Default to ARPU if KPI ID not found
            return kpi_types["arpu"]
    
    @staticmethod
    def generate_time_series(periods=30, base_value=1000000, volatility=0.05, period_type="daily"):
        """Generate time series data for charts"""
        data = []
        today = datetime.now()
        
        for i in range(periods):
            if period_type == "daily":
                date = today - timedelta(days=periods-i-1)
                date_format = date.strftime('%Y-%m-%d')
            elif period_type == "monthly":
                date = today - timedelta(days=30*(periods-i-1))
                date_format = date.strftime('%Y-%m')
            else:
                date = today - timedelta(days=periods-i-1)
                date_format = date.strftime('%Y-%m-%d')
                
            # Add some randomness to the value
            change = (random.random() - 0.5) * 2 * volatility
            value = base_value * (1 + change)
            base_value = value  # For the next period
            
            data.append({
                'date': date_format,
                'value': round(value, 2)
            })
            
        return data
    
    @staticmethod
    def generate_dummy_crm_data():
        """Generate dummy CRM data"""
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
            'customer_satisfaction_trend': DataProcessor.generate_time_series(30, 87, 0.02),
            'churn_trend': DataProcessor.generate_time_series(30, 2.3, 0.1)
        }
    
    @staticmethod
    def generate_dummy_billing_data():
        """Generate dummy billing data"""
        total_revenue = 12458932.45
        
        return {
            'total_revenue': total_revenue,
            'revenue_growth': 8.7,
            'average_revenue_per_user': 42.35,
            'churn_rate': 2.1,
            'revenue_by_channel': [
                {'name': 'Voice', 'value': 4523651.23},
                {'name': 'SMS', 'value': 1245789.56},
                {'name': 'Data', 'value': 5689472.34},
                {'name': 'Fixed Line', 'value': 1000019.32}
            ],
            'revenue_trend': DataProcessor.generate_time_series(30, total_revenue/30, 0.05),
            'top_products': [
                {'name': 'Premium Data Plan', 'revenue': 2345678.90},
                {'name': 'Family Voice Bundle', 'revenue': 1987654.32},
                {'name': 'Business Fiber', 'revenue': 1456789.01},
                {'name': 'International SMS Pack', 'revenue': 987654.32},
                {'name': 'IoT Connectivity', 'revenue': 876543.21}
            ]
        }
    
    @staticmethod
    def generate_dummy_network_billing_data():
        """Generate dummy network billing reconciliation data"""
        return {
            'summary': {
                'total_network_records': 1245789,
                'total_billing_records': 1243567,
                'discrepancy_count': 2222,
                'discrepancy_percentage': 0.18,
                'financial_impact': 156789.45
            },
            'trend': DataProcessor.generate_time_series(14, 0.2/100, 0.1),
            'top_discrepancies': [
                {'service_type': 'International Roaming', 'count': 876, 'value': 65432.12},
                {'service_type': 'Premium SMS', 'count': 543, 'value': 43210.98},
                {'service_type': 'Data Bundles', 'count': 432, 'value': 32109.87},
                {'service_type': 'Voice Calls', 'count': 371, 'value': 15678.90}
            ]
        }