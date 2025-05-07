// RevenueChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ReferenceLine, Bar, BarChart } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, Maximize2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [timeRange, setTimeRange] = useState<string>("12d");
  const [chartType, setChartType] = useState<"bar" | "area" | "line">(type);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [monthYear, setMonthYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const allowMonthYearFilter = true;

  const monthYearOptions = [
    { value: "2025-05", label: "May 2025" },
    { value: "2025-04", label: "April 2025" },
    { value: "2025-03", label: "March 2025" },
  ];

  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
  };

  const average = data?.length > 0 
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length 
    : 0;

  const filteredData = (() => {
    if (!data || data.length === 0) return [];
    let tempData = [...data];

    if (monthYear) {
      tempData = tempData.filter(item => item.date.startsWith(monthYear));
    } else if (startDate && endDate) {
      tempData = tempData.filter(item => item.date >= startDate && item.date <= endDate);
    } else if (timeRange !== "all" && timeRange) {
      const days = parseInt(timeRange);
      if (!isNaN(days) && days < tempData.length) {
        tempData = tempData.slice(-days);
      }
    }

    return tempData;
  })();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateStr.split('-');
        return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
      }
      return dateStr;
    }
    const [year, month] = dateStr.split('-');
    return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  };

  const handleDownload = () => {
    alert("Chart download functionality would be implemented here");
  };

  const renderChart = () => {
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    const sharedProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    const axisProps = {
      XAxis: (
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={formatDate}
        />
      ),
      YAxis: (
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) =>
            value >= 1_000_000
              ? `${(value / 1_000_000).toFixed(1)}M`
              : value >= 1_000
              ? `${(value / 1_000).toFixed(1)}K`
              : value
          }
        />
      ),
    };

    const tooltip = (
      <Tooltip
        formatter={(value: number) => formatValue(value)}
        labelFormatter={formatDate}
        contentStyle={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#7e3af2",
          borderRadius: "6px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      />
    );

    const avgLine = showAverage && (
      <ReferenceLine
        y={average}
        stroke="#ff6b6b"
        strokeDasharray="3 3"
        label={{
          value: "Average",
          position: "insideBottomRight",
          fill: "#ff6b6b",
          fontSize: 12,
        }}
      />
    );

    const renderSecondary = (Component: any) =>
      secondaryData?.map((item) => (
        <Component
          key={item.key}
          type="monotone"
          dataKey={item.key}
          name={item.name}
          stroke={item.color}
          strokeWidth={2}
          fill={Component === Area ? (showGradient ? `url(#color${item.key})` : item.color) : undefined}
          fillOpacity={showGradient ? 1 : 0.2}
          dot={{ r: 3, fill: item.color }}
          activeDot={{ r: 6, fill: item.color, stroke: "white", strokeWidth: 2 }}
          animationDuration={1500}
        />
      ));

    switch (chartType) {
      case "line":
        return (
          <LineChart {...sharedProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            {axisProps.XAxis}
            {axisProps.YAxis}
            {tooltip}
            <Legend />
            {avgLine}
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
            {renderSecondary(Line)}
          </LineChart>
        );
      case "area":
        return (
          <AreaChart {...sharedProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7e3af2" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7e3af2" stopOpacity={0.1} />
              </linearGradient>
              {secondaryData?.map((item) => (
                <linearGradient key={item.key} id={`color${item.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={item.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            {axisProps.XAxis}
            {axisProps.YAxis}
            {tooltip}
            <Legend />
            {avgLine}
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
            {renderSecondary(Area)}
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart {...sharedProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            {axisProps.XAxis}
            {axisProps.YAxis}
            {tooltip}
            <Legend />
            {avgLine}
            <Bar dataKey="value" name="Value" fill="#7e3af2" radius={[4, 4, 0, 0]} animationDuration={1500} />
            {renderSecondary(Bar)}
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
          <div className="flex items-center gap-2 flex-wrap">
            {allowTimeRange && (
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6d">6 month</SelectItem>
                  <SelectItem value="12d">1 year</SelectItem>
                  <SelectItem value="24d">2 years</SelectItem>
                  <SelectItem value="36d">3 years</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            )}
           
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 rounded border px-2 text-sm" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 rounded border px-2 text-sm" />
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
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
