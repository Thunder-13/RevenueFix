import { useState, useEffect } from "react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { PhoneCall, TrendingUp, BarChart3 } from "lucide-react";

const Voice = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getVoiceSmsDataMetrics();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching voice metrics:", error);
        toast({
          title: "Error",
          description: "Failed to load voice metrics. Please try again.",
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
        <LoadingSpinner size="lg" text="Loading voice metrics..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">Voice</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Voice Revenue"
          value={data?.voice.total_revenue || 0}
          prefix="$"
          trend={data?.voice.growth_rate}
          description="vs. previous period"
          icon={<PhoneCall className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Growth Rate"
          value={data?.voice.growth_rate || 0}
          suffix="%"
          description="compared to last month"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Call Minutes"
          value={data?.voice.call_minutes || 0}
          description="total minutes"
          icon={<PhoneCall className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Avg Revenue/Min"
          value={data?.voice.average_revenue_per_minute || 0}
          prefix="$"
          description="per minute"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <RevenueChart
        title="Voice Revenue Trend"
        data={data?.voice.revenue_trend || []}
        valuePrefix="$"
        description="Daily voice revenue over the last 30 days"
      />
    </div>
  );
};

export default Voice;
