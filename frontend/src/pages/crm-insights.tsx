import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { Users, UserPlus, ArrowDownRight, ThumbsUp, BarChart3 } from "lucide-react";

interface CRMData {
  summary: {
    total_customers: number;
    new_customers_mtd: number;
    churn_rate: number;
    customer_satisfaction: number;
    arpu: number;
  };
  customer_segments: Array<{ segment: string; count: number; percentage: number }>;
  customer_service_lines: Array<{ service_line: string; count: number }>; // Added service line data
  customer_lifecycle: Array<{ stage: string; count: number }>;
  top_complaints: Array<{ issue: string; count: number }>;
  customer_satisfaction_trend: Array<{ date: string; value: number }>;
  churn_trend: Array<{ date: string; value: number }>;
}

const CrmInsights = () => {
  const [data, setData] = useState<CRMData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getCRMInsights();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching CRM insights:", error);
        toast({
          title: "Error",
          description: "Failed to load CRM insights. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading CRM insights..." />
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
            <h1 className="mb-6 text-3xl font-bold">CRM Insights</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              <MetricsCard
                title="Total Customers"
                value={data?.summary.total_customers || 0}
                description="active customers"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="New Customers MTD"
                value={data?.summary.new_customers_mtd || 0}
                description="month to date"
                icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Churn Rate"
                value={data?.summary.churn_rate || 0}
                suffix="%"
                description="monthly rate"
                icon={<ArrowDownRight className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Customer Satisfaction"
                value={data?.summary.customer_satisfaction || 0}
                suffix="%"
                description="satisfaction score"
                icon={<ThumbsUp className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="ARPU"
                value={data?.summary.arpu || 0}
                prefix="$"
                description="average revenue per user"
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div className="mb-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
              {/* Customer Satisfaction Trend Chart */}
              <div className="mb-8">
                <RevenueChart
                  title="Customer Satisfaction Trend"
                  data={data?.customer_satisfaction_trend || []}
                  valueSuffix="%"
                  description="Daily customer satisfaction score over the last 30 days"
                />
              </div>

              {/* Churn Trend Chart */}
              <div className="mb-8">
                <RevenueChart
                  title="Churn Rate Trend"
                  data={data?.churn_trend || []}
                  valueSuffix="%"
                  description="Daily churn rate over the last 30 days"
                />
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Customer Segments */}
              <DataTable
                title="Customer Segments"
                columns={[
                  { key: "segment", header: "Segment" },
                  { key: "count", header: "Count", formatter: (value) => value.toLocaleString() },
                  { key: "percentage", header: "Percentage", formatter: (value) => `${value}%` },
                ]}
                data={data?.customer_segments || []}
              />

              {/* Customer Lifecycle */}
              <DataTable
                title="Customer Lifecycle"
                columns={[
                  { key: "stage", header: "Stage" },
                  { key: "count", header: "Count", formatter: (value) => value.toLocaleString() },
                ]}
                data={data?.customer_lifecycle || []}
              />
            </div>
            <div className="mb-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
            {/* Customer Count Per Service Line */}
            <div className="mt-8">
              <DataTable
                title="Customer Count Per Service Line"
                columns={[
                  { key: "service_line", header: "Service Line" },
                  { key: "count", header: "Count", formatter: (value) => value.toLocaleString() },
                ]}
                data={[
                  { "service_line": "Enterprise", "count": 1200 },
                  { "service_line": "Residential", "count": 4500 },
                  { "service_line": "SMB", "count": 2300 }
                ]}
              />
            </div>

            {/* Top Complaints */}
            <div className="mt-8">
              <DataTable
                title="Top Customer Complaints"
                columns={[
                  { key: "issue", header: "Issue" },
                  { key: "count", header: "Count", formatter: (value) => value.toLocaleString() },
                ]}
                data={data?.top_complaints || []}
              />
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CrmInsights;