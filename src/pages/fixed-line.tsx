import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { BarChart3, TrendingUp, Radio, Users } from "lucide-react";

interface FixedLineData {
  summary: {
    total_revenue: number;
    active_lines: number;
    average_revenue_per_line: number;
    growth_rate: number;
  };
  revenue_by_service_type: Array<{ type: string; revenue: number }>;
  top_packages: Array<{ name: string; revenue: number; subscribers: number }>;
  installation_trend: Array<{ date: string; value: number }>;
  revenue_trend: Array<{ date: string; value: number }>;
}

const FixedLine = () => {
  const [data, setData] = useState<FixedLineData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getFixedLineData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching fixed line data:", error);
        toast({
          title: "Error",
          description: "Failed to load fixed line data. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading fixed line data..." />
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
            <h1 className="mb-6 text-3xl font-bold">Fixed Line Services</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total Revenue"
                value={data?.summary.total_revenue || 0}
                prefix="$"
                trend={data?.summary.growth_rate}
                description="vs. previous period"
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Growth Rate"
                value={data?.summary.growth_rate || 0}
                suffix="%"
                description="compared to last month"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Active Lines"
                value={data?.summary.active_lines || 0}
                description="total active connections"
                icon={<Radio className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="ARPL"
                value={data?.summary.average_revenue_per_line || 0}
                prefix="$"
                description="average revenue per line"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Revenue Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="Fixed Line Revenue Trend"
                data={data?.revenue_trend || []}
                valuePrefix="$"
                description="Daily fixed line revenue over the last 30 days"
              />
            </div>

            {/* Installation Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="New Installations Trend"
                data={data?.installation_trend || []}
                description="Daily new installations over the last 30 days"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Revenue by Service Type */}
              <DataTable
                title="Revenue by Service Type"
                columns={[
                  { key: "type", header: "Service Type" },
                  { 
                    key: "revenue", 
                    header: "Revenue", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                ]}
                data={data?.revenue_by_service_type || []}
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

export default FixedLine;