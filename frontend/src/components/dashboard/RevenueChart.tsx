import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ReferenceLine, Bar, BarChart} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Maximize2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

interface RevenueChartProps {
  title: string;
  data: DataPoint[];
  valuePrefix?: string;
  valueSuffix?: string;
  description?: string;
  className?: string;
  showControls?: boolean;
  showGradient?: boolean;
  showAverage?: boolean;
  type?: "line" | "area" | "bar";
  height?: number;
  onClick?: () => void;
  secondaryData?: { key: string; name: string; color: string }[];
  allowFullscreen?: boolean;
  allowDownload?: boolean;
  showInfoTooltip?: boolean;
  infoTooltipContent?: string;
  allowTimeRange?: boolean;
}

export function RevenueChart({
  title,
  data,
  valuePrefix = "",
  valueSuffix = "",
  description,
  className,
  showControls = true,
  showGradient = true,
  showAverage = true,
  type = "area",
  height = 300,
  onClick,
  secondaryData,
  allowFullscreen = true,
  allowDownload = true,
  showInfoTooltip = false,
  infoTooltipContent,
  allowTimeRange = true,
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [chartType, setChartType] = useState<"bar" | "area" | "line">(type);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  
  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
  };
  
  // Calculate average value
  const average = data?.length > 0 
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length 
    : 0;
  
  // Filter data based on selected time range
  const filteredData = (() => {
    if (!data || data.length === 0) return [];
    if (timeRange === "all" || !timeRange) return data;
    
    const days = parseInt(timeRange);
    if (isNaN(days) || days >= data.length) return data;
    
    return data.slice(-days);
  })();

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Check if it's a valid date
    if (isNaN(date.getTime())) {
      // Try parsing as YYYY-MM (monthly data)
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateStr.split('-');
        return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      }
      return dateStr;
    }
    return date.toLocaleDateString();
  };

  // Handle chart download
  const handleDownload = () => {
    // This is a simplified version - in a real app, you'd use a library like html2canvas
    alert("Chart download functionality would be implemented here");
  };

  // Memoize chart components to reduce render complexity
  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart
            data={filteredData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip 
              formatter={(value: number) => formatValue(value)}
              labelFormatter={formatDate}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#7e3af2',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {showAverage && (
              <ReferenceLine 
                y={average} 
                stroke="#ff6b6b" 
                strokeDasharray="3 3"
                label={{ 
                  value: 'Average', 
                  position: 'insideBottomRight',
                  fill: '#ff6b6b',
                  fontSize: 12
                }} 
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#7e3af2"
              strokeWidth={2}
              dot={{ r: 3, fill: "#7e3af2" }}
              activeDot={{ r: 6, fill: "#7e3af2", stroke: "white", strokeWidth: 2 }}
              animationDuration={1500}
            />
            {secondaryData && secondaryData.map((item, index) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                strokeWidth={2}
                dot={{ r: 3, fill: item.color }}
                activeDot={{ r: 6, fill: item.color, stroke: "white", strokeWidth: 2 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart
            data={filteredData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip 
              formatter={(value: number) => formatValue(value)}
              labelFormatter={formatDate}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#7e3af2',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {showAverage && (
              <ReferenceLine 
                y={average} 
                stroke="#ff6b6b" 
                strokeDasharray="3 3"
                label={{ 
                  value: 'Average', 
                  position: 'insideBottomRight',
                  fill: '#ff6b6b',
                  fontSize: 12
                }} 
              />
            )}
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7e3af2" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#7e3af2" stopOpacity={0.1}/>
              </linearGradient>
              {secondaryData && secondaryData.map((item) => (
                <linearGradient key={`gradient-${item.key}`} id={`color${item.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              name="Value"
              stroke="#7e3af2"
              strokeWidth={2}
              fill={showGradient ? "url(#colorValue)" : "#7e3af2"}
              fillOpacity={showGradient ? 1 : 0.2}
              activeDot={{ r: 6, fill: "#7e3af2", stroke: "white", strokeWidth: 2 }}
              animationDuration={1500}
            />
            {secondaryData && secondaryData.map((item) => (
              <Area
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.name}
                stroke={item.color}
                strokeWidth={2}
                fill={showGradient ? `url(#color${item.key})` : item.color}
                fillOpacity={showGradient ? 1 : 0.2}
                activeDot={{ r: 6, fill: item.color, stroke: "white", strokeWidth: 2 }}
                animationDuration={1500}
              />
            ))}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart
            data={filteredData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value;
              }}
            />
            <Tooltip 
              formatter={(value: number) => formatValue(value)}
              labelFormatter={formatDate}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#7e3af2',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            {showAverage && (
              <ReferenceLine 
                y={average} 
                stroke="#ff6b6b" 
                strokeDasharray="3 3"
                label={{ 
                  value: 'Average', 
                  position: 'insideBottomRight',
                  fill: '#ff6b6b',
                  fontSize: 12
                }} 
              />
            )}
            <Bar
              dataKey="value"
              name="Value"
              fill="#7e3af2"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            {secondaryData && secondaryData.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.name}
                fill={item.color}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            ))}
          </BarChart>
        );
      default:
        return null;
    }
  };

  const chartContent = (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={fullscreen ? 500 : height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card className={className} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          {showInfoTooltip && (
            <div className="relative group">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block">
                {infoTooltipContent || "Chart information"}
              </div>
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
          {allowTimeRange && (
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="14d">14 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          )}            
            <Tabs defaultValue={chartType} onValueChange={(value) => setChartType(value as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="line" className="px-2 text-xs">Line</TabsTrigger>
                <TabsTrigger value="area" className="px-2 text-xs">Area</TabsTrigger>
                <TabsTrigger value="bar" className="px-2 text-xs">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-1">
              {allowFullscreen && (
                <Dialog open={fullscreen} onOpenChange={setFullscreen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{title}</DialogTitle>
                      <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {chartContent}
                  </DialogContent>
                </Dialog>
              )}
              
              {allowDownload && (
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardHeader>
      {description && (
        <div className="px-6 text-sm text-muted-foreground">
          {description}
        </div>
      )}
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {chartContent}
        </motion.div>
      </CardContent>
    </Card>
  );
}