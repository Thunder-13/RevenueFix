from models.base import BaseModel
import random
import os
from datetime import datetime, timedelta
from collections import defaultdict
import pandas as pd
import numpy as np
import time

class ServicesModel(BaseModel):
    """Model for telecom services data"""

    @staticmethod
    def generate_time_series(days=30, base_value=1000000, volatility=0.05):
        """Generate time series data for charts"""
        data = []
        today = datetime.now()

        for i in range(days):
            date = today - timedelta(days=days - i - 1)
            # Add some randomness to the value
            change = (random.random() - 0.5) * 2 * volatility
            value = base_value * (1 + change)
            base_value = value  # For the next day

            data.append({
                'date': date.strftime('%m/%d/%Y %H:%M'),
                'value': round(value, 2)
            })

        return data
    @classmethod
    def get_network_vs_billing_data_opt(cls):

        start_time = time.time()

         # Initialize metrics
        metrics = {
                'voice': {},
                'sms': {},
                'data': {
                    'total_records': 0,
                    'mismatch_count': 0,
                    'mismatch_status': "No Mismatches",
                    'mismatched_records': [],
                    'account_status_mismatch_count': 0,
                    'account_status_mismatched_records': [],
                    'transaction_mismatch_count': 0,
                    'transaction_mismatched_records': [],
                    'transaction_date_mismatch_count': 0,
                    'download_mismatch_count': 0,
                    'download_mismatched_records': [],
                    'transaction_date_mismatched_records': [],
                    'msisdn_missing_count': 0,
                    'msisdn_missing_records': [],
                    'service_mismatch_count': 0,
                    'service_mismatched_records': [],
                    'duplicate_count': 0,
                    'duplicate_records': [],
                    'revenue_trend': [],
                    'service_breakdown': [],
                    'records_display_card': []
                },
                'service_distribution': []
            }
        
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        billing_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_DATA', 'Billing_100_VSDN.csv')
        network_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_DATA', 'Network_100_VSDN.csv')

        df_Billing = pd.read_csv(billing_file_path)
        df_Network = pd.read_csv(network_file_path)
        total_inc_duplicate = int(max(df_Billing.shape[0], df_Network.shape[0]))
        
        t1 = time.time()
        # Clean and prepare data
        # Remove leading/trailing spaces from column names
        df_Network.columns = df_Network.columns.str.strip()
        df_Billing.columns = df_Billing.columns.str.strip()

        # Identify duplicate rows in CRM and Billing
        billing_duplicates = df_Billing.duplicated(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Download (MB)', 'Service ID', 'Service Name', 'Service Status',	'Service Start Date', 'Service End Date']).sum()
        network_duplicates = df_Network.duplicated(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Download (MB)', 'Service ID', 'Service Name', 'Service Status',	'Service Start Date', 'Service End Date']).sum()
        total_duplicates = int(billing_duplicates + network_duplicates)

        # Remove duplicates for analysis
        df_Network = df_Network.drop_duplicates(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Download (MB)', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'])
        df_Billing = df_Billing.drop_duplicates(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Download (MB)', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'])

        

        print(f"T1: {time.time() - t1:.2f} seconds") 

        t2 = time.time()

        # Merge datasets on MSISDN
        merged_df = pd.merge(
            df_Network,
            df_Billing,
            on=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Download (MB)', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'],
            how='outer',
            suffixes=('_Network', '_Billing'),
            indicator=True

        )


        mismatched_records = merged_df[merged_df['_merge'] == 'left_only'].copy()

        # Append mismatched records to metrics
        metrics['data']['mismatched_records'].extend(mismatched_records.to_dict(orient='records'))
        metrics['data']['mismatch_count'] += len(mismatched_records)

        # Process mismatched records to calculate monthly mismatch trend
        if metrics['data']['mismatched_records']:
            # Convert mismatched records to a DataFrame for efficient processing
            mismatched_df = pd.DataFrame(metrics['data']['mismatched_records'])

            # Ensure 'Transaction Date_Network' is in datetime format
            mismatched_df['Transaction Date'] = pd.to_datetime(
                mismatched_df['Transaction Date'], format='%m/%d/%Y %H:%M', errors='coerce'
            )

            # Extract the month and year for grouping
            mismatched_df['Month_Year'] = mismatched_df['Transaction Date'].dt.to_period('M')

            # Calculate the mismatch trend by grouping by 'Month_Year'
            mismatch_trend = mismatched_df['Month_Year'].value_counts().sort_index()

            # Convert mismatch trend to a list of dictionaries for the revenue_trend field
            metrics['data']['revenue_trend'] = [
                {'date': period.strftime('%m/%Y'), 'value': count} for period, count in mismatch_trend.items()
            ]

        
        #total records
        metrics['data']['total_records'] = total_inc_duplicate
        #total duplicates
        metrics['data']['duplicate_count'] = total_duplicates


        # Filter relevant rows
        df_Network_filtered = df_Network[df_Network['Account Status'] == "I"]

        # Optimize data types
        df_Network_filtered['Account Status'] = df_Network_filtered['Account Status'].astype('category')
        df_Network_filtered['Service Status'] = df_Network_filtered['Service Status'].astype('category')

        print(f"T2: {time.time() - t2:.2f} seconds")   

        t3 = time.time()

        # Merge datasets on common keys for comparison
        serv_status_df = pd.merge(
            df_Network, 
            df_Billing, 
            on=['MSISDN','Service ID', 'Service Name', 'Service Start Date', 'Service End Date'], 
            how='inner',
            suffixes=(' Network', ' Billing')
        )
        # Vectorized Account Status mismatch
        account_status_mismatch = (
            (df_Network_filtered['Account Status'] == "I") & 
            (df_Network_filtered['Service Status'] != "I")
        )
        if account_status_mismatch.any():
            metrics['data']['account_status_mismatch_count'] = account_status_mismatch.sum()
            metrics['data']['account_status_mismatched_records'] = df_Network_filtered[account_status_mismatch].to_dict(orient='records')

        # Vectorized Service Status mismatch
        service_status_mismatch = (
            ((serv_status_df['Service Status Network'] == "A") & (serv_status_df['Service Status Billing'] == "I")) |
            ((serv_status_df['Service Status Network'] == "I") & (serv_status_df['Service Status Billing'] == "A"))
        )
        if service_status_mismatch.any():
            mismatched_records = serv_status_df[service_status_mismatch].copy()
            mismatched_records['Billing Service Status'] = mismatched_records['Service Status Billing']
            mismatched_records['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] = service_status_mismatch.sum()
            metrics['data']['service_mismatched_records'] = mismatched_records.to_dict(orient='records')

        print(f"T3: {time.time() - t3:.2f} seconds")   
        t4 = time.time()

        # Filter rows where Account Status and Service Status are both "A"
        active_records = df_Network[
            (df_Network['Account Status'] == "A") & 
            (df_Network['Service Status'] == "A")
        ]


        # Vectorized Transaction Date mismatch condition
        transaction_date_mismatch = (
            (pd.notna(active_records['Transaction Date'])) &
            (pd.notna(active_records['Service Start Date'])) &
            (pd.notna(active_records['Service End Date'])) &
            ~((active_records['Service Start Date'] <= active_records['Transaction Date']) &
            (active_records['Transaction Date'] <= active_records['Service End Date']))
        )

        # Process transaction mismatched records
        if transaction_date_mismatch.any():
            mismatched_records = active_records[transaction_date_mismatch].copy()
            mismatched_records['Mismatch Reason'] = "Transaction Date not In Between Service Start/End Date"
            metrics['data']['transaction_mismatch_count'] = transaction_date_mismatch.sum()
            metrics['data']['transaction_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Filter rows where Transaction Date is between Service Start Date and Service End Date
        valid_transaction_records = active_records[
            (pd.notna(active_records['Transaction Date'])) &
            (pd.notna(active_records['Service Start Date'])) &
            (pd.notna(active_records['Service End Date'])) &
            (active_records['Service Start Date'] <= active_records['Transaction Date']) &
            (active_records['Transaction Date'] <= active_records['Service End Date'])
        ]

        # Compare MSISDN values between Network and Billing
        msisdn_missing_mask = ~valid_transaction_records['MSISDN'].isin(df_Billing['MSISDN'])

        # Process MSISDN mismatched records
        if msisdn_missing_mask.any():
            msisdn_missing_records = valid_transaction_records[msisdn_missing_mask].copy()
            metrics['data']['msisdn_missing_count'] = msisdn_missing_mask.sum()
            metrics['data']['msisdn_missing_records'] = msisdn_missing_records.to_dict(orient='records')
        print(f"T4: {time.time() - t4:.2f} seconds")   
        t5 = time.time()

        # Filter Network dataset based on conditions
        df_Network_filtered = df_Network[
            (df_Network['Account Status'] == "A") &
            (df_Network['Service Status'] == "A") &
            (pd.to_datetime(df_Network['Transaction Date'], errors='coerce') >= pd.to_datetime(df_Network['Service Start Date'], errors='coerce')) &
            (pd.to_datetime(df_Network['Transaction Date'], errors='coerce') <= pd.to_datetime(df_Network['Service End Date'], errors='coerce'))
        ]

        # Filter Billing dataset based on MSISDN matching
        df_Billing_filtered = df_Billing[
            df_Billing['MSISDN'].isin(df_Network_filtered['MSISDN'])
        ]

        print(f"T5: {time.time() - t5:.2f} seconds")   
        t6 = time.time()

        # Merge filtered datasets
        merged_transaction_df = pd.merge(
            df_Network_filtered,
            df_Billing_filtered,
            on=['MSISDN', 'Service ID', 'Service Name', 'Service Start Date', 'Service End Date'],
            how='inner',
            suffixes=('_Network', '_Billing')
        )

        # Merge filtered datasets
        merged_service_df = pd.merge(
            df_Network_filtered,
            df_Billing_filtered,
            on=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Download (MB)'],
            how='inner',
            suffixes=('_Network', '_Billing')
        )



        # Transaction Date mismatch between Network and Billing
        transaction_date_mismatch = (
            merged_transaction_df['Transaction Date_Network'] != merged_transaction_df['Transaction Date_Billing']
        )

        # Process Transaction Date mismatched records
        if transaction_date_mismatch.any():
            mismatched_records = merged_transaction_df[transaction_date_mismatch].copy()
            mismatched_records['Mismatch Reason'] = "Transaction Date not matched between Network and Billing"
            metrics['data']['transaction_date_mismatch_count'] = transaction_date_mismatch.sum()
            metrics['data']['transaction_date_mismatched_records'] = mismatched_records.to_dict(orient='records')
        print(f"T6: {time.time() - t6:.2f} seconds")   

        t7 = time.time()

        # Download (MB) mismatch between Network and Billing
        download_mismatch = (
            merged_transaction_df['Download (MB)_Network'] != merged_transaction_df['Download (MB)_Billing']
        )

        # Process Download (MB) mismatched records
        if download_mismatch.any():
            mismatched_records = merged_transaction_df[download_mismatch].copy()
            mismatched_records['Mismatch Reason'] = "Download (MB) mismatch between Network and Billing"
            metrics['data']['download_mismatch_count'] = download_mismatch.sum()
            metrics['data']['download_mismatched_records'] = mismatched_records.to_dict(orient='records')
        
        print(f"T7: {time.time() - t7:.2f} seconds")   

        t8 = time.time()
        # Service ID and Service Start/End Date mismatch
        service_id_mismatch = (
            merged_service_df['Service ID_Network'] != merged_service_df['Service ID_Billing']
        )

        if service_id_mismatch.any():
            mismatched_records = merged_service_df[service_id_mismatch].copy()
            mismatched_records['Billing Service ID'] = mismatched_records['Service ID_Billing']
            mismatched_records['Billing Service Name'] = mismatched_records['Service Name_Billing']
            mismatched_records['Mismatch Reason'] = "Service mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] += service_id_mismatch.sum()
            metrics['data']['service_mismatched_records'].extend(mismatched_records.to_dict(orient='records'))

        service_date_mismatch = (
            (merged_service_df['Service Start Date_Network'] != merged_service_df['Service Start Date_Billing']) |
            (merged_service_df['Service End Date_Network'] != merged_service_df['Service End Date_Billing'])
        )

        if service_date_mismatch.any():
            mismatched_records = merged_service_df[service_date_mismatch].copy()
            mismatched_records['Billing Service Start Date'] = mismatched_records['Service Start Date_Billing']
            mismatched_records['Billing Service End Date'] = mismatched_records['Service End Date_Billing']
            mismatched_records['Mismatch Reason'] = "Service Start/End Date mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] += service_date_mismatch.sum()
            metrics['data']['service_mismatched_records'].extend(mismatched_records.to_dict(orient='records'))
        
        print(f"T8: {time.time() - t8:.2f} seconds")   
  

        t11 = time.time() 

       

        print(f"T11: {time.time() - t11:.2f} seconds")   
        
        t12 = time.time()
        # Add named sections to records_display_card
        metrics['data']['records_display_card'] = [
            {
                "name": "Mismatched Records",
                "records": metrics['data']['mismatched_records']
            },
            {
                "name": "Account Status Mismatch",
                "records": metrics['data']['account_status_mismatched_records']
            },
            {
                "name": "Transaction Mismatch",
                "records": metrics['data']['transaction_mismatched_records'] + metrics['data']['transaction_date_mismatched_records']
            },
            {
                "name": "Volume Mismatch",
                "records": metrics['data']['download_mismatched_records']
            },
            {
                "name": "Transaction Date Mismatch",
                "records": metrics['data']['transaction_date_mismatched_records']
            },
            {
                "name": "Missing Records",
                "records": metrics['data']['msisdn_missing_records']
            },
            {
                "name": "Service Mismatch",
                "records": metrics['data']['service_mismatched_records']
            }
        ]

        print(f"T12: {time.time() - t12:.2f} seconds")  

        t13 = time.time()

        # Ensure all data in metrics is JSON serializable
        def convert_to_serializable(data):
            if isinstance(data, list):
                return [convert_to_serializable(item) for item in data]
            elif isinstance(data, dict):
                return {key: convert_to_serializable(value) for key, value in data.items()}
            elif isinstance(data, (np.int64, np.float64)):
                return data.item()  # Convert numpy types to Python-native types
            else:
                return data

        # Ensure all data in metrics is JSON serializable
        metrics = convert_to_serializable(metrics)

        print(f"T13: {time.time() - t13:.2f} seconds")  
        return metrics
    
    @classmethod
    def get_network_vs_billing_sms_opt(cls):

         # Initialize metrics
        metrics = {
                'voice': {},
                'sms': {},
                'data': {
                    'total_records': 0,
                    'mismatch_count': 0,
                    'mismatch_status': "No Mismatches",
                    'mismatched_records': [],
                    'account_status_mismatch_count': 0,
                    'account_status_mismatched_records': [],
                    'transaction_mismatch_count': 0,
                    'transaction_mismatched_records': [],
                    'transaction_date_mismatch_count': 0,
                    'count_mismatch_count': 0,
                    'count_mismatched_records': [],
                    'transaction_date_mismatched_records': [],
                    'msisdn_missing_count': 0,
                    'msisdn_missing_records': [],
                    'service_mismatch_count': 0,
                    'service_mismatched_records': [],
                    'duplicate_count': 0,
                    'duplicate_records': [],
                    'revenue_trend': [],
                    'service_breakdown': [],
                    'records_display_card': []
                },
                'service_distribution': []
            }
        
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        billing_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_SMS', 'Billing_SMS_Big.csv')
        network_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_SMS', 'Network_SMS_Big.csv')

        df_Billing = pd.read_csv(billing_file_path)
        df_Network = pd.read_csv(network_file_path)
        total_inc_duplicate = int(max(df_Billing.shape[0], df_Network.shape[0]))
        
        # Clean and prepare data
        # Remove leading/trailing spaces from column names
        df_Network.columns = df_Network.columns.str.strip()
        df_Billing.columns = df_Billing.columns.str.strip()

        # Identify duplicate rows in CRM and Billing
        billing_duplicates = df_Billing.duplicated(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Count', 'Service ID', 'Service Name', 'Service Status',	'Service Start Date', 'Service End Date']).sum()
        network_duplicates = df_Network.duplicated(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Count', 'Service ID', 'Service Name', 'Service Status',	'Service Start Date', 'Service End Date']).sum()
        total_duplicates = int(billing_duplicates + network_duplicates)

        # Remove duplicates for analysis
        df_Network = df_Network.drop_duplicates(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Count', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'])
        df_Billing = df_Billing.drop_duplicates(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Count', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'])

        # Merge datasets on MSISDN
        merged_df = pd.merge(
            df_Network,
            df_Billing,
            on=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Count', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'],
            how='outer',
            suffixes=('_Network', '_Billing'),
            indicator=True

        )


        mismatched_records = merged_df[merged_df['_merge'] == 'left_only'].copy()

        # Append mismatched records to metrics
        metrics['data']['mismatched_records'].extend(mismatched_records.to_dict(orient='records'))
        metrics['data']['mismatch_count'] += len(mismatched_records)

        # Process mismatched records to calculate monthly mismatch trend
        if metrics['data']['mismatched_records']:
            # Convert mismatched records to a DataFrame for efficient processing
            mismatched_df = pd.DataFrame(metrics['data']['mismatched_records'])

            # Ensure 'Transaction Date_Network' is in datetime format
            mismatched_df['Transaction Date'] = pd.to_datetime(
                mismatched_df['Transaction Date'], format='%m/%d/%Y %H:%M', errors='coerce'
            )

            # Extract the month and year for grouping
            mismatched_df['Month_Year'] = mismatched_df['Transaction Date'].dt.to_period('M')

            # Calculate the mismatch trend by grouping by 'Month_Year'
            mismatch_trend = mismatched_df['Month_Year'].value_counts().sort_index()

            # Convert mismatch trend to a list of dictionaries for the revenue_trend field
            metrics['data']['revenue_trend'] = [
                {'date': period.strftime('%m/%Y'), 'value': count} for period, count in mismatch_trend.items()
            ]
   

        # Merge datasets on common keys for comparison
        serv_status_df = pd.merge(
            df_Network, 
            df_Billing, 
            on=['MSISDN','Service ID', 'Service Name', 'Service Start Date', 'Service End Date'], 
            how='inner',
            suffixes=(' Network', ' Billing')
        )

        
        
        #total records
        metrics['data']['total_records'] = total_inc_duplicate
        #total duplicates
        metrics['data']['duplicate_count'] = total_duplicates

        # Filter relevant rows
        df_Network_filtered = df_Network[df_Network['Account Status'] == "I"]

        # Optimize data types
        df_Network_filtered['Account Status'] = df_Network_filtered['Account Status'].astype('category')
        df_Network_filtered['Service Status'] = df_Network_filtered['Service Status'].astype('category')

        # Vectorized Account Status mismatch
        account_status_mismatch = (
            (df_Network_filtered['Account Status'] == "I") & 
            (df_Network_filtered['Service Status'] != "I")
        )
        if account_status_mismatch.any():
            metrics['data']['account_status_mismatch_count'] = account_status_mismatch.sum()
            metrics['data']['account_status_mismatched_records'] = df_Network_filtered[account_status_mismatch].to_dict(orient='records')

        # Vectorized Service Status mismatch
        service_status_mismatch = (
            ((serv_status_df['Service Status Network'] == "A") & (serv_status_df['Service Status Billing'] == "I")) |
            ((serv_status_df['Service Status Network'] == "I") & (serv_status_df['Service Status Billing'] == "A"))
        )
        if service_status_mismatch.any():
            mismatched_records = serv_status_df[service_status_mismatch].copy()
            mismatched_records['Billing Service Status'] = mismatched_records['Service Status Billing']
            mismatched_records['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] = service_status_mismatch.sum()
            metrics['data']['service_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Filter rows where Account Status and Service Status are both "A"
        active_records = df_Network[
            (df_Network['Account Status'] == "A") & 
            (df_Network['Service Status'] == "A")
        ]


        # Vectorized Transaction Date mismatch condition
        transaction_date_mismatch = (
            (pd.notna(active_records['Transaction Date'])) &
            (pd.notna(active_records['Service Start Date'])) &
            (pd.notna(active_records['Service End Date'])) &
            ~((active_records['Service Start Date'] <= active_records['Transaction Date']) &
            (active_records['Transaction Date'] <= active_records['Service End Date']))
        )

        # Process transaction mismatched records
        if transaction_date_mismatch.any():
            mismatched_records = active_records[transaction_date_mismatch].copy()
            mismatched_records['Mismatch Reason'] = "Transaction Date not In Between Service Start/End Date"
            metrics['data']['transaction_mismatch_count'] = transaction_date_mismatch.sum()
            metrics['data']['transaction_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Filter rows where Transaction Date is between Service Start Date and Service End Date
        valid_transaction_records = active_records[
            (pd.notna(active_records['Transaction Date'])) &
            (pd.notna(active_records['Service Start Date'])) &
            (pd.notna(active_records['Service End Date'])) &
            (active_records['Service Start Date'] <= active_records['Transaction Date']) &
            (active_records['Transaction Date'] <= active_records['Service End Date'])
        ]

        # Compare MSISDN values between Network and Billing
        msisdn_missing_mask = ~valid_transaction_records['MSISDN'].isin(df_Billing['MSISDN'])

        # Process MSISDN mismatched records
        if msisdn_missing_mask.any():
            msisdn_missing_records = valid_transaction_records[msisdn_missing_mask].copy()
            metrics['data']['msisdn_missing_count'] = msisdn_missing_mask.sum()
            metrics['data']['msisdn_missing_records'] = msisdn_missing_records.to_dict(orient='records')

        # Filter Network dataset based on conditions
        df_Network_filtered = df_Network[
            (df_Network['Account Status'] == "A") &
            (df_Network['Service Status'] == "A") &
            (pd.to_datetime(df_Network['Transaction Date'], errors='coerce') >= pd.to_datetime(df_Network['Service Start Date'], errors='coerce')) &
            (pd.to_datetime(df_Network['Transaction Date'], errors='coerce') <= pd.to_datetime(df_Network['Service End Date'], errors='coerce'))
        ]

        # Filter Billing dataset based on MSISDN matching
        df_Billing_filtered = df_Billing[
            df_Billing['MSISDN'].isin(df_Network_filtered['MSISDN'])
        ]

        # Merge filtered datasets
        merged_transaction_df = pd.merge(
            df_Network_filtered,
            df_Billing_filtered,
            on=['MSISDN', 'Service ID', 'Service Name', 'Service Start Date', 'Service End Date'],
            how='inner',
            suffixes=('_Network', '_Billing')
        )

        # Merge filtered datasets
        merged_service_df = pd.merge(
            df_Network_filtered,
            df_Billing_filtered,
            on=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Transaction Date', 'Count'],
            how='inner',
            suffixes=('_Network', '_Billing')
        )



        # Transaction Date mismatch between Network and Billing
        transaction_date_mismatch = (
            merged_transaction_df['Transaction Date_Network'] != merged_transaction_df['Transaction Date_Billing']
        )

        # Process Transaction Date mismatched records
        if transaction_date_mismatch.any():
            mismatched_records = merged_transaction_df[transaction_date_mismatch].copy()
            mismatched_records['Billing Transaction Date'] = mismatched_records['Transaction Date_Billing']
            mismatched_records['Transaction Date'] = mismatched_records['Transaction Date_Network']
            mismatched_records['Mismatch Reason'] = "Transaction Date not matched between Network and Billing"
            metrics['data']['transaction_date_mismatch_count'] = transaction_date_mismatch.sum()
            metrics['data']['transaction_date_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Download (MB) mismatch between Network and Billing
        download_mismatch = (
            merged_transaction_df['Count_Network'] != merged_transaction_df['Count_Billing']
        )

        # Process Download (MB) mismatched records
        if download_mismatch.any():
            mismatched_records = merged_transaction_df[download_mismatch].copy()
            mismatched_records['Billing Count'] = mismatched_records['Count_Billing']
            mismatched_records['Count'] = mismatched_records['Count_Network']
            mismatched_records['Usage Type'] = mismatched_records['Usage Type_Network']
            mismatched_records['Usage Sub Type'] = mismatched_records['Usage Sub Type_Network']
            mismatched_records['Mismatch Reason'] = "Count mismatch between Network and Billing"
            metrics['data']['count_mismatch_count'] = download_mismatch.sum()
            metrics['data']['count_mismatched_records'] = mismatched_records.to_dict(orient='records')
        
        # Service ID and Service Start/End Date mismatch
        service_id_mismatch = (
            merged_service_df['Service ID_Network'] != merged_service_df['Service ID_Billing']
        )

        if service_id_mismatch.any():
            mismatched_records = merged_service_df[service_id_mismatch].copy()
            mismatched_records['Billing Service ID'] = mismatched_records['Service ID_Billing']
            mismatched_records['Billing Service Name'] = mismatched_records['Service Name_Billing']
            mismatched_records['Mismatch Reason'] = "Service mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] += service_id_mismatch.sum()
            metrics['data']['service_mismatched_records'].extend(mismatched_records.to_dict(orient='records'))

        service_date_mismatch = (
            (merged_service_df['Service Start Date_Network'] != merged_service_df['Service Start Date_Billing']) |
            (merged_service_df['Service End Date_Network'] != merged_service_df['Service End Date_Billing'])
        )

        if service_date_mismatch.any():
            mismatched_records = merged_service_df[service_date_mismatch].copy()
            mismatched_records['Billing Service Start Date'] = mismatched_records['Service Start Date_Billing']
            mismatched_records['Billing Service End Date'] = mismatched_records['Service End Date_Billing']
            mismatched_records['Mismatch Reason'] = "Service Start/End Date mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] += service_date_mismatch.sum()
            metrics['data']['service_mismatched_records'].extend(mismatched_records.to_dict(orient='records'))


        # Add named sections to records_display_card
        metrics['data']['records_display_card'] = [
            {
                "name": "Mismatched Records",
                "records": metrics['data']['mismatched_records']
            },
            {
                "name": "Account Status Mismatch",
                "records": metrics['data']['account_status_mismatched_records']
            },
            {
                "name": "Transaction Mismatch",
                "records": metrics['data']['transaction_mismatched_records'] + metrics['data']['transaction_date_mismatched_records']
            },
            {
                "name": "Count Mismatch",
                "records": metrics['data']['count_mismatched_records']
            },
            {
                "name": "Transaction Date Mismatch",
                "records": metrics['data']['transaction_date_mismatched_records']
            },
            {
                "name": "Missing Records",
                "records": metrics['data']['msisdn_missing_records']
            },
            {
                "name": "Service Mismatch",
                "records": metrics['data']['service_mismatched_records']
            }
        ]



        # Ensure all data in metrics is JSON serializable
        def convert_to_serializable(data):
            if isinstance(data, list):
                return [convert_to_serializable(item) for item in data]
            elif isinstance(data, dict):
                return {key: convert_to_serializable(value) for key, value in data.items()}
            elif isinstance(data, (np.int64, np.float64)):
                return data.item()  # Convert numpy types to Python-native types
            else:
                return data

        # Ensure all data in metrics is JSON serializable
        metrics = convert_to_serializable(metrics)
        return metrics

    
    @classmethod
    def get_network_vs_billing_voice_opt(cls):

         # Initialize metrics
        metrics = {
                'voice': {},
                'sms': {},
                'data': {
                    'total_records': 0,
                    'mismatch_count': 0,
                    'mismatch_status': "No Mismatches",
                    'mismatched_records': [],
                    'account_status_mismatch_count': 0,
                    'account_status_mismatched_records': [],
                    'transaction_mismatch_count': 0,
                    'transaction_mismatched_records': [],
                    'transaction_date_mismatch_count': 0,
                    'duration_mismatch_count': 0,
                    'duration_mismatched_records': [],
                    'transaction_date_mismatched_records': [],
                    'msisdn_missing_count': 0,
                    'msisdn_missing_records': [],
                    'service_mismatch_count': 0,
                    'service_mismatched_records': [],
                    'duplicate_count': 0,
                    'duplicate_records': [],
                    'revenue_trend': [],
                    'service_breakdown': [],
                    'records_display_card': []
                },
                'service_distribution': []
            }
        
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        billing_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_VOICE', 'Billing_Voice_Big.csv')
        network_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_VOICE', 'Network_Voice_Big.csv')

        df_Billing = pd.read_csv(billing_file_path)
        df_Network = pd.read_csv(network_file_path)
        total_inc_duplicate = int(max(df_Billing.shape[0], df_Network.shape[0]))
        
        # Clean and prepare data
        # Remove leading/trailing spaces from column names
        df_Network.columns = df_Network.columns.str.strip()
        df_Billing.columns = df_Billing.columns.str.strip()

        # Identify duplicate rows in CRM and Billing
        billing_duplicates = df_Billing.duplicated(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Call Start Time', 'Call End Time','Duration (Mins)', 'Service ID', 'Service Name', 'Service Status',	'Service Start Date', 'Service End Date']).sum()
        network_duplicates = df_Network.duplicated(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Call Start Time', 'Call End Time','Duration (Mins)', 'Service ID', 'Service Name', 'Service Status',	'Service Start Date', 'Service End Date']).sum()
        total_duplicates = int(billing_duplicates + network_duplicates)

        # Remove duplicates for analysis
        df_Network = df_Network.drop_duplicates(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Call Start Time', 'Call End Time','Duration (Mins)', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'])
        df_Billing = df_Billing.drop_duplicates(subset=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Call Start Time', 'Call End Time','Duration (Mins)', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'])

        # Merge datasets on MSISDN
        merged_df = pd.merge(
            df_Network,
            df_Billing,
            on=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Call Start Time', 'Call End Time', 'Duration (Mins)', 'Service ID', 'Service Name', 'Service Status', 'Service Start Date', 'Service End Date'],
            how='outer',
            suffixes=('_Network', '_Billing'),
            indicator=True

        )


        mismatched_records = merged_df[merged_df['_merge'] == 'left_only'].copy()

        # Append mismatched records to metrics
        metrics['data']['mismatched_records'].extend(mismatched_records.to_dict(orient='records'))
        metrics['data']['mismatch_count'] += len(mismatched_records)

        # Process mismatched records to calculate monthly mismatch trend
        if metrics['data']['mismatched_records']:
            # Convert mismatched records to a DataFrame for efficient processing
            mismatched_df = pd.DataFrame(metrics['data']['mismatched_records'])

            # Ensure 'Transaction Date_Network' is in datetime format
            mismatched_df['Call Start Time'] = pd.to_datetime(
                mismatched_df['Call Start Time'], format='%m/%d/%Y %H:%M', errors='coerce'
            )

            # Extract the month and year for grouping
            mismatched_df['Month_Year'] = mismatched_df['Call Start Time'].dt.to_period('M')

            # Calculate the mismatch trend by grouping by 'Month_Year'
            mismatch_trend = mismatched_df['Month_Year'].value_counts().sort_index()

            # Convert mismatch trend to a list of dictionaries for the revenue_trend field
            metrics['data']['revenue_trend'] = [
                {'date': period.strftime('%m/%Y'), 'value': count} for period, count in mismatch_trend.items()
            ]
   

        # Merge datasets on common keys for comparison
        serv_status_df = pd.merge(
            df_Network, 
            df_Billing, 
            on=['MSISDN','Service ID', 'Service Name', 'Service Start Date', 'Service End Date'], 
            how='inner',
            suffixes=(' Network', ' Billing')
        )

        
        
        #total records
        metrics['data']['total_records'] = total_inc_duplicate
        #total duplicates
        metrics['data']['duplicate_count'] = total_duplicates

        # Filter relevant rows
        df_Network_filtered = df_Network[df_Network['Account Status'] == "I"]

        # Optimize data types
        df_Network_filtered['Account Status'] = df_Network_filtered['Account Status'].astype('category')
        df_Network_filtered['Service Status'] = df_Network_filtered['Service Status'].astype('category')

        # Vectorized Account Status mismatch
        account_status_mismatch = (
            (df_Network_filtered['Account Status'] == "I") & 
            (df_Network_filtered['Service Status'] != "I")
        )
        if account_status_mismatch.any():
            metrics['data']['account_status_mismatch_count'] = account_status_mismatch.sum()
            metrics['data']['account_status_mismatched_records'] = df_Network_filtered[account_status_mismatch].to_dict(orient='records')

        # Vectorized Service Status mismatch
        service_status_mismatch = (
            ((serv_status_df['Service Status Network'] == "A") & (serv_status_df['Service Status Billing'] == "I")) |
            ((serv_status_df['Service Status Network'] == "I") & (serv_status_df['Service Status Billing'] == "A"))
        )
        if service_status_mismatch.any():
            mismatched_records = serv_status_df[service_status_mismatch].copy()
            mismatched_records['Billing Service Status'] = mismatched_records['Service Status Billing']
            mismatched_records['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] = service_status_mismatch.sum()
            metrics['data']['service_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Filter rows where Account Status and Service Status are both "A"
        active_records = df_Network[
            (df_Network['Account Status'] == "A") & 
            (df_Network['Service Status'] == "A")
        ]


        # Vectorized Transaction Date mismatch condition
        transaction_date_mismatch = (
            (pd.notna(active_records['Call Start Time'])) &
            (pd.notna(active_records['Service Start Date'])) &
            (pd.notna(active_records['Service End Date'])) &
            ~((active_records['Service Start Date'] <= active_records['Call Start Time']) &
            (active_records['Call Start Time'] <= active_records['Service End Date']))
        )

        # Process transaction mismatched records
        if transaction_date_mismatch.any():
            mismatched_records = active_records[transaction_date_mismatch].copy()
            mismatched_records['Mismatch Reason'] = "Call Start Time not In Between Service Start/End Date"
            metrics['data']['transaction_mismatch_count'] = transaction_date_mismatch.sum()
            metrics['data']['transaction_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Filter rows where Transaction Date is between Service Start Date and Service End Date
        valid_transaction_records = active_records[
            (pd.notna(active_records['Call Start Time'])) &
            (pd.notna(active_records['Service Start Date'])) &
            (pd.notna(active_records['Service End Date'])) &
            (active_records['Service Start Date'] <= active_records['Call Start Time']) &
            (active_records['Call Start Time'] <= active_records['Service End Date'])
        ]

        # Compare MSISDN values between Network and Billing
        msisdn_missing_mask = ~valid_transaction_records['MSISDN'].isin(df_Billing['MSISDN'])

        # Process MSISDN mismatched records
        if msisdn_missing_mask.any():
            msisdn_missing_records = valid_transaction_records[msisdn_missing_mask].copy()
            metrics['data']['msisdn_missing_count'] = msisdn_missing_mask.sum()
            metrics['data']['msisdn_missing_records'] = msisdn_missing_records.to_dict(orient='records')

        # Filter Network dataset based on conditions
        df_Network_filtered = df_Network[
            (df_Network['Account Status'] == "A") &
            (df_Network['Service Status'] == "A") &
            (pd.to_datetime(df_Network['Call Start Time'], errors='coerce') >= pd.to_datetime(df_Network['Service Start Date'], errors='coerce')) &
            (pd.to_datetime(df_Network['Call Start Time'], errors='coerce') <= pd.to_datetime(df_Network['Service End Date'], errors='coerce'))
        ]

        # Filter Billing dataset based on MSISDN matching
        df_Billing_filtered = df_Billing[
            df_Billing['MSISDN'].isin(df_Network_filtered['MSISDN'])
        ]

        # Merge filtered datasets
        merged_transaction_df = pd.merge(
            df_Network_filtered,
            df_Billing_filtered,
            on=['MSISDN', 'Service ID', 'Service Name', 'Service Start Date', 'Service End Date','Service Status'],
            how='inner',
            suffixes=('_Network', '_Billing')
        )

        # Merge filtered datasets
        merged_service_df = pd.merge(
            df_Network_filtered,
            df_Billing_filtered,
            on=['MSISDN', 'Account Status', 'Usage Type', 'Usage Sub Type', 'Call Start Time', 'Call End Time', 'Duration (Mins)'],
            how='inner',
            suffixes=('_Network', '_Billing')
        )



        # Transaction Date mismatch between Network and Billing
        transaction_date_mismatch = (
            (merged_transaction_df['Call Start Time_Network'] != merged_transaction_df['Call Start Time_Billing']) |
            (merged_transaction_df['Call End Time_Network'] != merged_transaction_df['Call End Time_Billing'])
        )

        # Process Transaction Date mismatched records
        if transaction_date_mismatch.any():
            # Filter mismatched records
            mismatched_records = merged_transaction_df[transaction_date_mismatch].copy()

            # Add mismatch reason for each record
            mismatched_records['Mismatch Reason'] = mismatched_records.apply(
                lambda row: "Call Start/End Time not matched between Network and Billing"
                if (row['Call Start Time_Network'] != row['Call Start Time_Billing']) or (row['Call End Time_Network'] != row['Call End Time_Billing'])    
                else "Call Start/End Time not matched between Network and Billing",
                axis=1
            )

            # Restrict processing to one record per MSISDN
            mismatched_records = mismatched_records.drop_duplicates(subset=['MSISDN'])

            # Update metrics
            metrics['data']['transaction_date_mismatch_count'] = len(mismatched_records)
            metrics['data']['transaction_date_mismatched_records'] = mismatched_records.to_dict(orient='records')

        # Download (MB) mismatch between Network and Billing
        download_mismatch = (
            merged_transaction_df['Duration (Mins)_Network'] != merged_transaction_df['Duration (Mins)_Billing']
        )

        # Process Download (MB) mismatched records
        if download_mismatch.any():
            mismatched_records = merged_transaction_df[download_mismatch].copy()

            # Drop duplicates based on MSISDN to ensure one record per MSISDN
            mismatched_records = mismatched_records.drop_duplicates(subset=['MSISDN'])

            # Add additional columns for mismatch details
            mismatched_records['Billing Duration (Mins)'] = mismatched_records['Duration (Mins)_Billing']
            mismatched_records['Duration (Mins)'] = mismatched_records['Duration (Mins)_Network']
            mismatched_records['Usage Type'] = mismatched_records['Usage Type_Network']
            mismatched_records['Usage Sub Type'] = mismatched_records['Usage Sub Type_Network']
            mismatched_records['Mismatch Reason'] = "Duration mismatch between Network and Billing"

            # Update metrics
            metrics['data']['duration_mismatch_count'] = len(mismatched_records)
            metrics['data']['duration_mismatched_records'] = mismatched_records.to_dict(orient='records')
        
        # Service ID and Service Start/End Date mismatch
        service_id_mismatch = (
            merged_service_df['Service ID_Network'] != merged_service_df['Service ID_Billing']
        )

        if service_id_mismatch.any():
            mismatched_records = merged_service_df[service_id_mismatch].copy()
            mismatched_records['Mismatch Reason'] = "Service mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] += service_id_mismatch.sum()
            metrics['data']['service_mismatched_records'].extend(mismatched_records.to_dict(orient='records'))

        service_date_mismatch = (
            (merged_service_df['Service Start Date_Network'] != merged_service_df['Service Start Date_Billing']) |
            (merged_service_df['Service End Date_Network'] != merged_service_df['Service End Date_Billing'])
        )

        if service_date_mismatch.any():
            mismatched_records = merged_service_df[service_date_mismatch].copy()
            mismatched_records['Billing Service Start Date'] = mismatched_records['Service Start Date_Billing']
            mismatched_records['Billing Service End Date'] = mismatched_records['Service End Date_Billing']
            mismatched_records['Mismatch Reason'] = "Service Start/End Date mismatch between Network and Billing"
            metrics['data']['service_mismatch_count'] += service_date_mismatch.sum()
            metrics['data']['service_mismatched_records'].extend(mismatched_records.to_dict(orient='records'))


        # Add named sections to records_display_card
        metrics['data']['records_display_card'] = [
            {
                "name": "Mismatched Records",
                "records": metrics['data']['mismatched_records']
            },
            {
                "name": "Account Status Mismatch",
                "records": metrics['data']['account_status_mismatched_records']
            },
            {
                "name": "Transaction Mismatch",
                "records": metrics['data']['transaction_mismatched_records'] + metrics['data']['transaction_date_mismatched_records']
            },
            {
                "name": "Duration Mismatch",
                "records": metrics['data']['duration_mismatched_records']
            },
            {
                "name": "Transaction Date Mismatch",
                "records": metrics['data']['transaction_date_mismatched_records']
            },
            {
                "name": "Missing Records",
                "records": metrics['data']['msisdn_missing_records']
            },
            {
                "name": "Service Mismatch",
                "records": metrics['data']['service_mismatched_records']
            }
        ]



        # Ensure all data in metrics is JSON serializable
        def convert_to_serializable(data):
            if isinstance(data, list):
                return [convert_to_serializable(item) for item in data]
            elif isinstance(data, dict):
                return {key: convert_to_serializable(value) for key, value in data.items()}
            elif isinstance(data, (np.int64, np.float64)):
                return data.item()  # Convert numpy types to Python-native types
            else:
                return data

        # Ensure all data in metrics is JSON serializable
        metrics = convert_to_serializable(metrics)
        return metrics
        

    @classmethod
    def get_network_vs_billing_data(cls):
        try:
            metrics = {
                'voice': {},
                'sms': {},
                'data': {
                    'total_records': 0,
                    'mismatch_count': 0,
                    'mismatch_status': "No Mismatches",
                    'mismatched_records': [],
                    'account_status_mismatch_count': 0,
                    'account_status_mismatched_records': [],
                    'transaction_mismatch_count': 0,
                    'transaction_mismatched_records': [],
                    'transaction_date_mismatch_count': 0,
                    'download_mismatch_count': 0,
                    'download_mismatched_records': [],
                    'transaction_date_mismatched_records': [],
                    'msisdn_missing_count': 0,
                    'msisdn_missing_records': [],
                    'service_mismatch_count': 0,
                    'service_mismatched_records': [],
                    'duplicate_count': 0,
                    'duplicate_records': [],
                    'revenue_trend': [],
                    'service_breakdown': [],
                    'records_display_card': []
                },
                'service_distribution': []
            }

            #####DATA-Part#######
            # Load the CSV files
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            billing_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_DATA', 'Billing_100_VSDN.csv')
            network_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_DATA', 'Network_100_VSDN.csv')

            df_Billing = pd.read_csv(billing_file_path)
            df_Network = pd.read_csv(network_file_path)

            # Preprocess Account Status and Service Status to remove extra spaces
            df_Network['Account Status'] = df_Network['Account Status'].astype(str).str.strip().str.upper()
            df_Network['Service Status'] = df_Network['Service Status'].astype(str).str.strip().str.upper()

            # Identify duplicate rows in the Network data (excluding the first occurrence)
            duplicate_rows = df_Network[df_Network.duplicated(keep='first')]

            # Add duplicate rows to the metrics
            if not duplicate_rows.empty:
                metrics['data']['duplicate_records'] = duplicate_rows.astype(object).to_dict(orient='records')
                metrics['data']['duplicate_count'] = int(len(duplicate_rows))

            # Remove duplicates from Network data
            df_Network_no_duplicates = df_Network.drop_duplicates(keep='first')
            metrics['data']['total_records'] = int(len(df_Network_no_duplicates))

            ## Ensure MSISDN is unique in df_Billing
            if not df_Billing['MSISDN'].is_unique:
                print("Warning: Duplicate MSISDN values found in Billing data. Keeping the first occurrence.")
                df_Billing = df_Billing.drop_duplicates(subset=['MSISDN'], keep='first')

            # Precompute dictionaries for faster lookups
            billing_dict = df_Billing.set_index('MSISDN').to_dict(orient='index')


            # Process mismatches
            def process_row(row):
                msisdn = row['MSISDN']
                account_status = row['Account Status']
                service_status = row['Service Status']
                transaction_date = row['Transaction Date']
                service_start_date = row['Service Start Date']
                service_end_date = row['Service End Date']

                # Account Status mismatch
                if account_status == "I" and service_status != "I":
                    metrics['data']['account_status_mismatched_records'].append(row.to_dict())
                    metrics['data']['account_status_mismatch_count'] += 1

                # Service Status mismatch
                if msisdn in billing_dict:
                    billing_record = billing_dict[msisdn]
                    billing_service_status = billing_record.get('Service Status', '').strip().upper()
                    if (service_status == "A" and billing_service_status == "I") or (service_status == "I" and billing_service_status == "A"):
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Service Status'] = billing_service_status
                        mismatched_record['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
                        metrics['data']['service_mismatched_records'].append(mismatched_record)
                        metrics['data']['service_mismatch_count'] += 1

                # Transaction Date mismatch
                if pd.notna(transaction_date) and pd.notna(service_start_date) and pd.notna(service_end_date):
                    if not (service_start_date <= transaction_date <= service_end_date):
                        mismatched_record = row.to_dict()
                        mismatched_record['Mismatch Reason'] = "Transaction Date not In Between Service Start/End Date"
                        metrics['data']['transaction_mismatched_records'].append(mismatched_record)
                        metrics['data']['transaction_mismatch_count'] += 1

                # MSISDN mismatch
                if msisdn not in billing_dict:
                    metrics['data']['msisdn_missing_records'].append(row.to_dict())
                    metrics['data']['msisdn_missing_count'] += 1
                else:

                    # Transaction Date mismatch between Network and Billing
                    billing_transaction_date = billing_record.get('Transaction Date')
                    network_transaction_date = row.get('Transaction Date')
                    if billing_transaction_date != network_transaction_date:
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Transaction Date'] = billing_transaction_date
                        mismatched_record['Mismatch Reason'] = "Transaction Date not matched between Network and Billing"
                        metrics['data']['transaction_date_mismatched_records'].append(mismatched_record)
                        metrics['data']['transaction_date_mismatch_count'] += 1
                    
                    billing_record = billing_dict[msisdn]

                    # Download (MB) mismatch
                    network_download = row.get('Download (MB)', 0)
                    billing_download = billing_record.get('Download (MB)', 0)
                    if network_download != billing_download:
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Download (MB)'] = billing_download
                        mismatched_record['Mismatch Reason'] = "Download (MB) mismatch between Network and Billing"
                        metrics['data']['download_mismatched_records'].append(mismatched_record)
                        metrics['data']['download_mismatch_count'] += 1

                    # Service ID and Service Start/End Date mismatch
                    billing_service_id = billing_record.get('Service ID')
                    billing_service_name = billing_record.get('Service Name')  # Retrieve the Billing Service Name
                    if row['Service ID'] != billing_service_id:
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Service ID'] = billing_service_id
                        mismatched_record['Billing Service Name'] = billing_service_name  # Add the Billing Service Name
                        mismatched_record['Mismatch Reason'] = "Service mismatch between Network and Billing"
                        metrics['data']['service_mismatched_records'].append(mismatched_record)
                        metrics['data']['service_mismatch_count'] += 1
                    else:
                        # Convert Billing Start Date and End Date to match Network file format
                        billing_service_start_date = pd.to_datetime(
                            billing_record.get('Service Start Date'), format='%m/%d/%Y', errors='coerce'
                        )
                        billing_service_end_date = pd.to_datetime(
                            billing_record.get('Service End Date'), format='%m/%d/%Y', errors='coerce'
                        )

                        # Convert Network Start Date and End Date to ensure consistent format
                        service_start_date = pd.to_datetime(row['Service Start Date'], format='%m/%d/%Y', errors='coerce')
                        service_end_date = pd.to_datetime(row['Service End Date'], format='%m/%d/%Y', errors='coerce')

                        # Perform the comparison
                        if pd.notna(billing_service_start_date) and pd.notna(billing_service_end_date):
                            if (billing_service_start_date != service_start_date or billing_service_end_date != service_end_date):
                                mismatched_record = row.to_dict()
                                mismatched_record['Billing Service Start Date'] = billing_service_start_date.strftime('%m/%d/%Y') if pd.notna(billing_service_start_date) else None
                                mismatched_record['Billing Service End Date'] = billing_service_end_date.strftime('%m/%d/%Y') if pd.notna(billing_service_end_date) else None
                                mismatched_record['Mismatch Reason'] = "Service Start/End Date mismatch between Network and Billing"
                                metrics['data']['service_mismatched_records'].append(mismatched_record)
                                metrics['data']['service_mismatch_count'] += 1




                    # Check for mismatches across all columns
                matching_rows = df_Billing[
                    (df_Billing['MSISDN'] == row['MSISDN']) &
                    (df_Billing['Account Status'] == row['Account Status']) &
                    (df_Billing['Service Status'] == row['Service Status']) &
                    (df_Billing['Transaction Date'] == row['Transaction Date']) &
                    (df_Billing['Service Start Date'] == row['Service Start Date']) &
                    (df_Billing['Service End Date'] == row['Service End Date']) &
                    (df_Billing['Service ID'] == row['Service ID']) &
                    (df_Billing['Download (MB)'] == row['Download (MB)'])
                ]

                if matching_rows.empty:
                    metrics['data']['mismatched_records'].append(row.to_dict())
                    metrics['data']['mismatch_count'] += 1
            # Apply the process_row function to each row
            df_Network_no_duplicates.apply(process_row, axis=1)

            

            # Process mismatched records to calculate monthly mismatch trend
            mismatch_trend = defaultdict(int)
            for record in metrics['data']['mismatched_records']:
                transaction_date = record.get('Transaction Date')
                if pd.notna(transaction_date):  # Check if the value is not NaN
                    transaction_date = str(transaction_date)  # Convert to string if necessary
                    transaction_date = datetime.strptime(transaction_date, '%m/%d/%Y %H:%M')
                    # Format the date as "M/YYYY" for monthly grouping
                    month = f"{transaction_date.month}/{transaction_date.year}"
                    mismatch_trend[month] += 1

            # Convert mismatch trend to a list of dictionaries for the revenue_trend field
            metrics['data']['revenue_trend'] = [
                {'date': month, 'value': count} for month, count in sorted(
                    mismatch_trend.items(),
                    key=lambda x: datetime.strptime(x[0], '%m/%Y')  # Sort by actual date
                )
            ]

            # Update mismatch status
            metrics['data']['mismatch_status'] = "Mismatches Found" if metrics['data']['mismatch_count'] > 0 else "No Mismatches"

            # Process service mismatch records to group by Service Name, Usage Type, and Usage Sub Type
            service_mismatch_summary = defaultdict(lambda: {'count': 0, 'total_download_mb': 0.0})

            for record in metrics['data']['service_mismatched_records']:
                service_name = record.get('Service Name', 'Unknown')
                usage_type = record.get('Usage Type', 'Unknown')
                usage_sub_type = record.get('Usage Sub Type', 'Unknown')
                download_mb = float(record.get('Download (MB)', 0.0))

                # Create a unique key for grouping
                key = (service_name, usage_type, usage_sub_type)

                # Update the count and total download for the group
                service_mismatch_summary[key]['count'] += 1
                service_mismatch_summary[key]['total_download_mb'] += download_mb

            # Convert the summary to a list of dictionaries for easier consumption
            metrics['data']['service_breakdown'] = [
                {
                    'service_name': key[0],
                    'usage_type': key[1],
                    'usage_sub_type': key[2],
                    'count': value['count'],
                    'total_download_mb': value['total_download_mb']
                }
                for key, value in service_mismatch_summary.items()
            ]

            # Add named sections to records_display_card
            metrics['data']['records_display_card'] = [
                {
                    "name": "Mismatched Records",
                    "records": metrics['data']['mismatched_records']
                },
                {
                    "name": "Account Status Mismatch",
                    "records": metrics['data']['account_status_mismatched_records']
                },
                {
                    "name": "Transaction Mismatch",
                    "records": metrics['data']['transaction_mismatched_records'] + metrics['data']['transaction_date_mismatched_records']
                },
                {
                    "name": "Volume Mismatch",
                    "records": metrics['data']['download_mismatched_records']
                },
                {
                    "name": "Transaction Date Mismatch",
                    "records": metrics['data']['transaction_date_mismatched_records']
                },
                {
                    "name": "Missing Records",
                    "records": metrics['data']['msisdn_missing_records']
                },
                {
                    "name": "Service Mismatch",
                    "records": metrics['data']['service_mismatched_records']
                }
            ]


        except Exception as e:
            print(f"An error occurred: {e}")
            metrics = None

        # Ensure all data in metrics is JSON serializable
        def convert_to_serializable(data):
            if isinstance(data, list):
                return [convert_to_serializable(item) for item in data]
            elif isinstance(data, dict):
                return {key: convert_to_serializable(value) for key, value in data.items()}
            elif isinstance(data, (np.int64, np.float64)):
                return data.item()  # Convert numpy types to Python-native types
            else:
                return data

        # Ensure all data in metrics is JSON serializable
        metrics = convert_to_serializable(metrics)
        return metrics
    
    @classmethod
    def get_network_vs_billing_sms(cls):
        try:
            metrics = {
                'voice': {},
                'sms': {},
                'data': {
                    'total_records': 0,
                    'mismatch_count': 0,
                    'mismatch_status': "No Mismatches",
                    'mismatched_records': [],
                    'account_status_mismatch_count': 0,
                    'account_status_mismatched_records': [],
                    'transaction_mismatch_count': 0,
                    'transaction_mismatched_records': [],
                    'transaction_date_mismatch_count': 0,
                    'count_mismatch_count': 0,
                    'count_mismatched_records': [],
                    'transaction_date_mismatched_records': [],
                    'msisdn_missing_count': 0,
                    'msisdn_missing_records': [],
                    'service_mismatch_count': 0,
                    'service_mismatched_records': [],
                    'duplicate_count': 0,
                    'duplicate_records': [],
                    'revenue_trend': [],
                    'service_breakdown': [],
                    'records_display_card': []
                },
                'service_distribution': []
            }

            #####DATA-Part#######
            # Load the CSV files
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            billing_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_SMS', 'Billing_SMS_Big.csv')
            network_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_SMS', 'Network_SMS_Big.csv')

            df_Billing = pd.read_csv(billing_file_path)
            df_Network = pd.read_csv(network_file_path)

            # Preprocess Account Status and Service Status to remove extra spaces
            df_Network['Account Status'] = df_Network['Account Status'].astype(str).str.strip().str.upper()
            df_Network['Service Status'] = df_Network['Service Status'].astype(str).str.strip().str.upper()

            # Identify duplicate rows in the Network data (excluding the first occurrence)
            duplicate_rows = df_Network[df_Network.duplicated(keep='first')]

            # Add duplicate rows to the metrics
            if not duplicate_rows.empty:
                metrics['data']['duplicate_records'] = duplicate_rows.astype(object).to_dict(orient='records')
                metrics['data']['duplicate_count'] = int(len(duplicate_rows))

            # Remove duplicates from Network data
            df_Network_no_duplicates = df_Network.drop_duplicates(keep='first')
            metrics['data']['total_records'] = int(len(df_Network_no_duplicates))

            ## Ensure MSISDN is unique in df_Billing
            if not df_Billing['MSISDN'].is_unique:
                print("Warning: Duplicate MSISDN values found in Billing data. Keeping the first occurrence.")
                df_Billing = df_Billing.drop_duplicates(subset=['MSISDN'], keep='first')

            # Precompute dictionaries for faster lookups
            billing_dict = df_Billing.set_index('MSISDN').to_dict(orient='index')


            # Process mismatches
            def process_row(row):
                msisdn = row['MSISDN']
                account_status = row['Account Status']
                service_status = row['Service Status']
                transaction_date = row['Transaction Date']
                service_start_date = row['Service Start Date']
                service_end_date = row['Service End Date']

                # Account Status mismatch
                if account_status == "I" and service_status != "I":
                    metrics['data']['account_status_mismatched_records'].append(row.to_dict())
                    metrics['data']['account_status_mismatch_count'] += 1

                # Service Status mismatch
                if msisdn in billing_dict:
                    billing_record = billing_dict[msisdn]
                    billing_service_status = billing_record.get('Service Status', '').strip().upper()
                    if (service_status == "A" and billing_service_status == "I") or (service_status == "I" and billing_service_status == "A"):
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Service Status'] = billing_service_status
                        mismatched_record['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
                        metrics['data']['service_mismatched_records'].append(mismatched_record)
                        metrics['data']['service_mismatch_count'] += 1

                # Transaction Date mismatch
                if pd.notna(transaction_date) and pd.notna(service_start_date) and pd.notna(service_end_date):
                    if not (service_start_date <= transaction_date <= service_end_date):
                        mismatched_record = row.to_dict()
                        mismatched_record['Mismatch Reason'] = "Transaction Date not In Between Service Start/End Date"
                        metrics['data']['transaction_mismatched_records'].append(mismatched_record)
                        metrics['data']['transaction_mismatch_count'] += 1

                # MSISDN mismatch
                if msisdn not in billing_dict:
                    metrics['data']['msisdn_missing_records'].append(row.to_dict())
                    metrics['data']['msisdn_missing_count'] += 1
                else:

                    # Transaction Date mismatch between Network and Billing
                    billing_transaction_date = billing_record.get('Transaction Date')
                    network_transaction_date = row.get('Transaction Date')
                    if billing_transaction_date != network_transaction_date:
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Transaction Date'] = billing_transaction_date
                        mismatched_record['Mismatch Reason'] = "Transaction Date not matched between Network and Billing"
                        metrics['data']['transaction_date_mismatched_records'].append(mismatched_record)
                        metrics['data']['transaction_date_mismatch_count'] += 1
                    
                    billing_record = billing_dict[msisdn]

                    # Count mismatch
                    network_download = row.get('Count', 0)
                    billing_download = billing_record.get('Count', 0)
                    if network_download != billing_download:
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Count'] = billing_download
                        mismatched_record['Mismatch Reason'] = "Count mismatch between Network and Billing"
                        metrics['data']['count_mismatched_records'].append(mismatched_record)
                        metrics['data']['count_mismatch_count'] += 1

                    # Service ID and Service Start/End Date mismatch
                    billing_service_id = billing_record.get('Service ID')
                    billing_service_name = billing_record.get('Service Name')  # Retrieve the Billing Service Name
                    if row['Service ID'] != billing_service_id:
                        mismatched_record = row.to_dict()
                        mismatched_record['Billing Service ID'] = billing_service_id
                        mismatched_record['Billing Service Name'] = billing_service_name  # Add the Billing Service Name
                        mismatched_record['Mismatch Reason'] = "Service mismatch between Network and Billing"
                        metrics['data']['service_mismatched_records'].append(mismatched_record)
                        metrics['data']['service_mismatch_count'] += 1
                    else:
                        # Convert Billing Start Date and End Date to match Network file format
                        billing_service_start_date = pd.to_datetime(
                            billing_record.get('Service Start Date'), format='%m/%d/%Y', errors='coerce'
                        )
                        billing_service_end_date = pd.to_datetime(
                            billing_record.get('Service End Date'), format='%m/%d/%Y', errors='coerce'
                        )

                        # Convert Network Start Date and End Date to ensure consistent format
                        service_start_date = pd.to_datetime(row['Service Start Date'], format='%m/%d/%Y', errors='coerce')
                        service_end_date = pd.to_datetime(row['Service End Date'], format='%m/%d/%Y', errors='coerce')

                        # Perform the comparison
                        if pd.notna(billing_service_start_date) and pd.notna(billing_service_end_date):
                            if (billing_service_start_date != service_start_date or billing_service_end_date != service_end_date):
                                mismatched_record = row.to_dict()
                                mismatched_record['Billing Service Start Date'] = billing_service_start_date.strftime('%m/%d/%Y') if pd.notna(billing_service_start_date) else None
                                mismatched_record['Billing Service End Date'] = billing_service_end_date.strftime('%m/%d/%Y') if pd.notna(billing_service_end_date) else None
                                mismatched_record['Mismatch Reason'] = "Service Start/End Date mismatch between Network and Billing"
                                metrics['data']['service_mismatched_records'].append(mismatched_record)
                                metrics['data']['service_mismatch_count'] += 1




                    # Check for mismatches across all columns
                matching_rows = df_Billing[
                    (df_Billing['MSISDN'] == row['MSISDN']) &
                    (df_Billing['Account Status'] == row['Account Status']) &
                    (df_Billing['Service Status'] == row['Service Status']) &
                    (df_Billing['Transaction Date'] == row['Transaction Date']) &
                    (df_Billing['Service Start Date'] == row['Service Start Date']) &
                    (df_Billing['Service End Date'] == row['Service End Date']) &
                    (df_Billing['Service ID'] == row['Service ID']) &
                    (df_Billing['Count'] == row['Count'])
                ]

                if matching_rows.empty:
                    metrics['data']['mismatched_records'].append(row.to_dict())
                    metrics['data']['mismatch_count'] += 1
            # Apply the process_row function to each row
            df_Network_no_duplicates.apply(process_row, axis=1)

            

            # Process mismatched records to calculate monthly mismatch trend
            mismatch_trend = defaultdict(int)
            for record in metrics['data']['mismatched_records']:
                transaction_date = record.get('Transaction Date')
                if pd.notna(transaction_date):  # Check if the value is not NaN
                    transaction_date = str(transaction_date)  # Convert to string if necessary
                    transaction_date = datetime.strptime(transaction_date, '%m/%d/%Y %H:%M')
                    # Format the date as "M/YYYY" for monthly grouping
                    month = f"{transaction_date.month}/{transaction_date.year}"
                    mismatch_trend[month] += 1

            # Convert mismatch trend to a list of dictionaries for the revenue_trend field
            metrics['data']['revenue_trend'] = [
                {'date': month, 'value': count} for month, count in sorted(
                    mismatch_trend.items(),
                    key=lambda x: datetime.strptime(x[0], '%m/%Y')  # Sort by actual date
                )
            ]

            # Update mismatch status
            metrics['data']['mismatch_status'] = "Mismatches Found" if metrics['data']['mismatch_count'] > 0 else "No Mismatches"

            # Process service mismatch records to group by Service Name, Usage Type, and Usage Sub Type
            service_mismatch_summary = defaultdict(lambda: {'count': 0, 'total_download_mb': 0.0})

            for record in metrics['data']['service_mismatched_records']:
                service_name = record.get('Service Name', 'Unknown')
                usage_type = record.get('Usage Type', 'Unknown')
                usage_sub_type = record.get('Usage Sub Type', 'Unknown')
                download_mb = float(record.get('Download (MB)', 0.0))

                # Create a unique key for grouping
                key = (service_name, usage_type, usage_sub_type)

                # Update the count and total download for the group
                service_mismatch_summary[key]['count'] += 1
                service_mismatch_summary[key]['total_download_mb'] += download_mb

            # Convert the summary to a list of dictionaries for easier consumption
            metrics['data']['service_breakdown'] = [
                {
                    'service_name': key[0],
                    'usage_type': key[1],
                    'usage_sub_type': key[2],
                    'count': value['count'],
                    'total_download_mb': value['total_download_mb']
                }
                for key, value in service_mismatch_summary.items()
            ]

            # Add named sections to records_display_card
            metrics['data']['records_display_card'] = [
                {
                    "name": "Mismatched Records",
                    "records": metrics['data']['mismatched_records']
                },
                {
                    "name": "Account Status Mismatch",
                    "records": metrics['data']['account_status_mismatched_records']
                },
                {
                    "name": "Transaction Mismatch",
                    "records": metrics['data']['transaction_mismatched_records'] + metrics['data']['transaction_date_mismatched_records']
                },
                {
                    "name": "Count Mismatch",
                    "records": metrics['data']['count_mismatched_records']
                },
                {
                    "name": "Transaction Date Mismatch",
                    "records": metrics['data']['transaction_date_mismatched_records']
                },
                {
                    "name": "Missing Records",
                    "records": metrics['data']['msisdn_missing_records']
                },
                {
                    "name": "Service Mismatch",
                    "records": metrics['data']['service_mismatched_records']
                }
            ]


        except Exception as e:
            print(f"An error occurred: {e}")
            metrics = None

        # Ensure all data in metrics is JSON serializable
        def convert_to_serializable(data):
            if isinstance(data, list):
                return [convert_to_serializable(item) for item in data]
            elif isinstance(data, dict):
                return {key: convert_to_serializable(value) for key, value in data.items()}
            elif isinstance(data, (np.int64, np.float64)):
                return data.item()  # Convert numpy types to Python-native types
            else:
                return data

        # Ensure all data in metrics is JSON serializable
        metrics = convert_to_serializable(metrics)
        return metrics
    
    @classmethod
    def get_network_vs_billing_voice(cls):
        try:
            metrics = {
                'voice': {},
                'sms': {},
                'data': {
                    'total_records': 0,
                    'mismatch_count': 0,
                    'mismatch_status': "No Mismatches",
                    'mismatched_records': [],
                    'account_status_mismatch_count': 0,
                    'account_status_mismatched_records': [],
                    'transaction_mismatch_count': 0,
                    'transaction_mismatched_records': [],
                    'transaction_date_mismatch_count': 0,
                    'duration_mismatch_count': 0,
                    'duration_mismatched_records': [],
                    'transaction_date_mismatched_records': [],
                    'msisdn_missing_count': 0,
                    'msisdn_missing_records': [],
                    'service_mismatch_count': 0,
                    'service_mismatched_records': [],
                    'duplicate_count': 0,
                    'duplicate_records': [],
                    'revenue_trend': [],
                    'service_breakdown': [],
                    'records_display_card': []
                },
                'service_distribution': []
            }

            #####Voice-Part#######
            # Load the CSV files
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            billing_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_VOICE', 'Billing_Voice_Big.csv')
            network_file_path = os.path.join(curr_dir, '..', 'assets', 'Network_Billing_VOICE', 'Network_Voice_Big.csv')

            df_Billing = pd.read_csv(billing_file_path)
            df_Network = pd.read_csv(network_file_path)

           # Preprocess Account Status and Service Status to remove extra spaces
            df_Network['Account Status'] = df_Network['Account Status'].astype(str).str.strip().str.upper()
            df_Network['Service Status'] = df_Network['Service Status'].astype(str).str.strip().str.upper()


            # Identify duplicate rows in the Network data (excluding the first occurrence)
            duplicate_rows = df_Network[df_Network.duplicated(keep='first')]

            # Add duplicate rows to the metrics
            if not duplicate_rows.empty:
                metrics['data']['duplicate_records'] = duplicate_rows.astype(object).to_dict(orient='records')
                metrics['data']['duplicate_count'] = int(len(duplicate_rows))

            # Remove duplicates from Network data
            df_Network_no_duplicates = df_Network.drop_duplicates(keep='first')
            metrics['data']['total_records'] = int(len(df_Network_no_duplicates))

            for _, network_row in df_Network_no_duplicates.iterrows():
                # Preprocess Account Status and Service Status to remove extra spaces
                account_status = network_row['Account Status']
                service_status = network_row['Service Status']

                # Account State mismatch: Inactive Account Status with Active Service Status
                if account_status == "I" and service_status != "I":
                    metrics['data']['account_status_mismatched_records'].append(network_row.to_dict())
                    metrics['data']['account_status_mismatch_count'] += 1

                # Service Status mismatch between Network and Billing (Active/Inactive)
                billing_service_status_rows = df_Billing[df_Billing['MSISDN'] == network_row['MSISDN']]

                if not billing_service_status_rows.empty:
                    # Extract the Billing Service Status
                    billing_service_status = billing_service_status_rows['Service Status'].iloc[0].strip().upper()
                    # Ensure Network Service Status is also normalized
                    service_status = service_status.strip().upper()

                    # Check for mismatch between Network and Billing Service Status
                    if (service_status == "A" and billing_service_status == "I") or (service_status == "I" and billing_service_status == "A"):
                        mismatched_record = network_row.to_dict()
                        mismatched_record['Billing Service Status'] = billing_service_status
                        mismatched_record['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
                        metrics['data']['service_mismatched_records'].append(mismatched_record)
                        metrics['data']['service_mismatch_count'] += 1

                # Transaction Date mismatch
                if account_status == "A" and service_status == "A":
                    transaction_date = pd.to_datetime(network_row['Call Start Time'], format='%m/%d/%Y %H:%M', errors='coerce')
                    service_start_date = pd.to_datetime(network_row['Service Start Date'], format='%m/%d/%Y', errors='coerce')
                    service_end_date = pd.to_datetime(network_row['Service End Date'], format='%m/%d/%Y', errors='coerce')
                    
                    if not (service_start_date <= transaction_date <= service_end_date):
                        mismatched_record = network_row.to_dict()
                        mismatched_record['Mismatch Reason'] = "Call Start Time not In Between Service Start/End Date"
                        metrics['data']['transaction_mismatched_records'].append(mismatched_record)
                        metrics['data']['transaction_mismatch_count'] += 1
                    else:
                        # MSISDN mismatch
                        if not any(df_Billing['MSISDN'] == network_row['MSISDN']):
                            metrics['data']['msisdn_missing_records'].append(network_row.to_dict())
                            metrics['data']['msisdn_missing_count'] += 1
                        else:
                            # Transaction Date mismatch between Network and Billing
                            matching_transaction_date_rows = df_Billing[
                               ((df_Billing['MSISDN'] == network_row['MSISDN']) &
                                (df_Billing['Call Start Time'] == network_row['Call Start Time'])) |
                                (df_Billing['MSISDN'] == network_row['MSISDN']) &
                                (df_Billing['Call Start Time'] == network_row['Call Start Time'])
                                
                            ]

                            if matching_transaction_date_rows.empty:
                                mismatched_record = network_row.to_dict()
                                # Append the Call Start/End Time from the Billing record if available
                                billing_record = df_Billing.loc[df_Billing['MSISDN'] == network_row['MSISDN']]
                                if not billing_record.empty:
                                    mismatched_record['Billing Call Start Time'] = billing_record['Call Start Time'].values[0]
                                    mismatched_record['Billing Call End Time'] = billing_record['Call End Time'].values[0]
                                else:
                                    mismatched_record['Billing Call Start Time'] = None
                                    mismatched_record['Billing Call End Time'] = None
                                mismatched_record['Mismatch Reason'] = "Call Start/End Time not matched between Network and Billing"
                                metrics['data']['transaction_date_mismatched_records'].append(mismatched_record)
                                metrics['data']['transaction_date_mismatch_count'] += 1
                            # Duration mismatch between Network and Billing
                            matching_duration_rows = df_Billing[
                                (df_Billing['MSISDN'] == network_row['MSISDN']) &
                                (df_Billing['Duration (Mins)'] == network_row['Duration (Mins)'])
                            ]

                            if matching_duration_rows.empty:
                                mismatched_record = network_row.to_dict()
                                # Append the Duration (Mins) value from the Billing record if available
                                billing_record = df_Billing.loc[df_Billing['MSISDN'] == network_row['MSISDN']]
                                if not billing_record.empty:
                                    mismatched_record['Billing Duration (Mins)'] = billing_record['Duration (Mins)'].values[0]
                                else:
                                    mismatched_record['Billing Duration (Mins)'] = None
                                mismatched_record['Mismatch Reason'] = "Duration (Mins) mismatch between Network and Billing"
                                metrics['data']['duration_mismatched_records'].append(mismatched_record)
                                metrics['data']['duration_mismatch_count'] += 1

                            # Service ID and Service Start/End Date mismatch
                            matching_service_id_rows = df_Billing[
                                (df_Billing['MSISDN'] == network_row['MSISDN']) &
                                (df_Billing['Service ID'] == network_row['Service ID'])
                            ]

                            if matching_service_id_rows.empty:
                                # Service mismatch
                                mismatched_record = network_row.to_dict()
                                # Append the Service ID and Service Name from the Billing record if available
                                billing_record = df_Billing.loc[df_Billing['MSISDN'] == network_row['MSISDN']]
                                if not billing_record.empty:
                                    mismatched_record['Billing Service ID'] = billing_record['Service ID'].values[0]
                                    mismatched_record['Billing Service Name'] = billing_record['Service Name'].values[0]
                                else:
                                    mismatched_record['Billing Service ID'] = None
                                    mismatched_record['Billing Service Name'] = None
                                mismatched_record['Mismatch Reason'] = "Service mismatch between Network and Billing"
                                metrics['data']['service_mismatched_records'].append(mismatched_record)
                                metrics['data']['service_mismatch_count'] += 1
                            else:
                                # Compare Service Start Date and Service End Date
                                service_date_mismatch_found = False
                                for _, billing_row in matching_service_id_rows.iterrows():
                                    if (billing_row['Service Start Date'] != network_row['Service Start Date'] or
                                            billing_row['Service End Date'] != network_row['Service End Date']):
                                        mismatched_record = network_row.to_dict()
                                        # Append the Service Start Date and Service End Date from the Billing record
                                        mismatched_record['Billing Service Start Date'] = billing_row['Service Start Date']
                                        mismatched_record['Billing Service End Date'] = billing_row['Service End Date']
                                        mismatched_record['Mismatch Reason'] = "Service Start/End Date mismatch between Network and Billing"
                                        metrics['data']['service_mismatched_records'].append(mismatched_record)
                                        metrics['data']['service_mismatch_count'] += 1
                                        service_date_mismatch_found = True
                                        break
                                
                                    # If both Service mismatch and Service Start/End Date mismatch are satisfied, check Service Status
                                    if not service_date_mismatch_found:
                                        billing_service_status_rows = df_Billing[df_Billing['MSISDN'] == network_row['MSISDN']]
                                        if not billing_service_status_rows.empty:
                                            billing_service_status = billing_service_status_rows['Service Status'].values[0]
                                            if service_status != billing_service_status:
                                                mismatched_record = network_row.to_dict()
                                                mismatched_record['Billing Service Status'] = billing_service_status
                                                mismatched_record['Mismatch Reason'] = "Service Status mismatch between Network and Billing"
                                                metrics['data']['service_mismatched_records'].append(mismatched_record)
                                                metrics['data']['service_mismatch_count'] += 1

                # Check for mismatches across all columns
                matching_rows = df_Billing[
                    (df_Billing['MSISDN'] == network_row['MSISDN']) &
                    (df_Billing['Account Status'] == network_row['Account Status']) &
                    (df_Billing['Service Status'] == network_row['Service Status']) &
                    (df_Billing['Call Start Time'] == network_row['Call Start Time']) &
                    (df_Billing['Call End Time'] == network_row['Call End Time']) &
                    (df_Billing['Service Start Date'] == network_row['Service Start Date']) &
                    (df_Billing['Service End Date'] == network_row['Service End Date']) &
                    (df_Billing['Service ID'] == network_row['Service ID']) &
                    (df_Billing['Duration (Mins)'] == network_row['Duration (Mins)'])
                ]

                if matching_rows.empty:
                    metrics['data']['mismatched_records'].append(network_row.to_dict())
                    metrics['data']['mismatch_count'] += 1

                # Process mismatched records to calculate monthly mismatch trend
                mismatch_trend = defaultdict(int)
                for record in metrics['data']['mismatched_records']:
                    transaction_date = record.get('Call Start Time')
                    if pd.notna(transaction_date):  # Check if the value is not NaN
                        transaction_date = str(transaction_date)  # Convert to string if necessary
                        transaction_date = datetime.strptime(transaction_date, '%m/%d/%Y %H:%M')
                        # Format the date as "M/YYYY" for monthly grouping
                        month = f"{transaction_date.month}/{transaction_date.year}"
                        mismatch_trend[month] += 1

                # Convert mismatch trend to a list of dictionaries for the revenue_trend field
                metrics['data']['revenue_trend'] = [
                    {'date': month, 'value': count} for month, count in sorted(
                        mismatch_trend.items(),
                        key=lambda x: datetime.strptime(x[0], '%m/%Y')  # Sort by actual date
                    )
                ]

            # Update mismatch status
            metrics['data']['mismatch_status'] = "Mismatches Found" if metrics['data']['mismatch_count'] > 0 else "No Mismatches"

            # Process service mismatch records to group by Service Name, Usage Type, and Usage Sub Type
            service_mismatch_summary = defaultdict(lambda: {'count': 0, 'total_download_mb': 0.0})

            for record in metrics['data']['service_mismatched_records']:
                service_name = record.get('Service Name', 'Unknown')
                usage_type = record.get('Usage Type', 'Unknown')
                usage_sub_type = record.get('Usage Sub Type', 'Unknown')
                download_mb = float(record.get('Download (MB)', 0.0))

                # Create a unique key for grouping
                key = (service_name, usage_type, usage_sub_type)

                # Update the count and total download for the group
                service_mismatch_summary[key]['count'] += 1
                service_mismatch_summary[key]['total_download_mb'] += download_mb

            # Convert the summary to a list of dictionaries for easier consumption
            metrics['data']['service_breakdown'] = [
                {
                    'service_name': key[0],
                    'usage_type': key[1],
                    'usage_sub_type': key[2],
                    'count': value['count'],
                    'total_download_mb': value['total_download_mb']
                }
                for key, value in service_mismatch_summary.items()
            ]

            # Add named sections to records_display_card
            metrics['data']['records_display_card'] = [
                {
                    "name": "Mismatched Records",
                    "records": metrics['data']['mismatched_records']
                },
                {
                    "name": "Account Status Mismatch",
                    "records": metrics['data']['account_status_mismatched_records']
                },
                {
                    "name": "Transaction Mismatch",
                    "records": metrics['data']['transaction_mismatched_records'] + metrics['data']['transaction_date_mismatched_records']
                },
                {
                    "name": "Duration Mismatch",
                    "records": metrics['data']['duration_mismatched_records']
                },
                {
                    "name": "Transaction Date Mismatch",
                    "records": metrics['data']['transaction_date_mismatched_records']
                },
                {
                    "name": "Missing Records",
                    "records": metrics['data']['msisdn_missing_records']
                },
                {
                    "name": "Service Mismatch",
                    "records": metrics['data']['service_mismatched_records']
                }
            ]


        except Exception as e:
            print(f"An error occurred: {e}")
            metrics = None

        # Ensure all data in metrics is JSON serializable
        def convert_to_serializable(data):
            if isinstance(data, list):
                return [convert_to_serializable(item) for item in data]
            elif isinstance(data, dict):
                return {key: convert_to_serializable(value) for key, value in data.items()}
            elif isinstance(data, (np.int64, np.float64)):
                return data.item()  # Convert numpy types to Python-native types
            else:
                return data

        # Ensure all data in metrics is JSON serializable
        metrics = convert_to_serializable(metrics)
        return metrics


if __name__ == "__main__":
    metrics = ServicesModel.get_network_vs_billing_data()
    print("Metrics Output:")
    print(metrics)
