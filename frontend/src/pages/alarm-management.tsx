import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AlarmData {
  summary: {
    total_alarms: number;
    critical_alarms: number;
    major_alarms: number;
    minor_alarms: number;
    resolved_today: number;
  };
  alarm_by_category: Array<{ category: string; count: number }>;
  alarm_trend: Array<{ date: string; value: number }>;
  top_alarm_sources: Array<{ source: string; count: number }>;
  recent_alarms: Array<{ 
    id: string; 
    severity: string; 
    source: string; 
    message: string; 
    timestamp: string;
  }>;
}

const AlarmManagement = () => {
  const [data, setData] = useState<AlarmData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getAlarmData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching alarm data:", error);
        toast({
          title: "Error",
          description: "Failed to load alarm management data. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading alarm management data..." />
          </main>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'major':
        return <Badge className="bg-orange-500">Major</Badge>;
      case 'minor':
        return <Badge variant="outline">Minor</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="mb-6 text-3xl font-bold">Alarm Management</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Alarm
              </Button>
              </div>


            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <MetricsCard
                title="Total Alarms"
                value={data?.summary.total_alarms || 0}
                description="active alarms"
                icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Critical Alarms"
                value={data?.summary.critical_alarms || 0}
                description="need immediate attention"
                icon={<AlertOctagon className="h-4 w-4 text-destructive" />}
              />
              <MetricsCard
                title="Major Alarms"
                value={data?.summary.major_alarms || 0}
                description="high priority"
                icon={<AlertCircle className="h-4 w-4 text-orange-500" />}
              />
              <MetricsCard
                title="Minor Alarms"
                value={data?.summary.minor_alarms || 0}
                description="low priority"
                icon={<AlertTriangle className="h-4 w-4 text-yellow-500" />}
              />
              <MetricsCard
                title="Resolved Today"
                value={data?.summary.resolved_today || 0}
                description="cleared alarms"
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              />
            </div>

            {/* Alarm Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="Alarm Trend"
                data={data?.alarm_trend || []}
                description="Daily alarm count over the last 30 days"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Alarm by Category */}
              <DataTable
                title="Alarms by Category"
                columns={[
                  { key: "category", header: "Category" },
                  { key: "count", header: "Count" },
                ]}
                data={data?.alarm_by_category || []}
              />

              {/* Top Alarm Sources */}
              <DataTable
                title="Top Alarm Sources"
                columns={[
                  { key: "source", header: "Source" },
                  { key: "count", header: "Count" },
                ]}
                data={data?.top_alarm_sources || []}
              />
            </div>

            {/* Recent Alarms */}
            <div className="mt-8">
              <DataTable
                title="Recent Alarms"
                columns={[
                  { key: "id", header: "ID" },
                  { 
                    key: "severity", 
                    header: "Severity",
                    formatter: (value) => getSeverityBadge(value)
                  },
                  { key: "source", header: "Source" },
                  { key: "message", header: "Message" },
                  { 
                    key: "timestamp", 
                    header: "Time",
                    formatter: (value) => {
                      const date = new Date(value);
                      return date.toLocaleString();
                    }
                  },
                ]}
                data={data?.recent_alarms || []}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlarmManagement;