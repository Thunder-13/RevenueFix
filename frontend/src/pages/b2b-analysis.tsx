import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { BarChart3, TrendingUp, FileText, Briefcase } from "lucide-react";

interface B2BData {
  summary: {
    total_b2b_revenue: number;
    revenue_growth: number;
    active_contracts: number;
    average_contract_value: number;
  };
  revenue_by_industry: Array<{ industry: string; revenue: number }>;
  top_clients: Array<{ name: string; revenue: number; growth: number }>;
  contract_renewal_rate: number;
  revenue_trend: Array<{ date: string; value: number }>;
}

const B2BAnalysis = () => {
  const [data, setData] = useState<B2BData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getB2BData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching B2B data:", error);
        toast({
          title: "Error",
          description: "Failed to load B2B analysis data. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading B2B analysis data..." />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-6 text-3xl font-bold">B2B Analysis</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Total B2B Revenue"
                value={data?.summary.total_b2b_revenue || 0}
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
                title="Active Contracts"
                value={data?.summary.active_contracts || 0}
                description="current contracts"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Avg Contract Value"
                value={data?.summary.average_contract_value || 0}
                prefix="$"
                description="per contract"
                icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Revenue Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="B2B Revenue Trend"
                data={data?.revenue_trend || []}
                valuePrefix="$"
                description="Daily B2B revenue over the last 30 days"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Revenue by Industry */}
              <DataTable
                title="Revenue by Industry"
                columns={[
                  { key: "industry", header: "Industry" },
                  { 
                    key: "revenue", 
                    header: "Revenue", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                ]}
                data={data?.revenue_by_industry || []}
              />

              {/* Top Clients */}
              <DataTable
                title="Top Clients"
                columns={[
                  { key: "name", header: "Client" },
                  { 
                    key: "revenue", 
                    header: "Revenue", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                  { 
                    key: "growth", 
                    header: "Growth", 
                    formatter: (value) => `${value}%`
                  },
                ]}
                data={data?.top_clients || []}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default B2BAnalysis;