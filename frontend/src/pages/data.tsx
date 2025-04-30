import { useState, useEffect } from "react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { Wifi, TrendingUp, BarChart3 } from "lucide-react";

const Data = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getVoiceSmsDataMetrics();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching data metrics:", error);
        toast({
          title: "Error",
          description: "Failed to load data metrics. Please try again.",
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
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading data metrics..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Data</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Data Revenue"
          value={data?.data.total_revenue || 0}
          prefix="$"
          trend={data?.data.growth_rate}
          description="vs. previous period"
          icon={<Wifi className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Growth Rate"
          value={data?.data.growth_rate || 0}
          suffix="%"
          description="compared to last month"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Data Usage"
          value={data?.data.data_usage_tb || 0}
          suffix=" TB"
          description="total terabytes"
          icon={<Wifi className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Avg Revenue/GB"
          value={data?.data.average_revenue_per_gb || 0}
          prefix="$"
          description="per gigabyte"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <RevenueChart
        title="Data Revenue Trend"
        data={data?.data.revenue_trend || []}
        valuePrefix="$"
        description="Daily data revenue over the last 30 days"
      />
    </div>
  );
};

export default Data;