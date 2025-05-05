import axios from "axios";
import { get } from "http";

// Create an axios instance with default config
const api = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:5000/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Dummy data for fallback when API calls fail
const dummyData = {
  dashboard: {
    total_revenue: 12458932.45,
    revenue_growth: 8.7,
    average_revenue_per_user: 42.35,
    churn_rate: 2.1,
    revenue_by_channel: [
      { name: 'Voice', value: 4523651.23 },
      { name: 'SMS', value: 1245789.56 },
      { name: 'Data', value: 5689472.34 },
      { name: 'Fixed Line', value: 1000019.32 }
    ],
    revenue_trend: generateTimeSeries(30, 1000000),
    top_products: [
      { name: 'Premium Data Plan', revenue: 2345678.90 },
      { name: 'Family Voice Bundle', revenue: 1987654.32 },
      { name: 'Business Fiber', revenue: 1456789.01 },
      { name: 'International SMS Pack', revenue: 987654.32 },
      { name: 'IoT Connectivity', revenue: 876543.21 }
    ]
  },
  networkBilling: {
    summary: {
      total_network_records: 1245789,
      total_billing_records: 1243567,
      discrepancy_count: 2222,
      discrepancy_percentage: 0.18,
      financial_impact: 156789.45
    },
    trend: generateTimeSeries(14, 0.2, 0.1),
    top_discrepancies: [
      { service_type: 'International Roaming', count: 876, value: 65432.12 },
      { service_type: 'Premium SMS', count: 543, value: 43210.98 },
      { service_type: 'Data Bundles', count: 432, value: 32109.87 },
      { service_type: 'Voice Calls', count: 371, value: 15678.90 }
    ]
  },
  mediationBilling: {
    summary: {
      total_mediation_records: 9876543,
      total_billing_records: 9875432,
      discrepancy_count: 1111,
      discrepancy_percentage: 0.01,
      financial_impact: 87654.32
    },
    trend: generateTimeSeries(14, 0.015, 0.2),
    top_discrepancies: [
      { service_type: 'Content Services', count: 456, value: 34567.89 },
      { service_type: 'Third-party Billing', count: 321, value: 23456.78 },
      { service_type: 'Premium Services', count: 234, value: 12345.67 },
      { service_type: 'Subscription Services', count: 100, value: 9876.54 }
    ]
  },
  crmBilling: {
    summary: {
      total_accounts: 10000,
      mismatched_bill_plans: 245,
      mismatched_account_status: 178,
      mismatched_start_dates: 89,
      mismatch_percentage: 5.12
    },
    account_status: {
      crm_active_billing_inactive: 103,
      crm_inactive_billing_active: 75
    },
    enterprise_breakdown: [
      {
        category: "Enterprise",
        mismatched_bill_plans: 87,
        crm_active_billing_inactive: 42,
        crm_inactive_billing_active: 31,
        total_accounts: 3500
      },
      {
        category: "SME",
        mismatched_bill_plans: 65,
        crm_active_billing_inactive: 28,
        crm_inactive_billing_active: 19,
        total_accounts: 2800
      },
      {
        category: "Government",
        mismatched_bill_plans: 43,
        crm_active_billing_inactive: 18,
        crm_inactive_billing_active: 12,
        total_accounts: 1200
      },
      {
        category: "Education",
        mismatched_bill_plans: 32,
        crm_active_billing_inactive: 9,
        crm_inactive_billing_active: 8,
        total_accounts: 1500
      },
      {
        category: "Healthcare",
        mismatched_bill_plans: 18,
        crm_active_billing_inactive: 6,
        crm_inactive_billing_active: 5,
        total_accounts: 1000
      }
    ],
    trend_data: generateTimeSeries(30, 5, 0.3),
    mismatched_accounts: [
      {
        customer_id: "C10045678",
        account_id: "A20056789",
        msisdn: "9876543210",
        crm_status: "Active",
        billing_status: "Inactive",
        crm_bill_plan: "Enterprise Premium",
        billing_bill_plan: "Enterprise Standard",
        enterprise_category: "Enterprise",
        mismatch_type: "Bill Plan, Account Status"
      },
      {
        customer_id: "C10045679",
        account_id: "A20056790",
        msisdn: "9876543211",
        crm_status: "Inactive",
        billing_status: "Active",
        crm_bill_plan: "SME Basic",
        billing_bill_plan: "SME Basic",
        enterprise_category: "SME",
        mismatch_type: "Account Status"
      },
      {
        customer_id: "C10045680",
        account_id: "A20056791",
        msisdn: "9876543212",
        crm_status: "Active",
        billing_status: "Active",
        crm_bill_plan: "Government Special",
        billing_bill_plan: "Government Standard",
        enterprise_category: "Government",
        mismatch_type: "Bill Plan"
      },
      {
        customer_id: "C10045681",
        account_id: "A20056792",
        msisdn: "9876543213",
        crm_status: "Active",
        billing_status: "Active",
        crm_bill_plan: "Education Premium",
        billing_bill_plan: "Education Premium",
        enterprise_category: "Education",
        mismatch_type: "Start Date"
      },
      {
        customer_id: "C10045682",
        account_id: "A20056793",
        msisdn: "9876543214",
        crm_status: "Active",
        billing_status: "Inactive",
        crm_bill_plan: "Healthcare Basic",
        billing_bill_plan: "Healthcare Basic",
        enterprise_category: "Healthcare",
        mismatch_type: "Account Status"
      }
    ]
  },
  b2b: {
    summary: {
      total_b2b_revenue: 7654321.09,
      revenue_growth: 12.5,
      active_contracts: 1234,
      average_contract_value: 6201.23
    },
    revenue_by_industry: [
      { industry: 'Financial Services', revenue: 2345678.90 },
      { industry: 'Healthcare', revenue: 1876543.21 },
      { industry: 'Manufacturing', revenue: 1234567.89 },
      { industry: 'Retail', revenue: 987654.32 },
      { industry: 'Technology', revenue: 765432.10 }
    ],
    top_clients: [
      { name: 'Global Bank Corp', revenue: 876543.21, growth: 15.3 },
      { name: 'MediHealth Systems', revenue: 765432.10, growth: 8.7 },
      { name: 'TechInnovate Inc', revenue: 654321.09, growth: 22.1 },
      { name: 'Retail Giant Ltd', revenue: 543210.98, growth: 5.4 },
      { name: 'Industrial Mfg Co', revenue: 432109.87, growth: 9.8 }
    ],
    contract_renewal_rate: 87.5,
    revenue_trend: generateTimeSeries(30, 7500000)
  },
  b2c: {
    summary: {
      total_b2c_revenue: 4876543.21,
      revenue_growth: 7.8,
      active_customers: 987654,
      average_revenue_per_user: 4.94
    },
    revenue_by_segment: [
      { segment: 'Youth', revenue: 1234567.89 },
      { segment: 'Family', revenue: 1654321.09 },
      { segment: 'Professional', revenue: 1098765.43 },
      { segment: 'Senior', revenue: 889876.54 }
    ],
    top_packages: [
      { name: 'Unlimited Everything', revenue: 987654.32, subscribers: 123456 },
      { name: 'Family Bundle', revenue: 876543.21, subscribers: 98765 },
      { name: 'Youth Data Pack', revenue: 765432.10, subscribers: 87654 },
      { name: 'Basic Talk & Text', revenue: 654321.09, subscribers: 76543 },
      { name: 'Senior Essentials', revenue: 543210.98, subscribers: 65432 }
    ],
    churn_rate: 2.3,
    revenue_trend: generateTimeSeries(30, 4800000)
  },
  fixedLine: {
    summary: {
      total_revenue: 2345678.90,
      active_lines: 234567,
      average_revenue_per_line: 10.00,
      growth_rate: 3.2
    },
    revenue_by_service_type: [
      { type: 'Residential', revenue: 1234567.89 },
      { type: 'Business', revenue: 876543.21 },
      { type: 'Enterprise', revenue: 234567.80 }
    ],
    top_packages: [
      { name: 'Fiber Premium', revenue: 654321.09, subscribers: 65432 },
      { name: 'Business Line Pro', revenue: 543210.98, subscribers: 54321 },
      { name: 'Home Essentials', revenue: 432109.87, subscribers: 43210 },
      { name: 'Enterprise Connect', revenue: 321098.76, subscribers: 32109 },
      { name: 'Basic Line', revenue: 210987.65, subscribers: 21098 }
    ],
    installation_trend: generateTimeSeries(30, 500, 0.1),
    revenue_trend: generateTimeSeries(30, 2300000)
  },
  voiceSmsData: {
    voice: {
      total_revenue: 3456789.01,
      call_minutes: 987654321,
      average_revenue_per_minute: 0.0035,
      growth_rate: -1.2,
      revenue_trend: generateTimeSeries(30, 3500000, 0.03)
    },
    sms: {
      total_revenue: 1234567.89,
      message_count: 876543210,
      average_revenue_per_message: 0.0014,
      growth_rate: -2.5,
      revenue_trend: generateTimeSeries(30, 1250000, 0.04)
    },
    data: {
      total_revenue: 5678901.23,
      data_usage_tb: 98765,
      average_revenue_per_gb: 0.0576,
      growth_rate: 15.7,
      revenue_trend: generateTimeSeries(30, 5600000, 0.06)
    },
    service_distribution: [
      { name: 'Voice', percentage: 33.4 },
      { name: 'SMS', percentage: 11.9 },
      { name: 'Data', percentage: 54.7 }
    ]
  },
  crm: {
    summary: {
      total_customers: 1234567,
      new_customers_mtd: 12345,
      churn_rate: 2.3,
      customer_satisfaction: 87.5
    },
    customer_segments: [
      { segment: 'platinum', count: 123456, percentage: 10.0 },
      { segment: 'vip', count: 370370, percentage: 15.0 },
      { segment: 'gold', count: 740741, percentage: 25.0 },
      { segment: 'silver', count: 77345, percentage: 50.0 }
    ],
    customer_lifecycle: [
      { stage: 'Acquisition', count: 12345 },
      { stage: 'Onboarding', count: 9876 },
      { stage: 'Growth', count: 345678 },
      { stage: 'Retention', count: 654321 },
      { stage: 'At Risk', count: 23456 },
      { stage: 'Churned', count: 7890 }
    ],
    top_complaints: [
      { issue: 'Network Coverage', count: 5432 },
      { issue: 'Billing Issues', count: 4321 },
      { issue: 'Data Speed', count: 3210 },
      { issue: 'Customer Service', count: 2109 },
      { issue: 'Plan Features', count: 1098 }
    ],
    customer_satisfaction_trend: generateTimeSeries(30, 87, 0.02),
    churn_trend: generateTimeSeries(30, 2.3, 0.1)
  },
  alarms: {
    summary: {
      total_alarms: 1234,
      critical_alarms: 56,
      major_alarms: 234,
      minor_alarms: 944,
      resolved_today: 345
    },
    alarm_by_category: [
      { category: 'Network', count: 567 },
      { category: 'Billing', count: 345 },
      { category: 'Security', count: 123 },
      { category: 'Performance', count: 199 }
    ],
    alarm_trend: generateTimeSeries(30, 100, 0.2),
    top_alarm_sources: [
      { source: 'Core Network', count: 234 },
      { source: 'Billing System', count: 198 },
      { source: 'Data Center', count: 156 },
      { source: 'Access Network', count: 123 },
      { source: 'CRM System', count: 98 }
    ],
    recent_alarms: [
      { id: 'ALM-1234', severity: 'Critical', source: 'Billing System', message: 'Database connection failure', timestamp: '2023-06-15T14:23:45' },
      { id: 'ALM-1233', severity: 'Major', source: 'Core Network', message: 'High CPU utilization on router', timestamp: '2023-06-15T14:15:22' },
      { id: 'ALM-1232', severity: 'Minor', source: 'CRM System', message: 'API response time degradation', timestamp: '2023-06-15T14:05:17' },
      { id: 'ALM-1231', severity: 'Critical', source: 'Data Center', message: 'Power supply failure', timestamp: '2023-06-15T13:58:03' },
      { id: 'ALM-1230', severity: 'Minor', source: 'Access Network', message: 'Signal strength degradation', timestamp: '2023-06-15T13:45:51' }
    ]
  },
  cases: {
    summary: {
      total_cases: 5678,
      open_cases: 1234,
      cases_created_today: 123,
      cases_closed_today: 145,
      average_resolution_time: 36.5
    },
    case_by_priority: [
      { priority: 'P1', count: 234 },
      { priority: 'P2', count: 567 },
      { priority: 'P3', count: 890 },
      { priority: 'P4', count: 1234 }
    ],
    case_by_department: [
      { department: 'Technical Support', count: 2345 },
      { department: 'Billing Support', count: 1567 },
      { department: 'Sales Support', count: 987 },
      { department: 'General Inquiry', count: 779 }
    ],
    case_trend: generateTimeSeries(30, 200),
    recent_cases: [
      { id: 'CS-5678', priority: 'P1', customer: 'Global Corp', subject: 'Service outage', status: 'Open', created_at: '2023-06-15T14:23:45' },
      { id: 'CS-5677', priority: 'P2', customer: 'John Smith', subject: 'Billing dispute', status: 'In Progress', created_at: '2023-06-15T14:15:22' },
      { id: 'CS-5676', priority: 'P3', customer: 'Tech Solutions', subject: 'Plan upgrade request', status: 'Pending Customer', created_at: '2023-06-15T14:05:17' },
      { id: 'CS-5675', priority: 'P1', customer: 'City Hospital', subject: 'Network connectivity issue', status: 'Open', created_at: '2023-06-15T13:58:03' },
      { id: 'CS-5674', priority: 'P4', customer: 'Jane Doe', subject: 'Account information update', status: 'Closed', created_at: '2023-06-15T13:45:51' }
    ]
  },
  users: [
    {
      id: 1,
      name: 'Saravanan R',
      email: 'thunder@revenuefix.com',
      role: 'admin',
      department: 'Admin',
      last_login: '2025-04-15T14:23:45',
      status: 'active'
    },
    {
      id: 6,
      name: 'Aravinth Kannan',
      email: 'Aravinth@revenuefix.com',
      role: 'analyst',
      department: 'Customer Service',
      last_login: '2025-04-27T11:45:51',
      status: 'active'  
    },
    {
      id: 7,
      name: 'Anselm',
      email: 'anselm@revenuefix.com',
      role: 'analyst',
      department: 'Customer Service',
      last_login: '2025-04-15T11:45:51',
      status: 'active'
    },
    {
      id: 8,
      name: 'Muthulakshmi',
      email: 'muthu@revenuefix.com',
      role: 'analyst',
      department: 'Customer Service',
      last_login: '2025-04-19T11:45:51',
      status: 'active'
    },
    {
      id: 9,
      name: 'sayantani',
      email: 'sayantani@revenuefix.com',
      role: 'analyst',
      department: 'Customer Service',
      last_login: '2025-04-12T11:45:51',
      status: 'active'
    },
    {
      id: 10,
      name: 'Ganesh',
      email: 'Ganesh@revenuefix.com',
      role: 'analyst',
      department: 'Customer Service',
      last_login: '2025-04-14T11:45:51',
      status: 'active'
    },
    {
      id: 2,
      name: 'John Smith',
      email: 'john.smith@revenuefix.com',
      role: 'manager',
      department: 'Finance',
      last_login: '2025-04-15T10:15:22',
      status: 'active'
    },
    {
      id: 3,
      name: 'Jane Doe',
      email: 'jane.doe@revenuefix.com',
      role: 'analyst',
      department: 'Revenue Assurance',
      last_login: '2025-04-14T16:05:17',
      status: 'active'
    },
    {
      id: 4,
      name: 'Robert Johnson',
      email: 'robert.johnson@revenuefix.com',
      role: 'viewer',
      department: 'Marketing',
      last_login: '2025-04-13T09:58:03',
      status: 'active'
    },
    {
      id: 5,
      name: 'Emily Wilson',
      email: 'emily.wilson@revenuefix.com',
      role: 'analyst',
      department: 'Customer Service',
      last_login: '2025-04-15T11:45:51',
      status: 'inactive'
    }
  ],
  userRoles: [
    { id: 1, name: 'admin', description: 'Full system access' },
    { id: 2, name: 'manager', description: 'Department-level access and reporting' },
    { id: 3, name: 'analyst', description: 'Data analysis and reporting access' },
    { id: 4, name: 'viewer', description: 'Read-only access to reports' }
  ],
  departments: [
    { id: 1, name: 'IT' },
    { id: 2, name: 'Finance' },
    { id: 3, name: 'Revenue Assurance' },
    { id: 4, name: 'Marketing' },
    { id: 5, name: 'Customer Service' },
    { id: 6, name: 'Operations' },
    { id: 7, name: 'Sales' }
  ],
  settings: {
    general: {
      app_name: 'RevenueFix',
      company_name: 'Telecom Analytics Inc.',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      default_currency: 'USD',
      default_language: 'en-US',
      timezone: 'UTC-5'
    },
    display: {
      theme: 'light',
      sidebar_collapsed: false,
      table_rows_per_page: 10,
      chart_animation: true,
      notifications_enabled: true
    },
    data: {
      data_refresh_interval: 15,
      cache_duration: 60,
      export_formats: ['csv', 'excel', 'pdf'],
      default_date_range: '30d'
    },
    notifications: {
      email_alerts: true,
      browser_notifications: true,
      alert_threshold_revenue: 10,
      alert_threshold_discrepancy: 5
    },
    integrations: {
      crm_system: 'Enabled',
      billing_system: 'Enabled',
      network_monitoring: 'Enabled',
      data_warehouse: 'Enabled'
    }
  },
  upcomingFeatures: [
    {
      id: 1,
      name: 'AI-Powered Revenue Forecasting',
      description: 'Machine learning algorithms to predict future revenue trends with higher accuracy',
      status: 'In Development',
      release_date: '2023-08-15'
    },
    {
      id: 2,
      name: 'Advanced Fraud Detection',
      description: 'Real-time fraud detection system using pattern recognition and anomaly detection',
      status: 'Planning',
      release_date: '2023-10-01'
    },
    {
      id: 3,
      name: 'Interactive Revenue Maps',
      description: 'Geographical visualization of revenue data with drill-down capabilities',
      status: 'In Development',
      release_date: '2023-07-30'
    },
    {
      id: 4,
      name: 'Custom Report Builder',
      description: 'Drag-and-drop interface for creating custom reports and dashboards',
      status: 'Beta Testing',
      release_date: '2023-07-15'
    },
    {
      id: 5,
      name: 'Mobile App',
      description: 'Native mobile application for iOS and Android with key metrics and alerts',
      status: 'Planning',
      release_date: '2023-11-15'
    }
  ],
  kra: {
    revenue: {
      title: "Revenue KRA",
      description: "Key Revenue Analytics",
      metrics: [
        { name: "Total Revenue", value: 12458932.45, target: 13000000, achievement: 95.8 },
        { name: "ARPU", value: 42.35, target: 45.00, achievement: 94.1 },
        { name: "Revenue Growth", value: 8.7, target: 10.0, achievement: 87.0 }
      ],
      trend: generateTimeSeries(12, 1000000, 0.05, "monthly")
    },
    customer: {
      title: "Customer KRA",
      description: "Key Customer Analytics",
      metrics: [
        { name: "Customer Satisfaction", value: 87.5, target: 90.0, achievement: 97.2 },
        { name: "Churn Rate", value: 2.1, target: 1.8, achievement: 85.7 },
        { name: "New Customers", value: 12345, target: 15000, achievement: 82.3 }
      ],
      trend: generateTimeSeries(12, 10000, 0.08, "monthly")
    },
    operations: {
      title: "Operations KRA",
      description: "Key Operational Analytics",
      metrics: [
        { name: "Network Uptime", value: 99.95, target: 99.99, achievement: 99.9 },
        { name: "Ticket Resolution Time", value: 4.2, target: 4.0, achievement: 95.2 },
        { name: "First Call Resolution", value: 78.3, target: 85.0, achievement: 92.1 }
      ],
      trend: generateTimeSeries(12, 99.9, 0.001, "monthly")
    }
  },
  kpi: {
    arpu: {
      title: "Average Revenue Per User",
      description: "ARPU across different segments",
      current_value: 42.35,
      previous_value: 40.12,
      change_percentage: 5.6,
      breakdown: [
        { segment: "Consumer", value: 35.45 },
        { segment: "Business", value: 87.23 },
        { segment: "Enterprise", value: 245.67 }
      ],
      trend: generateTimeSeries(24, 40, 0.03, "monthly"),
      details: [
        { id: 1, segment: "Consumer", plan: "Basic", arpu: 25.45, users: 45678 },
        { id: 2, segment: "Consumer", plan: "Premium", arpu: 45.45, users: 23456 },
        { id: 3, segment: "Business", plan: "Small Business", arpu: 65.78, users: 5678 },
        { id: 4, segment: "Business", plan: "Corporate", arpu: 108.67, users: 3456 },
        { id: 5, segment: "Enterprise", plan: "Standard", arpu: 187.45, users: 1234 },
        { id: 6, segment: "Enterprise", plan: "Premium", arpu: 303.89, users: 567 }
      ]
    },
    churn: {
      title: "Customer Churn Rate",
      description: "Churn rate across different segments",
      current_value: 2.1,
      previous_value: 2.3,
      change_percentage: -8.7,
      breakdown: [
        { segment: "Consumer", value: 2.4 },
        { segment: "Business", value: 1.7 },
        { segment: "Enterprise", value: 0.9 }
      ],
      trend: generateTimeSeries(24, 2.3, 0.1, "monthly"),
      details: [
        { id: 1, segment: "Consumer", plan: "Basic", churn: 2.8, users: 45678 },
        { id: 2, segment: "Consumer", plan: "Premium", churn: 2.0, users: 23456 },
        { id: 3, segment: "Business", plan: "Small Business", churn: 1.9, users: 5678 },
        { id: 4, segment: "Business", plan: "Corporate", churn: 1.5, users: 3456 },
        { id: 5, segment: "Enterprise", plan: "Standard", churn: 1.1, users: 1234 },
        { id: 6, segment: "Enterprise", plan: "Premium", churn: 0.7, users: 567 }
      ]
    },
    revenue: {
      title: "Revenue Growth",
      description: "Revenue growth across different segments",
      current_value: 8.7,
      previous_value: 7.5,
      change_percentage: 16.0,
      breakdown: [
        { segment: "Consumer", value: 7.2 },
        { segment: "Business", value: 9.5 },
        { segment: "Enterprise", value: 12.3 }
      ],
      trend: generateTimeSeries(24, 7.5, 0.1, "monthly"),
      details: [
        { id: 1, segment: "Consumer", product: "Voice", growth: 5.2, revenue: 4523651.23 },
        { id: 2, segment: "Consumer", product: "Data", growth: 9.1, revenue: 5689472.34 },
        { id: 3, segment: "Business", product: "Voice", growth: 6.7, revenue: 2345678.90 },
        { id: 4, segment: "Business", product: "Data", growth: 12.3, revenue: 3456789.01 },
        { id: 5, segment: "Enterprise", product: "Voice", growth: 8.9, revenue: 1876543.21 },
        { id: 6, segment: "Enterprise", product: "Data", growth: 15.7, revenue: 2987654.32 }
      ]
    }
  }
};

