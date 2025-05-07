from flask import Blueprint, jsonify, request
import pandas as pd
import os
import datetime
import uuid

cases_bp = Blueprint('cases', __name__)

def get_next_case_id():
    """Generate the next case ID based on existing cases"""
    try:
        df = pd.read_csv(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv'))
        if df.empty:
            return "CS-1001"
        
        # Extract numbers from IDs
        last_id = df['id'].iloc[-1]
        num = int(last_id.split('-')[1])
        return f"CS-{num + 1}"
    except Exception as e:
        print(f"Error generating case ID: {e}")
        return f"CS-{uuid.uuid4().hex[:6]}"

@cases_bp.route('', methods=['GET'])
def get_case_data():
    """Get case management data"""
    try:
        # Read cases from CSV
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        df = pd.read_csv(file_path)
        
        # Convert to list of dictionaries
        cases = df.to_dict('records')
        
        # Get unique assigned_to values
        assigned_to_list = df['assigned_to'].unique().tolist()
        # Remove 'Unassigned' if it exists
        if 'Unassigned' in assigned_to_list:
            assigned_to_list.remove('Unassigned')
        
        # Calculate summary statistics
        total_cases = len(cases)
        open_cases = len(df[df['status'] == 'Open'])
        resolved_cases = len(df[df['status'] == 'Resolved'])
        archived_cases = len(df[df['status'] == 'Archived'])
        deleted_cases = len(df[df['status'] == 'Deleted'])
        
        # Count cases created today
        today = datetime.datetime.now().strftime('%Y-%m-%d')
        cases_created_today = len(df[df['created_at'].str.startswith(today)])
        
        # Count cases closed today
        cases_closed_today = len(df[(df['status'] == 'Resolved') & (df['created_at'].str.startswith(today))])
        
        # Group cases by priority
        case_by_priority = df.groupby('priority').size().reset_index(name='count')
        case_by_priority.columns = ['priority', 'count']
        
        # Group cases by status (as department)
        case_by_department = df.groupby('status').size().reset_index(name='count')
        case_by_department.columns = ['department', 'count']
        
        return jsonify({
            'status': 'success',
            'data': {
                'summary': {
                    'total_cases': total_cases,
                    'open_cases': open_cases,
                    'resolved_cases': resolved_cases,
                    'archived_cases': archived_cases,
                    'deleted_cases': deleted_cases,
                    'cases_created_today': cases_created_today,
                    'cases_closed_today': cases_closed_today,
                    'average_resolution_time': 24.5  # Placeholder value
                },
                'case_by_priority': case_by_priority.to_dict('records'),
                'case_by_department': case_by_department.to_dict('records'),
                'recent_cases': cases,
                'assigned_to_list': assigned_to_list
            }
        })
    except Exception as e:
        print(f"Error fetching case data: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@cases_bp.route('', methods=['POST'])
def add_case():
    """Add a new case"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['priority', 'customer', 'subject', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f"Missing required field: {field}"
                }), 400
        
        # Read existing cases
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        df = pd.read_csv(file_path)
        
        # Create new case
        new_case = {
            'id': get_next_case_id(),
            'priority': data['priority'],
            'customer': data['customer'],
            'subject': data['subject'],
            'status': data.get('status', 'Open'),
            'created_at': datetime.datetime.now().isoformat(),
            'assigned_to': data.get('assigned_to', 'Unassigned'),
            'description': data['description']
        }
        
        # Append new case to DataFrame
        df = pd.concat([df, pd.DataFrame([new_case])], ignore_index=True)
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        return jsonify({
            'status': 'success',
            'data': new_case
        })
    except Exception as e:
        print(f"Error adding case: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@cases_bp.route('/<case_id>', methods=['PUT'])
def update_case(case_id):
    """Update an existing case"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['priority', 'customer', 'subject', 'status', 'assigned_to', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f"Missing required field: {field}"
                }), 400
        
        # Read existing cases
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        df = pd.read_csv(file_path)
        
        # Find the case to update
        case_index = df[df['id'] == case_id].index
        if len(case_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Case with ID {case_id} not found"
            }), 404
        
        # Update the case
        df.loc[case_index, 'priority'] = data['priority']
        df.loc[case_index, 'customer'] = data['customer']
        df.loc[case_index, 'subject'] = data['subject']
        df.loc[case_index, 'status'] = data['status']
        df.loc[case_index, 'assigned_to'] = data['assigned_to']
        df.loc[case_index, 'description'] = data['description']
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated case
        updated_case = df.loc[case_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_case
        })
    except Exception as e:
        print(f"Error updating case: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@cases_bp.route('/<case_id>/claim', methods=['PUT'])
def claim_case(case_id):
    """Claim an unassigned case"""
    try:
        data = request.get_json()
        
        if 'assigned_to' not in data:
            return jsonify({
                'status': 'error',
                'message': "Missing required field: assigned_to"
            }), 400
        
        # Read existing cases
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        df = pd.read_csv(file_path)
        
        # Find the case to claim
        case_index = df[df['id'] == case_id].index
        if len(case_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Case with ID {case_id} not found"
            }), 404
        
        # Update the assigned_to field
        df.loc[case_index, 'assigned_to'] = data['assigned_to']
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated case
        updated_case = df.loc[case_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_case
        })
    except Exception as e:
        print(f"Error claiming case: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@cases_bp.route('/<case_id>/archive', methods=['PUT'])
def archive_case(case_id):
    """Archive a case"""
    try:
        # Read existing cases
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        df = pd.read_csv(file_path)
        
        # Find the case to archive
        case_index = df[df['id'] == case_id].index
        if len(case_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Case with ID {case_id} not found"
            }), 404
        
        # Update the status field to Archived
        df.loc[case_index, 'status'] = 'Archived'
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated case
        updated_case = df.loc[case_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_case
        })
    except Exception as e:
        print(f"Error archiving case: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@cases_bp.route('/<case_id>/delete', methods=['PUT'])
def delete_case(case_id):
    """Mark a case as deleted (soft delete)"""
    try:
        # Read existing cases
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'cases.csv')
        df = pd.read_csv(file_path)
        
        # Find the case to delete
        case_index = df[df['id'] == case_id].index
        if len(case_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Case with ID {case_id} not found"
            }), 404
        
        # Update the status field to Deleted
        df.loc[case_index, 'status'] = 'Deleted'
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated case
        updated_case = df.loc[case_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_case
        })
    except Exception as e:
        print(f"Error deleting case: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500