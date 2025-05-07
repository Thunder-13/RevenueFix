import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { BarChart3, TrendingUp, PhoneCall, MessageSquare, Wifi } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VoiceSmsDataMetrics {
  voice: {
    total_revenue: number;
    call_minutes: number;
    average_revenue_per_minute: number;
    growth_rate: number;
    revenue_trend: Array<{ date: string; value: number }>;
  };
  sms: {
    total_revenue: number;
    message_count: number;
    average_revenue_per_message: number;
    growth_rate: number;
    revenue_trend: Array<{ date: string; value: number }>;
  };
  data: {
    total_revenue: number;
    data_usage_tb: number;
    average_revenue_per_gb: number;
    growth_rate: number;
    revenue_trend: Array<{ date: string; value: number }>;
  };
  service_distribution: Array<{ name: string; percentage: number }>;
}

const VoiceSmsData = () => {
  const [data, setData] = useState<VoiceSmsDataMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getVoiceSmsDataMetrics();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching voice/SMS/data metrics:", error);
        toast({
          title: "Error",
          description: "Failed to load voice/SMS/data metrics. Please try again.",
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
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading voice/SMS/data metrics..." />
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
            <h1 className="mb-6 text-3xl font-bold">Voice</h1>

            {/* Service Distribution */}
            {/*<div className="mb-8">
              <DataTable
                title="Service Revenue Distribution"
                columns={[
                  { key: "name", header: "Service" },
                  { 
                    key: "percentage", 
                    header: "Percentage", 
                    formatter: (value) => `${value}%`
                  },
                ]}
                data={data?.service_distribution || []}
              />
            </div>*/}

            <Tabs defaultValue="voice" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="voice">Voice</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>
              
              {/* Voice Tab */}
              <TabsContent value="voice">
                <div className="grid gap-6">
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
              </TabsContent>
              
              {/* SMS Tab */}
              <TabsContent value="sms">
                <div className="grid gap-6">
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
              </TabsContent>
              
              {/* Data Tab */}
              <TabsContent value="data">
                <div className="grid gap-6">
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VoiceSmsData;