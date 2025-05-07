import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { FileCheck, AlertTriangle, DollarSign } from "lucide-react";

interface MediationBillingData {
  summary: {
    total_mediation_records: number;
    total_billing_records: number;
    discrepancy_count: number;
    discrepancy_percentage: number;
    financial_impact: number;
  };
  trend: Array<{ date: string; value: number }>;
  top_discrepancies: Array<{ service_type: string; count: number; value: number }>;
}

const MediationBilling = () => {
  const [data, setData] = useState<MediationBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getMediationBillingData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching mediation billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load mediation billing data. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading mediation billing data..." />
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
            <h1 className="mb-6 text-3xl font-bold">Mediation vs Billing</h1>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Mediation Records"
                value={data?.summary.total_mediation_records || 0}
                description="Total records from mediation systems"
                icon={<FileCheck className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Billing Records"
                value={data?.summary.total_billing_records || 0}
                description="Total records from billing systems"
                icon={<FileCheck className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Discrepancy Count"
                value={data?.summary.discrepancy_count || 0}
                description={`${data?.summary.discrepancy_percentage.toFixed(2)}% of total records`}
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Financial Impact"
                value={data?.summary.financial_impact || 0}
                prefix="$"
                description="Estimated revenue impact"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Discrepancy Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="Discrepancy Trend"
                data={data?.trend || []}
                valueSuffix="%"
                description="Daily discrepancy percentage over the last 14 days"
              />
            </div>

            {/* Top Discrepancies */}
            <div className="mb-8">
              <DataTable
                title="Top Discrepancies by Service Type"
                columns={[
                  { key: "service_type", header: "Service Type" },
                  { key: "count", header: "Count" },
                  { 
                    key: "value", 
                    header: "Financial Impact", 
                    formatter: (value) => `$${value.toLocaleString()}`
                  },
                ]}
                data={data?.top_discrepancies || []}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MediationBilling;