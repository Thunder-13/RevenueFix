# RevenueFix Backend API

This is the backend API for the RevenueFix application, providing endpoints for revenue analytics, billing reconciliation, and more.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

The API will be available at http://localhost:5000

## API Endpoints

- `/api/auth` - Authentication endpoints
- `/api/dashboard` - Dashboard metrics
- `/api/network-billing` - Network vs Billing data
- `/api/mediation-billing` - Mediation vs Billing data
- `/api/b2b` - B2B Analysis data
- `/api/b2c` - B2C Analysis data
- `/api/fixed-line` - Fixed Line metrics
- `/api/voice-sms-data` - Voice/SMS/Data metrics
- `/api/crm` - CRM Insights data
- `/api/alarms` - Alarm Management data
- `/api/users` - User Management
- `/api/cases` - Case Management
- `/api/settings` - Settings data
- `/api/upcoming-features` - Upcoming features

## Note

This is a demo backend with mock data. In a production environment, you would connect to actual databases and implement proper authentication.