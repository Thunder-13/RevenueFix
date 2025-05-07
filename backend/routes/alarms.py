from flask import Blueprint, jsonify, request
import pandas as pd
import os
import datetime
import uuid

alarms_bp = Blueprint('alarms', __name__)

def get_next_alarm_id():
    """Generate the next alarm ID based on existing alarms"""
    try:
        df = pd.read_csv(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv'))
        if df.empty:
            return "ALM-1001"
        
        # Extract numbers from IDs
        last_id = df['id'].iloc[-1]
        num = int(last_id.split('-')[1])
        return f"ALM-{num + 1}"
    except Exception as e:
        print(f"Error generating alarm ID: {e}")
        return f"ALM-{uuid.uuid4().hex[:6]}"

@alarms_bp.route('', methods=['GET'])
def get_alarm_data():
    """Get alarm management data"""
    try:
        # Read alarms from CSV
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        df = pd.read_csv(file_path)
        
        # Convert to list of dictionaries
        alarms = df.to_dict('records')
        
        # Get unique assigned_to values
        if 'assigned_to' in df.columns:
            assigned_to_list = df['assigned_to'].unique().tolist()
            # Remove 'Unassigned' if it exists
            if 'Unassigned' in assigned_to_list:
                assigned_to_list.remove('Unassigned')
        else:
            # Add assigned_to column if it doesn't exist
            df['assigned_to'] = 'Unassigned'
            df.to_csv(file_path, index=False)
            assigned_to_list = []
            alarms = df.to_dict('records')
        
        # Calculate summary statistics
        total_alarms = len(alarms)
        critical_alarms = len(df[df['severity'] == 'Critical'])
        major_alarms = len(df[df['severity'] == 'Major'])
        minor_alarms = len(df[df['severity'] == 'Minor'])
        
        # Count by status
        open_alarms = len(df[df['status'] == 'Open'])
        resolved_alarms = len(df[df['status'] == 'Resolved'])
        archived_alarms = len(df[df['status'] == 'Archived']) if 'Archived' in df['status'].values else 0
        deleted_alarms = len(df[df['status'] == 'Deleted']) if 'Deleted' in df['status'].values else 0
        
        # Group alarms by source for category breakdown
        alarm_by_category = df.groupby('source').size().reset_index(name='count')
        alarm_by_category.columns = ['category', 'count']
        
        return jsonify({
            'status': 'success',
            'data': {
                'summary': {
                    'total_alarms': total_alarms,
                    'critical_alarms': critical_alarms,
                    'major_alarms': major_alarms,
                    'minor_alarms': minor_alarms,
                    'open_alarms': open_alarms,
                    'resolved_alarms': resolved_alarms,
                    'archived_alarms': archived_alarms,
                    'resolved_today': resolved_alarms  # Simplified for now
                },
                'alarm_by_category': alarm_by_category.to_dict('records'),
                'recent_alarms': alarms,
                'assigned_to_list': assigned_to_list
            }
        })
    except Exception as e:
        print(f"Error fetching alarm data: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@alarms_bp.route('', methods=['POST'])
def add_alarm():
    """Add a new alarm"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['severity', 'source', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f"Missing required field: {field}"
                }), 400
        
        # Read existing alarms
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        df = pd.read_csv(file_path)
        
        # Check if assigned_to column exists, add if not
        if 'assigned_to' not in df.columns:
            df['assigned_to'] = 'Unassigned'
        
        # Create new alarm
        new_alarm = {
            'id': get_next_alarm_id(),
            'severity': data['severity'],
            'source': data['source'],
            'message': data['message'],
            'timestamp': datetime.datetime.now().isoformat(),
            'status': data.get('status', 'Open'),
            'assigned_to': data.get('assigned_to', 'Unassigned')
        }
        
        # Append new alarm to DataFrame
        df = pd.concat([df, pd.DataFrame([new_alarm])], ignore_index=True)
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        return jsonify({
            'status': 'success',
            'data': new_alarm
        })
    except Exception as e:
        print(f"Error adding alarm: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@alarms_bp.route('/<alarm_id>', methods=['PUT'])
def update_alarm(alarm_id):
    """Update an existing alarm"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['severity', 'source', 'message', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f"Missing required field: {field}"
                }), 400
        
        # Read existing alarms
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        df = pd.read_csv(file_path)
        
        # Check if assigned_to column exists, add if not
        if 'assigned_to' not in df.columns:
            df['assigned_to'] = 'Unassigned'
        
        # Find the alarm to update
        alarm_index = df[df['id'] == alarm_id].index
        if len(alarm_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Alarm with ID {alarm_id} not found"
            }), 404
        
        # Update the alarm
        df.loc[alarm_index, 'severity'] = data['severity']
        df.loc[alarm_index, 'source'] = data['source']
        df.loc[alarm_index, 'message'] = data['message']
        df.loc[alarm_index, 'status'] = data['status']
        
        # Update assigned_to if provided
        if 'assigned_to' in data:
            df.loc[alarm_index, 'assigned_to'] = data['assigned_to']
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated alarm
        updated_alarm = df.loc[alarm_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_alarm
        })
    except Exception as e:
        print(f"Error updating alarm: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@alarms_bp.route('/<alarm_id>/claim', methods=['PUT'])
def claim_alarm(alarm_id):
    """Claim an unassigned alarm"""
    try:
        data = request.get_json()
        
        if 'assigned_to' not in data:
            return jsonify({
                'status': 'error',
                'message': "Missing required field: assigned_to"
            }), 400
        
        # Read existing alarms
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        df = pd.read_csv(file_path)
        
        # Check if assigned_to column exists, add if not
        if 'assigned_to' not in df.columns:
            df['assigned_to'] = 'Unassigned'
        
        # Find the alarm to claim
        alarm_index = df[df['id'] == alarm_id].index
        if len(alarm_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Alarm with ID {alarm_id} not found"
            }), 404
        
        # Update the assigned_to field
        df.loc[alarm_index, 'assigned_to'] = data['assigned_to']
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated alarm
        updated_alarm = df.loc[alarm_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_alarm
        })
    except Exception as e:
        print(f"Error claiming alarm: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@alarms_bp.route('/<alarm_id>/archive', methods=['PUT'])
def archive_alarm(alarm_id):
    """Archive an alarm"""
    try:
        # Read existing alarms
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        df = pd.read_csv(file_path)
        
        # Find the alarm to archive
        alarm_index = df[df['id'] == alarm_id].index
        if len(alarm_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Alarm with ID {alarm_id} not found"
            }), 404
        
        # Update the status field to Archived
        df.loc[alarm_index, 'status'] = 'Archived'
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated alarm
        updated_alarm = df.loc[alarm_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_alarm
        })
    except Exception as e:
        print(f"Error archiving alarm: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@alarms_bp.route('/<alarm_id>/delete', methods=['PUT'])
def delete_alarm(alarm_id):
    """Mark an alarm as deleted (soft delete)"""
    try:
        # Read existing alarms
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'alarms.csv')
        df = pd.read_csv(file_path)
        
        # Find the alarm to delete
        alarm_index = df[df['id'] == alarm_id].index
        if len(alarm_index) == 0:
            return jsonify({
                'status': 'error',
                'message': f"Alarm with ID {alarm_id} not found"
            }), 404
        
        # Update the status field to Deleted
        df.loc[alarm_index, 'status'] = 'Deleted'
        
        # Save updated DataFrame to CSV
        df.to_csv(file_path, index=False)
        
        # Get the updated alarm
        updated_alarm = df.loc[alarm_index].to_dict('records')[0]
        
        return jsonify({
            'status': 'success',
            'data': updated_alarm
        })
    except Exception as e:
        print(f"Error deleting alarm: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500