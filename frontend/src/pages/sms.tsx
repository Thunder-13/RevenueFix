import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/lib/api";
import { BarChart3, TrendingUp, PhoneCall, MessageSquare, Wifi, CloudDownload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CalendarX, Clock, DownloadCloud, UserX, PhoneMissed } from "lucide-react";
import { Database, AlertCircle, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";


interface NetworkBillingSMSMetrics {
  data: {
    total_records: number;
    mismatch_count: number;
    account_status_mismatch_count: number;
    transaction_mismatch_count: number;
    transaction_date_mismatch_count: number;
    count_mismatch_count: number;
    service_mismatch_count: number;
    duplicate_count: number;
    msisdn_missing_count: number;
    revenue_trend: Array<{ date: string; value: number }>;
    service_breakdown: {
      service_name: string;
      usage_type: string,
      usage_sub_type: string,
      count: number,
      total_download_mb: number,
    }[];
    records_display_card: Array<{
      name: string;
      records: Array<{
        [key: string]: any; // Dynamic fields for each record
      }>;
    }>;
    evenue_trend: Array<{ date: string; value: number }>;
  };
}

const SMS = () => {
  const [data, setData] = useState<NetworkBillingSMSMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [relatedRecords, setRelatedRecords] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getNetworkVsBillingSms();
        setData(response.data.data);
        
        if (response.data.data.records_display_card?.length > 0) {
          setRelatedRecords(response.data.data.records_display_card[0].records || []);
        }
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

  

  const handleMetricClick = (metricKey: string) => {
    setSelectedMetric(metricKey);
  
    if (data?.data.records_display_card) {
      const section = data.data.records_display_card.find(
        (record) => record.name === metricKey
      );

      setRelatedRecords(section?.records || []);
      //setRelatedRecords(data.data.records_display_card[3].records || []);
    }
  };

    const getStatusBadge = (status: string) => {
      return status.toLowerCase() === "active" || status.toLowerCase() === "a" ? (
        <Badge
                variant="outline"
                className="bg-green-500 text-white hover:border-green-500 hover:text-green-500 hover:bg-white"
              >
                Active
              </Badge>
      ) : (
        <Badge
                variant="outline"
                className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
              >
                Inactive
              </Badge>
      );
    };

    const getColumnsForMismatchReason = (mismatchReason: string) => {
      if (mismatchReason === "Service mismatch between Network and Billing") {
        return [
          { key: "MSISDN", header: "MSISDN" },
          { 
            key: "Service Name",
            header: "Network Service Name",
            formatter: (value) => (
              <Badge
                variant="outline"
                className="bg-green-500 text-white hover:border-green-500 hover:text-green-500 hover:bg-white"
              >
                {value}
              </Badge>
            ),
          },
          { 
            key: "Billing Service Name",
            header: "Billing Service Name",
            formatter: (value) => (
              <Badge
                variant="outline"
                className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
              >
                {value}
              </Badge>
            ),
          },
          { key: "Mismatch Reason", header: "Mismatch Reason" },
        ];
      } else if (mismatchReason === "Service Start/End Date mismatch between Network and Billing") {
        return [
          { key: "MSISDN", header: "MSISDN" },
          { key: "Service ID", header: "Network Service ID" },
          { 
            key: "Service Start Date",
            header: "Network Service Start Date",
            formatter: (value) => (
              <Badge
                variant="outline"
                className="bg-green-500 text-white hover:border-green-500 hover:text-green-500 hover:bg-white"
              >
                {value}
              </Badge>
            ),
          },
          { 
            key: "Service End Date",
            header: "Network Service End Date",
            formatter: (value) => (
              <Badge
                variant="outline"
                className="bg-green-500 text-white hover:border-green-500 hover:text-green-500 hover:bg-white"
              >
                {value}
              </Badge>
            ),
          },
          { 
            key: "Billing Service Start Date",
            header: "Billing Service Start Date",
            formatter: (value) => (
              <Badge
                variant="outline"
                className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
              >
                {value}
              </Badge>
            ),
          },
          { 
            key: "Billing Service End Date",
            header: "Billing Service End Date",
            formatter: (value) => (
              <Badge
                variant="outline"
                className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
              >
                {value}
              </Badge>
            ),

          },
          { key: "Mismatch Reason", header: "Mismatch Reason" },
        ];
      } else if (mismatchReason === "Service Status mismatch between Network and Billing") {
        return [
          { key: "MSISDN", header: "MSISDN" },
          { key: "Service ID", header: "Service ID" },
          { key: "Service Name", header: "Service Name" },
          { 
            key: "Service Status",
            header: "Network Service Status",
            formatter: (value) => getStatusBadge(value),
          },
          { 
            key: "Billing Service Status",
            header: "Billing Service Status",
            formatter: (value) => getStatusBadge(value),
          },
          { key: "Service Start Date", header: "Service Start Date" },
          { key: "Service End Date", header: "Service End Date" },
          { key: "Mismatch Reason", header: "Mismatch Reason" },
        ];
      } else {
        return [
          { key: "MSISDN", header: "MSISDN" },
          { key: "Service ID", header: "Network Service ID" },
          { key: "Mismatch Reason", header: "Mismatch Reason" },
        ];
      }
    };

    const preprocessRecords = (records: any[]) => {
      const groupedRecords: { [key: string]: any[] } = {};
    
      records.forEach((record) => {
        const mismatchReason = record["Mismatch Reason"];
        if (!groupedRecords[mismatchReason]) {
          groupedRecords[mismatchReason] = [];
        }
        groupedRecords[mismatchReason].push(record);
      });
    
      return groupedRecords;
    };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex flex-1 items-center justify-center">
            <LoadingSpinner size="lg" text="Loading SMS data..." />
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
                <h1 className="mb-6 text-3xl font-bold">SMS</h1>
    
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
    
                <Tabs defaultValue="data" className="mb-8">
                  
                  {/* Data Tab */}
                  <TabsContent value="data">
                <div className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <MetricsCard
                      title="Total Records"
                      value={data?.data.total_records || 0}
                      //prefix="$"
                      description={`Excluding ${
                      data?.data.duplicate_count|| 0
                      } duplicates`}
                      icon={<Database className="h-4 w-4 text-muted-foreground" />}
                    />
                    <MetricsCard
                      title="Total Mismatch"
                      value={data?.data.mismatch_count || 0}
                      //suffix="%"
                      //description="are mismatched records"
                      description="Mismatches between N/B"
                      icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
                      onClick={() => handleMetricClick("Mismatched Records")}
                    />
                    <MetricsCard
                      title="Service Mismatch"
                      value={data?.data.service_mismatch_count || 0}
                      //suffix=" TB"
                     description="Service mismatch between N/B"
                      icon={<WifiOff className="h-4 w-4 text-muted-foreground" />}
                      onClick={() => handleMetricClick("Service Mismatch")}
                    />
                    
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricsCard
                        title="Account Status Mismatch"
                        value={data?.data.account_status_mismatch_count || 0}
                        //suffix=" TB"
                      // description="total terabytes"
                        icon={<UserX className="h-4 w-4 text-muted-foreground" />}
                        onClick={() => handleMetricClick("Account Status Mismatch")}
                      />
                    
                    <MetricsCard
                      title="Missed Records in Billing" 
                      value={data?.data.msisdn_missing_count || 0}
                      //suffix=" TB"
                     // description="total terabytes"
                      icon={<PhoneMissed  className="h-4 w-4 text-muted-foreground" />}
                      onClick={() => handleMetricClick("Missing Records")}
                    />
                    <MetricsCard
                      title="Count Mismatch"
                      value={data?.data.count_mismatch_count || 0}
                     // prefix="$"
                      //description="per gigabyte"
                      icon={<CloudDownload className="h-4 w-4 text-muted-foreground" />}
                      onClick={() => handleMetricClick("Count Mismatch")}
                    />
                     <MetricsCard
                      title="Transaction Mismatch"
                      value={data?.data.transaction_mismatch_count + data?.data.transaction_date_mismatch_count || 0}
                     // prefix="$"
                      //description="per gigabyte"
                      icon={<CalendarX className="h-4 w-4 text-muted-foreground" />}
                      onClick={() => handleMetricClick("Transaction Mismatch")}
                    />
                  </div>
                  <RevenueChart
                    title=" Monthly Mismatch Trend"
                    data={data?.data.revenue_trend || []}
                    //valuePrefix="$"
                    description="Monthly Mismatch - Network vs Billing"
                  />
                </div>
                <div>
                {selectedMetric && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Detailed View of {selectedMetric}</h2>
                    {relatedRecords.length > 0 ? (
                      selectedMetric === "Service Mismatch" ? (
                        Object.entries(preprocessRecords(relatedRecords)).map(([mismatchReason, records], index) => (
                          <div key={index} className="mb-6">
                            
                            <DataTable
                              title={''}
                              columns={getColumnsForMismatchReason(mismatchReason)}
                              data={records}
                            />
                          </div>
                        ))
                      ) : selectedMetric === "Transaction Mismatch" ? (
                        Object.entries(preprocessRecords(relatedRecords)).map(([mismatchReason, records], index) => (
                          <div key={index} className="mb-6">
                            <DataTable
                              title={''}
                              columns={
                                mismatchReason === "Transaction Date not In Between Service Start/End Date"
                                  ? [
                                      { key: "MSISDN", header: "MSISDN" },
                                      { 
                                        key: "Transaction Date",
                                        header: "Transaction Date",
                                        formatter: (value) => (
                                          <Badge
                                            variant="outline"
                                            className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
                                          >
                                            {value}
                                          </Badge>
                                        ),
                                      },
                                      { key: "Service Start Date", header: "Service Start Date" },
                                      { key: "Service End Date", header: "Service End Date" },
                                      { key: "Mismatch Reason", header: "Mismatch Reason" },
                                    ]
                                  : mismatchReason === "Transaction Date not matched between Network and Billing"
                                  ? [
                                      { key: "MSISDN", header: "MSISDN" },
                                      { 
                                        key: "Transaction Date",
                                        header: "Network Transaction Date",
                                        formatter: (value) => (
                                          <Badge
                                            variant="outline"
                                            className="bg-green-500 text-white hover:border-green-500 hover:text-green-500 hover:bg-white"
                                          >
                                            {value}
                                          </Badge>
                                        ),
                                        
                                      },
                                      { 
                                        key: "Billing Transaction Date",
                                        header: "Billing Transaction Date",
                                        formatter: (value) => (
                                          <Badge
                                            variant="outline"
                                            className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
                                          >
                                            {value}
                                          </Badge>
                                        ),
                                      },
                                      { key: "Mismatch Reason", header: "Mismatch Reason" },
                                    ]
                                  : []
                              }
                              data={records}
                            />
                          </div>
                        ))
                      ) : (
                        <DataTable
                          title={''}
                          columns={
                            selectedMetric === "Mismatched Records"
                              ? [
                                  { key: "MSISDN", header: "MSISDN" },
                                  { key: "Account Status", header: "Account Status" },
                                  { key: "Usage Type", header: "Usage Type" },
                                  { key: "Usage Sub Type", header: "Usage Sub Type" },
                                  { key: "Transaction Date", header: "Transaction Date" },
                                  { key: "Count", header: "Count" },
                                  { key: "Service ID", header: "Service ID" },
                                  { key: "Service Name",header: "Service Name" },
                                  { key: "Service Status", header: "Service Status" },
                                  { key: "Service Start Date", header: "Service Start Date" },
                                  { key: "Service End Date", header: "Service End Date" },
                                ]
                              : selectedMetric === "Account Status Mismatch"
                              ? [
                                  { key: "MSISDN", header: "MSISDN" },
                                  {
                                    key: "Account Status",
                                    header: "Account Status",
                                    formatter: (value) => getStatusBadge(value),
                                  },
                                  { key: "Transaction Date", header: "Transaction Date" },
                                  {
                                    key: "Service Status",
                                    header: "Service Status",
                                    formatter: (value) => getStatusBadge(value),
                                  },
                                  { key: "Service Start Date", header: "Service Start Date" },
                                  { key: "Service End Date", header: "Service End Date" },
                                ]
                              : selectedMetric === "Missing Records"
                              ? [
                                  { key: "MSISDN", header: "MSISDN" },
                                  { key: "Account Status", header: "Account Status" },
                                  { key: "Transaction Date", header: "Transaction Date" },
                                ]
                              : selectedMetric === "Count Mismatch"
                              ? [
                                  { key: "MSISDN", header: "MSISDN" },
                                  { key: "Usage Type", header: "Usage Type" },
                                  { key: "Usage Sub Type", header: "Usage Sub Type" },
                                  { key: "Service Name", header: "Service Name" },
                                  { 
                                    key: "Count",
                                    header: "Network Count",
                                    formatter: (value) => (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-500 text-white hover:border-green-500 hover:text-green-500 hover:bg-white"
                                      >
                                        {value}
                                      </Badge>
                                    ),
                                  },
                                  { 
                                    key: "Billing Count",
                                    header: "Billing Count",
                                    formatter: (value) => (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-500 text-white hover:border-red-500 hover:text-red-500 hover:bg-white"
                                      >
                                        {value}
                                      </Badge>
                                    ),
                                  },
                                  { key: "Mismatch Reason", header: "Mismatch Reason" },
                                  
                                ]
                              : relatedRecords.length > 0
                              ? Object.keys(relatedRecords[0]).map((key) => ({
                                  key,
                                  header: key.replace(/_/g, " ").toUpperCase(),
                                }))
                              : []
                          }
                          data={relatedRecords}
                        />
                      )
                    ) : (
                      <p className="text-gray-500">No related records found for {selectedMetric}.</p>
                    )}
                  </div>
                )}
                </div>
                
              </TabsContent>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      );
};

export default SMS;