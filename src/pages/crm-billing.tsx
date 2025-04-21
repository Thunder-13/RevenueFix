import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { AlertTriangle, CheckCircle, Database, FileCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";

interface CrmBillingData {
  summary: {
    total_accounts: number;
    mismatched_bill_plans: number;
    mismatched_account_status: number;
    mismatched_start_dates: number;
    duplicate_records: number;
    mismatch_percentage: number;
  };
  account_status: {
    crm_active_billing_inactive: number;
    crm_inactive_billing_active: number;
  };
  enterprise_breakdown: {
    category: string;
    mismatched_bill_plans: number;
    crm_active_billing_inactive: number;
    crm_inactive_billing_active: number;
    total_accounts: number;
  }[];
  trend_data: {
    date: string;
    value: number;
  }[];
  mismatched_accounts: {
    customer_id: string;
    account_id: string;
    msisdn: string;
    crm_status: string;
    billing_status: string;
    crm_bill_plan: string;
    billing_bill_plan: string;
    enterprise_category: string;
    mismatch_type: string;
  }[];
  mismatch_visualization: {
    name: string;
    value: number;
  }[];
}

const CrmBilling = () => {
  const [data, setData] = useState<CrmBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [visualizationType, setVisualizationType] = useState<"pie" | "bar" | "line" | "area">("pie");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // This endpoint would be created in the backend
        const response = await apiService.getCrmBillingData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching CRM vs Billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load CRM vs Billing data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading CRM vs Billing data..." />
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    return status.toLowerCase() === "active" || status.toLowerCase() === "act" ? (
      <Badge className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="outline" className="border-red-500 text-red-500">Inactive</Badge>
    );
  };

  const COLORS = ['#7e3af2', '#3f83f8', '#0e9f6e', '#ff5a1f', '#9061f9'];

  const renderVisualization = () => {
    if (!data?.mismatch_visualization) return null;

    switch (visualizationType) {
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.mismatch_visualization}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                animationDuration={1500}
              >
                {data.mismatch_visualization.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: '#7e3af2',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.mismatch_visualization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: '#7e3af2',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#7e3af2" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.mismatch_visualization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: '#7e3af2',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#7e3af2" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.mismatch_visualization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderColor: '#7e3af2',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7e3af2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#7e3af2" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#7e3af2" fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-3xl font-bold">CRM vs Billing</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total Accounts"
                value={data?.summary.total_accounts || 0}
                description={`Including ${data?.summary.duplicate_records || 0} duplicates`}
                icon={<Database className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Mismatched Bill Plans"
                value={data?.summary.mismatched_bill_plans || 0}
                description="bill plan discrepancies"
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Status Mismatches"
                value={data?.summary.mismatched_account_status || 0}
                description="account status discrepancies"
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Start Date Mismatches"
                value={data?.summary.mismatched_start_dates || 0}
                description="start date discrepancies"
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Overall Reconciliation Status */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Overall Reconciliation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Account Reconciliation Status
                      </span>
                      <span className="text-sm font-medium">
                        {100 - (data?.summary.mismatch_percentage || 0)}% Matched
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${100 - (data?.summary.mismatch_percentage || 0)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Matched Accounts</p>
                          <p className="text-sm text-muted-foreground">
                            Accounts with consistent data
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">
                        {data?.summary.total_accounts -
                          (data?.summary.mismatched_bill_plans || 0) -
                          (data?.summary.mismatched_account_status || 0) -
                          (data?.summary.mismatched_start_dates || 0) -
                          (data?.summary.duplicate_records || 0)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Mismatched Accounts</p>
                          <p className="text-sm text-muted-foreground">
                            Accounts with data discrepancies
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">
                        {(data?.summary.mismatched_bill_plans || 0) +
                          (data?.summary.mismatched_account_status || 0) +
                          (data?.summary.mismatched_start_dates || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mismatch Visualization */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Billing vs CRM Mismatches</CardTitle>
                <div className="flex gap-2">
                  {/* Fix: Wrap TabsList in a Tabs component */}
                  <Tabs value={visualizationType} onValueChange={(value) => setVisualizationType(value as any)}>
                    <TabsList>
                      <TabsTrigger value="pie">Pie</TabsTrigger>
                      <TabsTrigger value="bar">Bar</TabsTrigger>
                      <TabsTrigger value="line">Line</TabsTrigger>
                      <TabsTrigger value="area">Area</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {renderVisualization()}
              </CardContent>
            </Card>

            {/* Account Status Mismatches */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Status Mismatches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">CRM Active, Billing Inactive</p>
                      </div>
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        {data?.account_status.crm_active_billing_inactive || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">CRM Inactive, Billing Active</p>
                      </div>
                      <Badge variant="outline" className="border-red-500 text-red-500">
                        {data?.account_status.crm_inactive_billing_active || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <RevenueChart
                title="Mismatch Trend"
                data={data?.trend_data || []}
                valueSuffix="%"
                description="Daily mismatch percentage over time"
              />
            </div>

            {/* Enterprise Breakdown */}
            <div className="mb-8">
              <DataTable
                title="Enterprise Category Breakdown"
                columns={[
                  { key: "category", header: "Enterprise Category" },
                  { key: "mismatched_bill_plans", header: "Mismatched Bill Plans" },
                  { key: "crm_active_billing_inactive", header: "CRM Active, Billing Inactive" },
                  { key: "crm_inactive_billing_active", header: "CRM Inactive, Billing Active" },
                  { key: "total_accounts", header: "Total Accounts" },
                ]}
                data={data?.enterprise_breakdown || []}
              />
            </div>

            {/* Mismatched Accounts */}
            <div className="mb-8">
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Mismatches</TabsTrigger>
                  <TabsTrigger value="bill_plan">Bill Plan</TabsTrigger>
                  <TabsTrigger value="account_status">Account Status</TabsTrigger>
                  <TabsTrigger value="start_date">Start Date</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <DataTable
                    title="All Mismatched Accounts"
                    columns={[
                      { key: "customer_id", header: "Customer ID" },
                      { key: "account_id", header: "Account ID" },
                      { key: "msisdn", header: "MSISDN" },
                      { 
                        key: "crm_status", 
                        header: "CRM Status",
                        formatter: (value) => getStatusBadge(value)
                      },
                      { 
                        key: "billing_status", 
                        header: "Billing Status",
                        formatter: (value) => getStatusBadge(value)
                      },
                      { key: "enterprise_category", header: "Enterprise Category" },
                      { key: "mismatch_type", header: "Mismatch Type" },
                    ]}
                    data={data?.mismatched_accounts || []}
                  />
                </TabsContent>
                <TabsContent value="bill_plan">
                  <DataTable
                    title="Bill Plan Mismatches"
                    columns={[
                      { key: "customer_id", header: "Customer ID" },
                      { key: "account_id", header: "Account ID" },
                      { key: "msisdn", header: "MSISDN" },
                      { key: "crm_bill_plan", header: "CRM Bill Plan" },
                      { key: "billing_bill_plan", header: "Billing Bill Plan" },
                      { key: "enterprise_category", header: "Enterprise Category" },
                    ]}
                    data={(data?.mismatched_accounts || []).filter(
                      (account) => account.mismatch_type.includes("Bill Plan")
                    )}
                  />
                </TabsContent>
                <TabsContent value="account_status">
                  <DataTable
                    title="Account Status Mismatches"
                    columns={[
                      { key: "customer_id", header: "Customer ID" },
                      { key: "account_id", header: "Account ID" },
                      { key: "msisdn", header: "MSISDN" },
                      { 
                        key: "crm_status", 
                        header: "CRM Status",
                        formatter: (value) => getStatusBadge(value)
                      },
                      { 
                        key: "billing_status", 
                        header: "Billing Status",
                        formatter: (value) => getStatusBadge(value)
                      },
                      { key: "enterprise_category", header: "Enterprise Category" },
                    ]}
                    data={(data?.mismatched_accounts || []).filter(
                      (account) => account.mismatch_type.includes("Account Status")
                    )}
                  />
                </TabsContent>
                <TabsContent value="start_date">
                  <DataTable
                    title="Start Date Mismatches"
                    columns={[
                      { key: "customer_id", header: "Customer ID" },
                      { key: "account_id", header: "Account ID" },
                      { key: "msisdn", header: "MSISDN" },
                      { key: "enterprise_category", header: "Enterprise Category" },
                    ]}
                    data={(data?.mismatched_accounts || []).filter(
                      (account) => account.mismatch_type.includes("Start Date")
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CrmBilling;