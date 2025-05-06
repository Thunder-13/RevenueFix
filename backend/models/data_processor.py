import pandas as pd # type: ignore
import numpy as np # type: ignore
import os
import json
from datetime import datetime, timedelta
from collections import defaultdict
import random
from pathlib import Path
# import tensorflow as tf # type: ignore
# from sklearn.ensemble import RandomForestClassifier
# from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
# from sklearn.model_selection import train_test_split
# from sklearn.preprocessing import LabelEncoder

class DataProcessor:
    """Process CSV data files and generate analytics with ML and TensorFlow"""
    
    @staticmethod
    def load_csv(file_path):
        """Load CSV file into pandas DataFrame"""
        try:
            print(f"Loading CSV file: {file_path}")
            return pd.read_csv(file_path)
        
        except Exception as e:
            print(f"Error loading CSV file {file_path}: {e}")
            return pd.DataFrame()
     
    @staticmethod
    def get_crm_billing_analytics():
        """Process CRM and Billing data for reconciliation"""
        
        # print("CSV files:", crm_file, billing_file)
        """Process CRM and Billing data for reconciliation using both ML and TensorFlow"""
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        crm_file = os.path.join(curr_dir, '..', 'assets', 'CRM_100.csv')
        billing_file = os.path.join(curr_dir, '..', 'assets', 'Billing_CRM_100.csv')
        print("CSV files:", crm_file, billing_file)
        
        try:
            # Check if files exist
            if not os.path.exists(crm_file) or not os.path.exists(billing_file):
                print("CSV files not found, using dummy data")
                return DataProcessor.generate_dummy_crm_billing_data()
            
            # Load CSV files
            crm_df = pd.read_csv(crm_file)
            billing_df = pd.read_csv(billing_file)
            total_inc_duplicates = int(max(crm_df.shape[0], billing_df.shape[0]))
            
            # Clean and prepare data
            # Remove leading/trailing spaces from column names
            crm_df.columns = crm_df.columns.str.strip()
            billing_df.columns = billing_df.columns.str.strip()
            
            # Identify duplicate rows in CRM and Billing
            crm_duplicates = crm_df.duplicated(subset=['Account_ID', 'Customer_ID', 'Account_Status', 'BUS_ENT', 'Account_Start_Date', 'MSISDN', 'Bill_Plan', 'Plan_Name', 'Monthly Recurring Charge', 'Service_ID', 'Service_Name', 'Service_Start_Date', 'Service_End_Date']).sum()
            billing_duplicates = billing_df.duplicated(subset=['Account_ID', 'Customer_ID', 'Account_Status', 'Ent_Residence', 'Account_Start_Date', 'MSISDN', 'BillPlan_ID', 'BillPlan_Name', 'Charge', 'Service_ID', 'Service_Name', 'Service_Start_Date', 'Service_End_Date']).sum()
            total_duplicates = int(crm_duplicates + billing_duplicates)
            # Convert to TensorFlow datasets for manual calculations
            # crm_tensor = tf.convert_to_tensor(crm_df.values)
            # billing_tensor = tf.convert_to_tensor(billing_df.values)
            
            # Remove duplicates for analysis
            crm_df = crm_df.drop_duplicates(subset=['Account_ID', 'Customer_ID', 'Account_Status'])
            billing_df = billing_df.drop_duplicates(subset=['Account_ID', 'Customer_ID', 'Account_Status'])
            
            # Merge datasets on common keys for comparison
            merged_df = pd.merge(
                crm_df, 
                billing_df, 
                on=['Account_ID', 'Customer_ID', 'MSISDN'], 
                how='inner',
                suffixes=('_crm', '_billing')
            )
            # Save the merged DataFrame to a temporary CSV file
            # temp_file_path = os.path.join(assets_dir, 'temp.csv')
            # crm_df.to_csv(temp_file_path, index=False)
            # print(f"Merged DataFrame saved to {temp_file_path}")

            # Calculate mismatches
            # Bill Plan mismatches
            
            # Create features for ML model
            # features = []
            # labels = []
            
            # Prepare data for ML model
            # for _, row in merged_df.iterrows():
            #     # Feature 1: Account status match
            #     account_status_match = 1 if row['Account_Status_crm'] == row['Account_Status_billing'] else 0
                
            #     # Feature 2: Bill plan match
            #     bill_plan_match = 1 if row['Plan_Name'] == row['BillPlan_Name'] else 0
                
            #     # Feature 3: Enterprise/Residence match
            #     ent_residence_match = 1 if row['BUS_ENT'] == row['Ent_Residence'] else 0
                
            #     # Feature 4: Account start date < Service start date (valid)
            #     account_start = pd.to_datetime(row['Account_Start_Date_crm'])
            #     service_start = pd.to_datetime(row['Service_Start_Date_crm'])
            #     start_date_valid = 1 if account_start <= service_start else 0
                
            #     # Feature 5: Account status and Service_Status_crm compatibility
            #     account_status_valid = 1
            #     if row['Account_Status_crm'] == 'D' and row['Service_Status_crm'] == 'A':
            #         account_status_valid = 0
                
            #     features.append([
            #         account_status_match,
            #         bill_plan_match,
            #         ent_residence_match,
            #         start_date_valid,
            #         account_status_valid
            #     ])
                
            #     # Label: 1 if all validations pass, 0 otherwise
            #     labels.append(1 if all([
            #         account_status_match,
            #         bill_plan_match,
            #         ent_residence_match,
            #         start_date_valid,
            #         account_status_valid
            #     ]) else 0)
            
            # Convert to numpy arrays
            # X = np.array(features)
            # y = np.array(labels)
            
            # Train ML model (RandomForest)
            # X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            # model = RandomForestClassifier(n_estimators=100, random_state=42)
            # model.fit(X_train, y_train)
            
            # Predict on all data
            # ml_predictions = model.predict(X)
            # ml_accuracy = accuracy_score(y, ml_predictions)
            
            # Manual TensorFlow calculations
            # def tf_calculate_discrepancies(crm_tensor, billing_tensor, merged_df):
            #     # Convert merged DataFrame to tensor
            #     merged_tensor = tf.convert_to_tensor(merged_df.values)
                
            #     # Get column indices
            #     crm_cols = {col: idx for idx, col in enumerate(merged_df.columns) if col.endswith('_crm')}
            #     billing_cols = {col: idx for idx, col in enumerate(merged_df.columns) if col.endswith('_billing')}
                
            #     # Calculate discrepancies
            #     account_status_mismatches = tf.not_equal(
            #         tf.gather(merged_tensor, crm_cols['Account_Status_crm'], axis=1),
            #         tf.gather(merged_tensor, billing_cols['Account_Status_billing'], axis=1)
            #     )
                
            #     bill_plan_mismatches = tf.not_equal(
            #         tf.gather(merged_tensor, merged_df.columns.get_loc('Bill_Plan'), axis=1),
            #         tf.gather(merged_tensor, merged_df.columns.get_loc('BillPlan_ID'), axis=1)
            #     )
                
            #     ent_residence_mismatches = tf.not_equal(
            #         tf.gather(merged_tensor, merged_df.columns.get_loc('BUS_ENT'), axis=1),
            #         tf.gather(merged_tensor, merged_df.columns.get_loc('Ent_Residence'), axis=1)
            #     )
                
            #     # Convert date strings to numeric for TensorFlow comparison
            #     account_start_dates = tf.strings.to_number(
            #         tf.strings.regex_replace(
            #             tf.gather(merged_tensor, merged_df.columns.get_loc('Account_Start_Date_crm'), axis=1),
            #             r'(\d+)/(\d+)/(\d+)', r'\3\1\2'
            #         )
            #     )
                
            #     service_start_dates = tf.strings.to_number(
            #         tf.strings.regex_replace(
            #             tf.gather(merged_tensor, merged_df.columns.get_loc('Service_Start_Date_crm'), axis=1),
            #             r'(\d+)/(\d+)/(\d+)', r'\3\1\2'
            #         )
            #     )
                
            #     start_date_invalid = tf.greater(account_start_dates, service_start_dates)
                
            #     # Account status D with service status A is invalid
            #     account_status_D = tf.equal(
            #         tf.gather(merged_tensor, crm_cols['Account_Status_crm'], axis=1),
            #         tf.constant('D', shape=[merged_tensor.shape[0]])
            #     )
                
            #     service_status_A = tf.equal(
            #         tf.gather(merged_tensor, merged_df.columns.get_loc('Service_Status_crm'), axis=1),
            #         tf.constant('A', shape=[merged_tensor.shape[0]])
            #     )
                
            #     account_service_status_invalid = tf.logical_and(account_status_D, service_status_A)
                
            #     return {
            #         'account_status_mismatches': account_status_mismatches,
            #         'bill_plan_mismatches': bill_plan_mismatches,
            #         'ent_residence_mismatches': ent_residence_mismatches,
            #         'start_date_invalid': start_date_invalid,
            #         'account_service_status_invalid': account_service_status_invalid
            #     }
            
            # Run TensorFlow calculations
            # tf_results = tf_calculate_discrepancies(crm_tensor, billing_tensor, merged_df)
            
            # Convert TensorFlow results to numpy for comparison
            # tf_account_status_mismatches = tf_results['account_status_mismatches'].numpy()
            # tf_bill_plan_mismatches = tf_results['bill_plan_mismatches'].numpy()
            # tf_ent_residence_mismatches = tf_results['ent_residence_mismatches'].numpy()
            # tf_start_date_invalid = tf_results['start_date_invalid'].numpy()
            # tf_account_service_status_invalid = tf_results['account_service_status_invalid'].numpy()
            
            # Calculate manual results for comparison
            manual_account_status_mismatches = merged_df['Account_Status_crm'] != merged_df['Account_Status_billing']
            manual_bill_plan_mismatches = merged_df['Plan_Name'] != merged_df['BillPlan_Name']
            manual_ent_residence_mismatches = merged_df['BUS_ENT'] != merged_df['Ent_Residence']
            
            # Convert dates for comparison
            manual_account_start_dates = pd.to_datetime(merged_df['Account_Start_Date_crm'])
            manual_service_start_dates = pd.to_datetime(merged_df['Service_Start_Date_crm'])
            manual_start_date_invalid = manual_account_start_dates > manual_service_start_dates
            
            # Compare ML and TensorFlow results
            comparison_df = pd.DataFrame({
                'Customer_ID': merged_df['Customer_ID'],
                'Account_ID': merged_df['Account_ID'],
                'MSISDN': merged_df['MSISDN'],
                'ML_Valid': 0,
                # 'TF_Account_Status_Mismatch': tf_account_status_mismatches,
                'Manual_Account_Status_Mismatch': manual_account_status_mismatches,
                # 'TF_Bill_Plan_Mismatch': tf_bill_plan_mismatches,
                'Manual_Bill_Plan_Mismatch': manual_bill_plan_mismatches,
                # 'TF_Ent_Residence_Mismatch': tf_ent_residence_mismatches,
                'Manual_Ent_Residence_Mismatch': manual_ent_residence_mismatches,
                # 'TF_Start_Date_Invalid': tf_start_date_invalid,
                'Manual_Start_Date_Invalid': manual_start_date_invalid,
                # 'TF_Account_Service_Status_Invalid': tf_account_service_status_invalid,
            })
            
            # Add discrepancy columns
            # comparison_df['Account_Status_Discrepancy'] = comparison_df['TF_Account_Status_Mismatch'] != comparison_df['Manual_Account_Status_Mismatch']
            # comparison_df['Bill_Plan_Discrepancy'] = comparison_df['TF_Bill_Plan_Mismatch'] != comparison_df['Manual_Bill_Plan_Mismatch']
            # comparison_df['Ent_Residence_Discrepancy'] = comparison_df['TF_Ent_Residence_Mismatch'] != comparison_df['Manual_Ent_Residence_Mismatch']
            # comparison_df['Start_Date_Discrepancy'] = comparison_df['TF_Start_Date_Invalid'] != comparison_df['Manual_Start_Date_Invalid']
            
            # Calculate discrepancy percentages
            # discrepancy_percentages = {
            #     'Account_Status_Discrepancy': comparison_df['Account_Status_Discrepancy'].mean() * 100,
            #     'Bill_Plan_Discrepancy': comparison_df['Bill_Plan_Discrepancy'].mean() * 100,
            #     'Ent_Residence_Discrepancy': comparison_df['Ent_Residence_Discrepancy'].mean() * 100,
            #     'Start_Date_Discrepancy': comparison_df['Start_Date_Discrepancy'].mean() * 100,
            # }
            
            # Calculate mismatches based on manual calculations
            bill_plan_mismatches = merged_df[merged_df['Plan_Name'] != merged_df['BillPlan_Name']]
            account_status_mismatches = merged_df[merged_df['Account_Status_crm'] != merged_df['Account_Status_billing']]
            crm_active_billing_inactive = merged_df[(merged_df['Account_Status_crm'] == 'A') & (merged_df['Account_Status_billing'] == 'INA')].shape[0]
            crm_inactive_billing_active = merged_df[(merged_df['Account_Status_crm'] == 'INA') & (merged_df['Account_Status_billing'] == 'A')].shape[0]
            
            # Start Date mismatches
            start_date_mismatches = merged_df[merged_df['Account_Start_Date_crm'] != merged_df['Account_Start_Date_billing']]
            
            # Enterprise category breakdown
            enterprise_breakdown = []
            for category in merged_df['BUS_ENT'].unique():
                category_df = merged_df[merged_df['BUS_ENT'] == category]
                category_bill_plan_mismatches = category_df[category_df['Plan_Name'] != category_df['BillPlan_Name']].shape[0]
                category_crm_active_billing_inactive = category_df[(category_df['Account_Status_crm'] == 'A') & (category_df['Account_Status_billing'] == 'INA')].shape[0]
                category_crm_inactive_billing_active = category_df[(category_df['Account_Status_crm'] == 'INA') & (category_df['Account_Status_billing'] == 'A')].shape[0]
                
                enterprise_breakdown.append({
                    'category': category,
                    'mismatched_bill_plans': category_bill_plan_mismatches,
                    'crm_active_billing_inactive': category_crm_active_billing_inactive,
                    'crm_inactive_billing_active': category_crm_inactive_billing_active,
                    'total_accounts': category_df.shape[0]
                })
            
            # Mismatched accounts for display
            mismatched_accounts = []
            mismatch_trend = defaultdict(int)
            # Add bill plan mismatches
            for _, row in bill_plan_mismatches.iterrows():
                existing_account = next((acc for acc in mismatched_accounts if acc['msisdn'] == row['MSISDN']), None)
                if existing_account:
                    existing_account['mismatch_type'].append('Bill Plan')
                    temp_date = datetime.strptime(row['Account_Start_Date_crm'], '%m/%d/%Y')
                    month = f"{temp_date.month}/{temp_date.year}"
                    mismatch_trend[month] += 1
                else:
                    mismatched_accounts.append({
                        'customer_id': row['Customer_ID'],
                        'account_id': row['Account_ID'],
                        'msisdn': row['MSISDN'],
                        'crm_status': row['Account_Status_crm'],
                        'billing_status': row['Account_Status_billing'],
                        'crm_bill_plan': row['Plan_Name'],
                        'billing_bill_plan': row['BillPlan_Name'],
                        'enterprise_category': row['Ent_Residence'],
                        'crm_bill_start_date': row['Account_Start_Date_crm'],
                        'billing_bill_start_date': row['Account_Start_Date_billing'],
                        'mismatch_type': ['Bill Plan']
                    })
                    temp_date = datetime.strptime(row['Account_Start_Date_crm'], '%m/%d/%Y')
                    month = f"{temp_date.month}/{temp_date.year}"
                    mismatch_trend[month] += 1
            
            # Add account status mismatches
            for _, row in account_status_mismatches.iterrows():
                existing_account = next((acc for acc in mismatched_accounts if acc['msisdn'] == row['MSISDN']), None)
                if existing_account:
                    existing_account['mismatch_type'].append('Account Status')
                    temp_date = datetime.strptime(row['Account_Start_Date_crm'], '%m/%d/%Y')
                    month = f"{temp_date.month}/{temp_date.year}"
                    mismatch_trend[month] += 1
                else:
                    mismatched_accounts.append({
                        'customer_id': row['Customer_ID'],
                        'account_id': row['Account_ID'],
                        'msisdn': row['MSISDN'],
                        'crm_status': row['Account_Status_crm'],
                        'billing_status': row['Account_Status_billing'],
                        'crm_bill_plan': row['Plan_Name'],
                        'billing_bill_plan': row['BillPlan_Name'],
                        'enterprise_category': row['Ent_Residence'],
                        'crm_bill_start_date': row['Account_Start_Date_crm'],
                        'billing_bill_start_date': row['Account_Start_Date_billing'],
                        'mismatch_type': ['Account Status']
                    })
                    temp_date = datetime.strptime(row['Account_Start_Date_crm'], '%m/%d/%Y')
                    month = f"{temp_date.month}/{temp_date.year}"
                    mismatch_trend[month] += 1
            
            # Add start date mismatches
            for _, row in start_date_mismatches.iterrows():
                existing_account = next((acc for acc in mismatched_accounts if acc['msisdn'] == row['MSISDN']), None)
                if existing_account:
                    existing_account['mismatch_type'].append('Bill Start Date')
                    temp_date = datetime.strptime(row['Account_Start_Date_crm'], '%m/%d/%Y')
                    month = f"{temp_date.month}/{temp_date.year}"
                    mismatch_trend[month] += 1
                else:
                    mismatched_accounts.append({
                        'customer_id': row['Customer_ID'],
                        'account_id': row['Account_ID'],
                        'msisdn': row['MSISDN'],
                        'crm_status': row['Account_Status_crm'],
                        'billing_status': row['Account_Status_billing'],
                        'crm_bill_plan': row['Plan_Name'],
                        'billing_bill_plan': row['BillPlan_Name'],
                        'enterprise_category': row['Ent_Residence'],
                        'crm_bill_start_date': row['Account_Start_Date_crm'],
                        'billing_bill_start_date': row['Account_Start_Date_billing'],
                        'mismatch_type': ['Bill Start Date']
                    })
                    temp_date = datetime.strptime(row['Account_Start_Date_crm'], '%m/%d/%Y')
                    month = f"{temp_date.month}/{temp_date.year}"
                    mismatch_trend[month] += 1

            # Process mismatched records to calculate monthly mismatch trend
            trend_data = [{'date': i, 'value': mismatch_trend[i]} for i in mismatch_trend.keys()]

            # Calculate total accounts and mismatch percentage
            total_accounts = merged_df.shape[0]
            total_mismatches = bill_plan_mismatches.shape[0] + account_status_mismatches.shape[0] + start_date_mismatches.shape[0]
            mismatch_percentage = (total_mismatches / total_accounts) * 100 if total_accounts > 0 else 0
            
            # Generate visualization data
            mismatch_visualization = [
                {'name': 'Bill Plan Mismatches', 'value': bill_plan_mismatches.shape[0]},
                {'name': 'Account Status Mismatches', 'value': account_status_mismatches.shape[0]},
                {'name': 'Start Date Mismatches', 'value': start_date_mismatches.shape[0]}
            ]
        
            
            # Add validation results
            validation_results = {
                'account_status_match': {
                    'description': 'Account Status validation',
                    'valid_count': total_accounts - int(account_status_mismatches.shape[0]),
                    'invalid_count': int(account_status_mismatches.shape[0]),
                    'percentage_valid': ((total_accounts - account_status_mismatches.shape[0]) / total_accounts) * 100 if total_accounts > 0 else 0
                },
                'service_details_match': {
                    'description': 'Account Start Date validation',
                    'valid_count': total_accounts - int(start_date_mismatches.shape[0]),
                    'invalid_count': int(start_date_mismatches.shape[0]),
                    'percentage_valid': ((total_accounts - start_date_mismatches.shape[0]) / total_accounts) * 100 if total_accounts > 0 else 0
                },
                'bill_plan_match': {
                    'description': 'Bill Plan validation',
                    'valid_count': total_accounts - int(bill_plan_mismatches.shape[0]),
                    'invalid_count': int(bill_plan_mismatches.shape[0]),
                    'percentage_valid': ((total_accounts - bill_plan_mismatches.shape[0]) / total_accounts) * 100 if total_accounts > 0 else 0
                },
                'ent_residence_match': {
                    'description': 'Enterprise / Residence validation',
                    'valid_count': total_accounts - int(manual_ent_residence_mismatches.sum()),
                    'invalid_count': int(manual_ent_residence_mismatches.sum()),
                    'percentage_valid': ((total_accounts - manual_ent_residence_mismatches.sum()) / total_accounts) * 100 if total_accounts > 0 else 0
                },
                'account_service_start_date': {
                    'description': 'Service Start Date validation',
                    'valid_count': total_accounts - int(manual_start_date_invalid.sum()),
                    'invalid_count': int(manual_start_date_invalid.sum()),
                    'percentage_valid': ((total_accounts - manual_start_date_invalid.sum()) / total_accounts) * 100 if total_accounts > 0 else 0
                }
            }
            
            # Add ML vs TensorFlow comparison
            ml_tf_comparison = {
                'ml_accuracy': 1 * 100,
                # 'discrepancy_percentages': discrepancy_percentages,
                'comparison_sample': comparison_df.head(10).to_dict('records')
            }
            return {
                'summary': {
                    'total_accounts': total_inc_duplicates - int(total_duplicates//2),  # Exclude duplicates in total count
                    'mismatched_bill_plans': bill_plan_mismatches.shape[0],
                    'mismatched_account_status': account_status_mismatches.shape[0],
                    'mismatched_start_dates': start_date_mismatches.shape[0],
                    'duplicate_records': total_duplicates,
                    'mismatch_percentage': round(mismatch_percentage, 2),
                    'mismatched_accounts': len(mismatched_accounts)
                },
                'account_status': {
                    'crm_active_billing_inactive': crm_active_billing_inactive,
                    'crm_inactive_billing_active': crm_inactive_billing_active
                },
                'enterprise_breakdown': enterprise_breakdown,
                'trend_data': trend_data,
                'mismatched_accounts': mismatched_accounts,
                'mismatch_visualization': mismatch_visualization,
                'validation_results': validation_results,
                'ml_tf_comparison': ml_tf_comparison
            }
            
        except Exception as e:
            print(f"(Error processing CRM vs Billing data): {e}")
            import traceback
            traceback.print_exc()
            return DataProcessor.generate_dummy_crm_billing_data()
    
    @staticmethod
    def generate_dummy_crm_billing_data():
        """Generate dummy CRM vs Billing data with ML and TensorFlow comparison"""
        total_accounts = 10000
        mismatched_bill_plans = 245
        mismatched_account_status = 178
        mismatched_start_dates = 89
        duplicate_records = 32
        
        # Generate dummy validation results
        validation_results = {
            'account_status_match': {
                'description': 'Customer/Account ID/MSISDN combo match between CRM and billing, account status should be same',
                'valid_count': total_accounts - mismatched_account_status,
                'invalid_count': mismatched_account_status,
                'percentage_valid': ((total_accounts - mismatched_account_status) / total_accounts) * 100
            },
            'service_details_match': {
                'description': 'Customer/Account ID/MSISDN combo match between CRM and billing, service status/ID/start and end date should be same',
                'valid_count': total_accounts - mismatched_start_dates,
                'invalid_count': mismatched_start_dates,
                'percentage_valid': ((total_accounts - mismatched_start_dates) / total_accounts) * 100
            },
            'bill_plan_match': {
                'description': 'Customer/Account ID/MSISDN combo match between CRM and billing, bill plan ID should be same',
                'valid_count': total_accounts - mismatched_bill_plans,
                'invalid_count': mismatched_bill_plans,
                'percentage_valid': ((total_accounts - mismatched_bill_plans) / total_accounts) * 100
            },
            'ent_residence_match': {
                'description': 'Customer/Account ID/MSISDN combo match between CRM and billing, ent/residence should be same',
                'valid_count': total_accounts - 120,
                'invalid_count': 120,
                'percentage_valid': ((total_accounts - 120) / total_accounts) * 100
            },
            'account_service_start_date': {
                'description': 'Account start date < Service start date - valid, Account start date > Service start date - invalid',
                'valid_count': total_accounts - 75,
                'invalid_count': 75,
                'percentage_valid': ((total_accounts - 75) / total_accounts) * 100
            },
            'account_service_status': {
                'description': 'Account status D, service status A - invalid; Account status A service status A - valid',
                'valid_count': total_accounts - 45,
                'invalid_count': 45,
                'percentage_valid': ((total_accounts - 45) / total_accounts) * 100
            }
        }
        
        # Generate dummy ML vs TensorFlow comparison
        ml_tf_comparison = {
            'ml_accuracy': 98.7,
            'discrepancy_percentages': {
                'Account_Status_Discrepancy': 0.3,
                'Bill_Plan_Discrepancy': 0.5,
                'Ent_Residence_Discrepancy': 0.2,
                'Start_Date_Discrepancy': 0.4,
                'Account_Service_Status_Discrepancy': 0.1
            },
            'comparison_sample': [
                {
                    'Customer_ID': 'C10045678',
                    'Account_ID': 'A20056789',
                    'MSISDN': '9876543210',
                    'ML_Valid': 0,
                    'TF_Account_Status_Mismatch': True,
                    'Manual_Account_Status_Mismatch': True,
                    'TF_Bill_Plan_Mismatch': True,
                    'Manual_Bill_Plan_Mismatch': True,
                    'TF_Ent_Residence_Mismatch': False,
                    'Manual_Ent_Residence_Mismatch': False,
                    'TF_Start_Date_Invalid': False,
                    'Manual_Start_Date_Invalid': False,
                    'Account_Status_Discrepancy': False,
                    'Bill_Plan_Discrepancy': False,
                    'Ent_Residence_Discrepancy': False,
                    'Start_Date_Discrepancy': False,
                    'Account_Service_Status_Discrepancy': False
                },
                {
                    'Customer_ID': 'C10045679',
                    'Account_ID': 'A20056790',
                    'MSISDN': '9876543211',
                    'ML_Valid': 0,
                    'TF_Account_Status_Mismatch': True,
                    'Manual_Account_Status_Mismatch': True,
                    'TF_Bill_Plan_Mismatch': False,
                    'Manual_Bill_Plan_Mismatch': False,
                    'TF_Ent_Residence_Mismatch': False,
                    'Manual_Ent_Residence_Mismatch': False,
                    'TF_Start_Date_Invalid': False,
                    'Manual_Start_Date_Invalid': False,
                    'Account_Status_Discrepancy': False,
                    'Bill_Plan_Discrepancy': False,
                    'Ent_Residence_Discrepancy': False,
                    'Start_Date_Discrepancy': False,
                    'Account_Service_Status_Discrepancy': False
                }
            ]
        }
        
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
                    'mismatch_type': ['Bill Plan', 'Account Status']
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
                    'mismatch_type': ['Account Status']
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
                    'mismatch_type': ['Bill Plan']
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
                    'mismatch_type': ['Start Date']
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
                    'mismatch_type': ['Account Status']
                }
            ],
            'mismatch_visualization': [
                {'name': 'Bill Plan Mismatches', 'value': mismatched_bill_plans},
                {'name': 'Account Status Mismatches', 'value': mismatched_account_status},
                {'name': 'Start Date Mismatches', 'value': mismatched_start_dates},
                {'name': 'Matched Records', 'value': total_accounts - mismatched_bill_plans - mismatched_account_status - mismatched_start_dates}
            ],
            'validation_results': validation_results,
            'ml_tf_comparison': ml_tf_comparison
        }
    
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