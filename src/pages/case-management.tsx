import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { FolderOpen, Clock, PlusCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CaseData {
  summary: {
    total_cases: number;
    open_cases: number;
    cases_created_today: number;
    cases_closed_today: number;
    average_resolution_time: number;
  };
  case_by_priority: Array<{ priority: string; count: number }>;
  case_by_department: Array<{ department: string; count: number }>;
  case_trend: Array<{ date: string; value: number }>;
  recent_cases: Array<{ 
    id: string; 
    priority: string; 
    customer: string; 
    subject: string; 
    status: string; 
    created_at: string;
  }>;
}

const CaseManagement = () => {
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getCaseData();
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching case data:", error);
        toast({
          title: "Error",
          description: "Failed to load case management data. Please try again.",
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
            <LoadingSpinner size="lg" text="Loading case management data..." />
          </main>
        </div>
      </div>
    );
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'P1':
        return <Badge variant="destructive">P1</Badge>;
      case 'P2':
        return <Badge className="bg-orange-500">P2</Badge>;
      case 'P3':
        return <Badge className="bg-yellow-500">P3</Badge>;
      case 'P4':
        return <Badge variant="outline">P4</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge variant="outline" className="border-red-500 text-red-500">Open</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'Pending Customer':
        return <Badge className="bg-yellow-500">Pending Customer</Badge>;
      case 'Closed':
        return <Badge className="bg-green-500">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <h1 className="text-3xl font-bold">Case Management</h1>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Case
              </Button>
            </div>

            {/* Key Metrics */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <MetricsCard
                title="Total Cases"
                value={data?.summary.total_cases || 0}
                description="all cases"
                icon={<FolderOpen className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Open Cases"
                value={data?.summary.open_cases || 0}
                description="need attention"
                icon={<FolderOpen className="h-4 w-4 text-red-500" />}
              />
              <MetricsCard
                title="Created Today"
                value={data?.summary.cases_created_today || 0}
                description="new cases"
                icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricsCard
                title="Closed Today"
                value={data?.summary.cases_closed_today || 0}
                description="resolved cases"
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              />
              <MetricsCard
                title="Avg Resolution Time"
                value={data?.summary.average_resolution_time || 0}
                suffix=" hrs"
                description="average time to resolve"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            {/* Case Trend Chart */}
            <div className="mb-8">
              <RevenueChart
                title="Case Trend"
                data={data?.case_trend || []}
                description="Daily case count over the last 30 days"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Case by Priority */}
              <DataTable
                title="Cases by Priority"
                columns={[
                  { 
                    key: "priority", 
                    header: "Priority",
                    formatter: (value) => getPriorityBadge(value)
                  },
                  { key: "count", header: "Count" },
                ]}
                data={data?.case_by_priority || []}
              />

              {/* Case by Department */}
              <DataTable
                title="Cases by Department"
                columns={[
                  { key: "department", header: "Department" },
                  { key: "count", header: "Count" },
                ]}
                data={data?.case_by_department || []}
              />
            </div>

            {/* Recent Cases */}
            <div className="mt-8">
              <DataTable
                title="Recent Cases"
                columns={[
                  { key: "id", header: "ID" },
                  { 
                    key: "priority", 
                    header: "Priority",
                    formatter: (value) => getPriorityBadge(value)
                  },
                  { key: "customer", header: "Customer" },
                  { key: "subject", header: "Subject" },
                  { 
                    key: "status", 
                    header: "Status",
                    formatter: (value) => getStatusBadge(value)
                  },
                  { 
                    key: "created_at", 
                    header: "Created",
                    formatter: (value) => {
                      const date = new Date(value);
                      return date.toLocaleString();
                    }
                  },
                ]}
                data={data?.recent_cases || []}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CaseManagement;