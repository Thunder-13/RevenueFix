import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { BarChart3, TrendingUp, Users, ArrowDownRight, PieChart, Layers, Target, Activity } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KraDialog } from "@/components/dashboard/KraDialog";
import { KpiDialog } from "@/components/dashboard/KpiDialog";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface DashboardData {
  total_revenue: number;
  revenue_growth: number;
  average_revenue_per_user: number;
  churn_rate: number;
  revenue_by_channel: Array<{ name: string; value: number }>;
  revenue_trend: Array<{ date: string; value: number }>;
  top_products: Array<{ name: string; revenue: number }>;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("revenue");
  const [kraDialogOpen, setKraDialogOpen] = useState(false);
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [selectedKra, setSelectedKra] = useState<string | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);
  const [kraData, setKraData] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getDashboardData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleKraClick = async (kraId: string) => {
    setSelectedKra(kraId);
    setLoading(true);
    
    try {
      const response = await apiService.getKraData(kraId);
      setKraData(response.data.data);
      setKraDialogOpen(true);
    } catch (error) {
      console.error(`Error fetching KRA data for ${kraId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load ${kraId} KRA data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKpiClick = async (kpiId: string) => {
    setSelectedKpi(kpiId);
    setLoading(true);
    
    try {
      const response = await apiService.getKpiData(kpiId);
      setKpiData(response.data.data);
      setKpiDialogOpen(true);
    } catch (error) {
      console.error(`Error fetching KPI data for ${kpiId}:`, error);
      toast({
        title: "Error",
        description: `Failed to load ${kpiId} KPI data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMetricClick = (metric: any) => {
    // Determine which KPI to open based on metric name
    if (metric.name.toLowerCase().includes('revenue')) {
      handleKpiClick('revenue');
    } else if (metric.name.toLowerCase().includes('arpu')) {
      handleKpiClick('arpu');
    } else if (metric.name.toLowerCase().includes('churn')) {
      handleKpiClick('churn');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading dashboard data..." />
          </main>
        </div>
      </div>
    );
  }

  const COLORS = ['#7e3af2', '#3f83f8', '#0e9f6e', '#ff5a1f', '#9061f9'];

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 md:mt-0">
                <TabsList>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  <TabsTrigger value="executive">Executive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {activeTab === "revenue" && (
              <>
                {/* Key Metrics */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricsCard
                    title="Total Revenue"
                    value={data?.total_revenue || 0}
                    prefix="$"
                    trend={data?.revenue_growth}
                    description="vs. previous period"
                    icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKraClick('revenue')}
                    infoTooltip="Click for detailed revenue KRA"
                  />
                  <MetricsCard
                    title="Revenue Growth"
                    value={data?.revenue_growth || 0}
                    suffix="%"
                    description="compared to last month"
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKpiClick('revenue')}
                    infoTooltip="Click for detailed growth KPI"
                  />
                  <MetricsCard
                    title="Average Revenue Per User"
                    value={data?.average_revenue_per_user || 0}
                    prefix="$"
                    description="monthly average"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKpiClick('arpu')}
                    infoTooltip="Click for detailed ARPU KPI"
                  />
                  <MetricsCard
                    title="Churn Rate"
                    value={data?.churn_rate || 0}
                    suffix="%"
                    description="monthly rate"
                    icon={<ArrowDownRight className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKpiClick('churn')}
                    infoTooltip="Click for detailed churn KPI"
                  />
                </div>

                {/* Revenue Trend Chart */}
                <div className="mb-8">
                  <RevenueChart
                    title="Revenue Trend"
                    data={data?.revenue_trend || []}
                    valuePrefix="$"
                    description="Daily revenue over the last 30 days"
                    onClick={() => handleKpiClick('revenue')}
                    allowFullscreen={true}
                    showInfoTooltip={true}
                    infoTooltipContent="Click for detailed revenue analysis"
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Revenue by Channel */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Channel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={data?.revenue_by_channel || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              animationDuration={1500}
                            >
                              {data?.revenue_by_channel.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => `$${value.toLocaleString()}`}
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderColor: '#7e3af2',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Products */}
                  <DataTable
                    title="Top Products by Revenue"
                    columns={[
                      { key: "name", header: "Product" },
                      { 
                        key: "revenue", 
                        header: "Revenue", 
                        formatter: (value) => `$${value.toLocaleString()}`
                      },
                    ]}
                    data={data?.top_products || []}
                    pagination={false}
                    searchable={false}
                  />
                </div>
              </>
            )}

            {activeTab === "executive" && (
              <>
                {/* Executive Dashboard */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricsCard
                    title="Revenue KRA"
                    value="95.8%"
                    description="of target achieved"
                    icon={<Target className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKraClick('revenue')}
                    infoTooltip="Click for detailed revenue KRA"
                  />
                  <MetricsCard
                    title="Customer KRA"
                    value="97.2%"
                    description="of target achieved"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKraClick('customer')}
                    infoTooltip="Click for detailed customer KRA"
                  />
                  <MetricsCard
                    title="Operations KRA"
                    value="99.9%"
                    description="of target achieved"
                    icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                    onClick={() => handleKraClick('operations')}
                    infoTooltip="Click for detailed operations KRA"
                  />
                  <MetricsCard
                    title="Overall Performance"
                    value="97.6%"
                    description="weighted average"
                    icon={<Layers className="h-4 w-4 text-muted-foreground" />}
                    infoTooltip="Overall performance across all KRAs"
                  />
                </div>

                {/* KRA Performance Chart */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>KRA Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Revenue KRA (95.8%)</span>
                            <span className="text-sm text-green-500">On Track</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-[#7e3af2]" style={{ width: "95.8%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Customer KRA (97.2%)</span>
                            <span className="text-sm text-green-500">On Track</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-[#3f83f8]" style={{ width: "97.2%" }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">Operations KRA (99.9%)</span>
                            <span className="text-sm text-green-500">On Track</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-2 rounded-full bg-[#0e9f6e]" style={{ width: "99.9%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div 
                          className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                          onClick={() => handleKpiClick('arpu')}
                        >
                          <div>
                            <p className="font-medium">ARPU</p>
                            <p className="text-sm text-muted-foreground">Average Revenue Per User</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${data?.average_revenue_per_user}</p>
                            <p className="text-xs text-green-500">+5.6% vs prev</p>
                          </div>
                        </div>
                        <div 
                          className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                          onClick={() => handleKpiClick('churn')}
                        >
                          <div>
                            <p className="font-medium">Churn Rate</p>
                            <p className="text-sm text-muted-foreground">Customer Attrition</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{data?.churn_rate}%</p>
                            <p className="text-xs text-green-500">-8.7% vs prev</p>
                          </div>
                        </div>
                        <div 
                          className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                          onClick={() => handleKpiClick('revenue')}
                        >
                          <div>
                            <p className="font-medium">Revenue Growth</p>
                            <p className="text-sm text-muted-foreground">Month-over-Month</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{data?.revenue_growth}%</p>
                            <p className="text-xs text-green-500">+16.0% vs prev</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        Overall business performance is strong with all KRAs tracking above 95% of target. 
                        Revenue has grown by {data?.revenue_growth}% compared to the previous period, 
                        with total revenue reaching ${data?.total_revenue.toLocaleString()}.
                      </p>
                      <p>
                        Customer metrics show positive trends with ARPU at ${data?.average_revenue_per_user} 
                        and churn rate maintained at {data?.churn_rate}%. The top performing product 
                        continues to be {data?.top_products[0].name} with 
                        ${data?.top_products[0].revenue.toLocaleString()} in revenue.
                      </p>
                      <p>
                        Click on any KRA or KPI card to view detailed analysis and trends.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* KRA Dialog */}
      <KraDialog 
        open={kraDialogOpen} 
        onOpenChange={setKraDialogOpen} 
        data={kraData}
        onMetricClick={handleMetricClick}
      />
      
      {/* KPI Dialog */}
      <KpiDialog 
        open={kpiDialogOpen} 
        onOpenChange={setKpiDialogOpen} 
        data={kpiData}
      />
    </div>
  );
};

export default Dashboard;