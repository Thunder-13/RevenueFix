import { useState, useEffect } from "react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { MessageSquare, TrendingUp, BarChart3 } from "lucide-react";

const SMS = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getVoiceSmsDataMetrics();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching SMS metrics:", error);
        toast({
          title: "Error",
          description: "Failed to load SMS metrics. Please try again.",
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
        <LoadingSpinner size="lg" text="Loading SMS metrics..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-3xl font-bold">SMS</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="SMS Revenue"
          value={data?.sms.total_revenue || 0}
          prefix="$"
          trend={data?.sms.growth_rate}
          description="vs. previous period"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Growth Rate"
          value={data?.sms.growth_rate || 0}
          suffix="%"
          description="compared to last month"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Message Count"
          value={data?.sms.message_count || 0}
          description="total messages"
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricsCard
          title="Avg Revenue/Msg"
          value={data?.sms.average_revenue_per_message || 0}
          prefix="$"
          description="per message"
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <RevenueChart
        title="SMS Revenue Trend"
        data={data?.sms.revenue_trend || []}
        valuePrefix="$"
        description="Daily SMS revenue over the last 30 days"
      />
    </div>
  );
};

export default SMS;