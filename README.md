# RevenueFix - Telecom Revenue Analytics Platform

RevenueFix is a comprehensive revenue analytics and billing reconciliation platform for telecom companies. It provides insights into revenue streams, billing discrepancies, customer analytics, and operational metrics.

## Features

- Interactive dashboard with key revenue metrics
- Network vs Billing reconciliation
- Mediation vs Billing reconciliation
- B2B and B2C revenue analysis
- Fixed Line, Voice, SMS, and Data service analytics
- CRM insights and customer segmentation
- Alarm management system
- Case management system
- User management
- Upcoming features roadmap
- Comprehensive settings

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- Recharts for data visualization
- Axios for API requests

### Backend
- Python with Flask
- RESTful API architecture
- Mock data models (can be replaced with real database connections)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```
   python app.py
   ```

The backend API will be available at http://localhost:5000

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

The frontend application will be available at http://localhost:5173

## Usage

1. Open your browser and navigate to http://localhost:5173
2. Sign in with the following credentials:
   - Email: demo@revenuefix.com
   - Password: password
3. Explore the various features through the sidebar navigation

## Development

### Adding New Features

1. Create new API endpoints in the backend by adding routes in the `routes` directory
2. Implement corresponding data models in the `models` directory
3. Create new React components in the frontend `src/components` directory
4. Add new pages in the `src/pages` directory
5. Update the router in `src/main.tsx` to include new routes
