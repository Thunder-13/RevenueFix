import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PhoneCall, TrendingUp, BarChart3 } from "lucide-react";

const Voice = ({ data }: { data: any }) => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
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
        </main>
      </div>
    </div>
  );
};

export default Voice;