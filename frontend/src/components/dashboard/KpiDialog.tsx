import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Download, Filter } from "lucide-react";
import { DataTable } from "@/components/dashboard/DataTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useState } from "react";

interface KpiBreakdown {
  segment: string;
  value: number;
  [key: string]: any;
}

interface KpiDetail {
  id: number;
  segment: string;
  [key: string]: any;
}

interface KpiData {
  title: string;
  description: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  breakdown: KpiBreakdown[];
  trend: { date: string; value: number }[];
  details: KpiDetail[];
}

interface KpiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: KpiData | null;
}

export function KpiDialog({ open, onOpenChange, data }: KpiDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  if (!data) return null;
  
  // Determine columns for details table based on first item
  const detailColumns = data.details.length > 0
    ? Object.keys(data.details[0])
        .filter(key => key !== 'id')
        .map(key => ({
          key,
          header: key.charAt(0).toUpperCase() + key.slice(1),
          sortable: true,
          formatter: (value: any) => {
            if (typeof value === 'number') {
              if (key.toLowerCase().includes('revenue')) {
                return `$${value.toLocaleString()}`;
              }
              if (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('rate') || key.toLowerCase().includes('growth') || key.toLowerCase().includes('churn')) {
                return `${value}%`;
              }
              return value.toLocaleString();
            }
            return value;
          }
        }))
    : [];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#7e3af2]">{data.title}</DialogTitle>
          <DialogDescription>{data.description}</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Detailed Data</TabsTrigger>
            <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium text-muted-foreground">{data.title}</h3>
                        <div className="mt-2 text-4xl font-bold text-[#7e3af2]">
                          {data.title.toLowerCase().includes('revenue') ? '$' : ''}
                          {data.current_value.toLocaleString()}
                          {data.title.toLowerCase().includes('percentage') || data.title.toLowerCase().includes('rate') ? '%' : ''}
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-1">
                          {data.change_percentage > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={data.change_percentage > 0 ? "text-green-500" : "text-red-500"}>
                            {Math.abs(data.change_percentage)}%
                          </span>
                          <span className="text-sm text-muted-foreground">vs previous period</span>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h4 className="mb-4 text-sm font-medium">Breakdown by Segment</h4>
                        <div className="space-y-4">
                          {data.breakdown.map((item, index) => (
                            <motion.div 
                              key={item.segment}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full bg-[hsl(${(index * 60) % 360},70%,60%)]`}></div>
                                <span>{item.segment}</span>
                              </div>
                              <div className="font-medium">
                                {data.title.toLowerCase().includes('revenue') ? '$' : ''}
                                {item.value.toLocaleString()}
                                {data.title.toLowerCase().includes('percentage') || data.title.toLowerCase().includes('rate') ? '%' : ''}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <RevenueChart
                    title="Historical Trend"
                    data={data.trend}
                    showControls={false}
                    height={300}
                    type="area"
                  />
                </div>
              </div>
            )}
            
            {/* Details Tab */}
            {activeTab === "details" && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Detailed Data</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                
                <DataTable
                  title=""
                  columns={detailColumns}
                  data={data.details}
                  pagination={true}
                  pageSize={10}
                  searchable={true}
                  downloadable={true}
                />
              </div>
            )}
            
            {/* Trend Tab */}
            {activeTab === "trend" && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Trend Analysis</h3>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
                
                <RevenueChart
                  title=""
                  data={data.trend}
                  showControls={true}
                  height={400}
                  type="area"
                  showAverage={true}
                  allowFullscreen={true}
                />
                
                <div className="mt-6 grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground">Current Value</h4>
                      <div className="mt-2 text-2xl font-bold">
                        {data.title.toLowerCase().includes('revenue') ? '$' : ''}
                        {data.current_value.toLocaleString()}
                        {data.title.toLowerCase().includes('percentage') || data.title.toLowerCase().includes('rate') ? '%' : ''}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground">Previous Value</h4>
                      <div className="mt-2 text-2xl font-bold">
                        {data.title.toLowerCase().includes('revenue') ? '$' : ''}
                        {data.previous_value.toLocaleString()}
                        {data.title.toLowerCase().includes('percentage') || data.title.toLowerCase().includes('rate') ? '%' : ''}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground">Change</h4>
                      <div className="mt-2 flex items-center">
                        <span className="text-2xl font-bold">
                          {data.change_percentage > 0 ? '+' : ''}
                          {data.change_percentage}%
                        </span>
                        <span className={`ml-2 ${data.change_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.change_percentage > 0 ? (
                            <ArrowUp className="h-5 w-5" />
                          ) : (
                            <ArrowDown className="h-5 w-5" />
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}