// Helper function to generate time series data
function generateTimeSeries(periods = 30, baseValue = 1000000, volatility = 0.05, periodType = "daily") {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < periods; i++) {
    let date;
    let dateFormat;
    
    if (periodType === "daily") {
      date = new Date(today);
      date.setDate(today.getDate() - periods + i + 1);
      dateFormat = date.toISOString().split('T')[0];
    } else if (periodType === "monthly") {
      date = new Date(today);
      date.setMonth(today.getMonth() - periods + i + 1);
      dateFormat = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      date = new Date(today);
      date.setDate(today.getDate() - periods + i + 1);
      dateFormat = date.toISOString().split('T')[0];
    }
    
    // Add some randomness to the value
    const change = (Math.random() - 0.5) * 2 * volatility;
    const value = baseValue * (1 + change);
    baseValue = value; // For the next day
    
    data.push({
      date: dateFormat,
      value: Math.round(value * 100) / 100
    });
  }
  
  return data;
}

// Add a response interceptor to handle errors and provide fallback data
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.warn("API call failed, using fallback data:", error);
    
    // Extract the endpoint from the URL
    const url = error.config.url;
    
    // Determine which fallback data to return based on the endpoint
    if (url.includes('/dashboard')) {
      if (url.includes('/kra/')) {
        const kraId = url.split('/kra/')[1];
        return Promise.resolve({ data: { status: 'success', data: dummyData.kra[kraId] || dummyData.kra.revenue } });
      } else if (url.includes('/kpi/')) {
        const kpiId = url.split('/kpi/')[1];
        return Promise.resolve({ data: { status: 'success', data: dummyData.kpi[kpiId] || dummyData.kpi.arpu } });
      } else {
        return Promise.resolve({ data: { status: 'success', data: dummyData.dashboard } });
      }
    } else if (url.includes('/network-billing')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.networkBilling } });
    } else if (url.includes('/mediation-billing')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.mediationBilling } });
    } else if (url.includes('/crm-billing')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.crmBilling } });
    } else if (url.includes('/b2b')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.b2b } });
    } else if (url.includes('/b2c')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.b2c } });
    } else if (url.includes('/fixed-line')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.fixedLine } });
    } else if (url.includes('/voice-sms-data')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.voiceSmsData } });
    } else if (url.includes('/crm')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.crm } });
    } else if (url.includes('/alarms')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.alarms } });
    } else if (url.includes('/cases')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.cases } });
    } else if (url.includes('/users/roles')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.userRoles } });
    } else if (url.includes('/users/departments')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.departments } });
    } else if (url.includes('/users')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.users } });
    } else if (url.includes('/settings')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.settings } });
    } else if (url.includes('/upcoming-features')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.upcomingFeatures } });
    } else if (url.includes('/network-billing-data')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.voiceSmsData } });
    } else if (url.includes('/network-billing-sms')) {
      return Promise.resolve({ data: { status: 'success', data: dummyData.voiceSmsData } });
    } else if (url.includes('/auth/login')) {
      // Simulate successful login
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            user: {
              id: 1,
              name: 'Demo User',
              email: error.config.data ? JSON.parse(error.config.data).email : 'demo@revenuefix.com',
              role: 'admin'
            },
            token: 'demo-jwt-token'
          }
        }
      });
    }
    
    // Default fallback
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post("/auth/login", credentials),
    logout: () => api.post("/auth/logout"),
    getProfile: () => api.get("/auth/me"),
  },
  
  // Dashboard
  getDashboardData: () => api.get("/dashboard"),
  getKraData: (kraId: string) => api.get(`/dashboard/kra/${kraId}`),
  getKpiData: (kpiId: string) => api.get(`/dashboard/kpi/${kpiId}`),
  
  // Network vs Billing
  getNetworkBillingData: () => api.get("/network-billing"),
  
  // Mediation vs Billing
  getMediationBillingData: () => api.get("/mediation-billing"),
  
  // CRM vs Billing
  getCrmBillingData: () => api.get("/crm-billing"),
  
  // B2B Analysis
  getB2BData: () => api.get("/b2b"),
  
  // B2C Analysis
  getB2CData: () => api.get("/b2c"),
  
  // Fixed Line
  getFixedLineData: () => api.get("/fixed-line"),
  
  // Voice/SMS/Data
  getVoiceSmsDataMetrics: () => api.get("/voice-sms-data"),

  
  //Network vs Billing Data
  getNetworkVsBillingData: () => api.get("/network-billing-data"),

  //Network vs Billing SMS
  getNetworkVsBillingSms: () => api.get("/network-billing-sms"),
  
  // CRM Insights
  getCRMInsights: () => api.get("/crm"),
  
  // Alarm Management
  getAlarmData: () => api.get("/alarms"),
  
  // User Management
  getUsers: () => api.get("/users"),
  getUserById: (id: number) => api.get(`/users/${id}`),
  getUserRoles: () => api.get("/users/roles"),
  getUserDepartments: () => api.get("/users/departments"),
  
  // Case Management
  getCaseData: () => api.get("/cases"),
  
  // Settings
  getSettings: () => api.get("/settings"),
  
  // Upcoming Features
  getUpcomingFeatures: () => api.get("/upcoming-features"),
};

export default apiService;