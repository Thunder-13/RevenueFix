import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { BarChart3, TrendingUp, Users, ArrowDownRight } from "lucide-react";

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

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-3xl font-bold">Revenue Dashboard</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total Revenue"
                value={data?.total_revenue || 0}
                prefix="$"
                trend={data?.revenue_growth}
                description="vs. previous period"
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Revenue Growth"
                value={data?.revenue_growth || 0}
                suffix="%"
                description="compared to last month"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Average Revenue Per User"
                value={data?.average_revenue_per_user || 0}
                prefix="$"
                description="monthly average"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Churn Rate"
                value={data?.churn_rate || 0}
                suffix="%"
                description="monthly rate"
                icon={<ArrowDownRight className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Revenue Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="Revenue Trend"
                data={data?.revenue_trend || []}
                valuePrefix="$"
                description="Daily revenue over the last 30 days"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Revenue by Channel */}
              <DataTable
                title="Revenue by Channel"
                columns={[
                  { key: "name", header: "Channel" },
                  { 
                    key: "value", 
                    header: "Revenue", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                ]}
                data={data?.revenue_by_channel || []}
              />

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
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;