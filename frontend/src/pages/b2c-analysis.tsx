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

interface B2CData {
  summary: {
    total_b2c_revenue: number;
    revenue_growth: number;
    active_customers: number;
    average_revenue_per_user: number;
  };
  revenue_by_segment: Array<{ segment: string; revenue: number }>;
  top_packages: Array<{ name: string; revenue: number; subscribers: number }>;
  churn_rate: number;
  revenue_trend: Array<{ date: string; value: number }>;
}

const B2CAnalysis = () => {
  const [data, setData] = useState<B2CData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getB2CData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching B2C data:", error);
        toast({
          title: "Error",
          description: "Failed to load B2C analysis data. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading B2C analysis data..." />
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
            <h1 className="mb-6 text-3xl font-bold">B2C Analysis</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total B2C Revenue"
                value={data?.summary.total_b2c_revenue || 0}
                prefix="$"
                trend={data?.summary.revenue_growth}
                description="vs. previous period"
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Revenue Growth"
                value={data?.summary.revenue_growth || 0}
                suffix="%"
                description="compared to last month"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Active Customers"
                value={data?.summary.active_customers || 0}
                description="total subscribers"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="ARPU"
                value={data?.summary.average_revenue_per_user || 0}
                prefix="$"
                description="average revenue per user"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Revenue Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="B2C Revenue Trend"
                data={data?.revenue_trend || []}
                valuePrefix="$"
                description="Daily B2C revenue over the last 30 days"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Revenue by Segment */}
              <DataTable
                title="Revenue by Customer Segment"
                columns={[
                  { key: "segment", header: "Segment" },
                  { 
                    key: "revenue", 
                    header: "Revenue", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                ]}
                data={data?.revenue_by_segment || []}
              />

              {/* Top Packages */}
              <DataTable
                title="Top Packages"
                columns={[
                  { key: "name", header: "Package" },
                  { 
                    key: "revenue", 
                    header: "Revenue", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                  { 
                    key: "subscribers", 
                    header: "Subscribers", 
                    formatter: (value) => value.toLocaleString()
                  },
                ]}
                data={data?.top_packages || []}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default B2CAnalysis;