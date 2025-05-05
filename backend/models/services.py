from models.base import BaseModel
import random
import os
from datetime import datetime, timedelta
from collections import defaultdict
import pandas as pd
import numpy as np

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
