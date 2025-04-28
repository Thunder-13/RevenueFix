import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MessageSquare, TrendingUp, BarChart3 } from "lucide-react";

const SMS = ({ data }: { data: any }) => {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
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
        </main>
      </div>
    </div>
  );
};

export default SMS;