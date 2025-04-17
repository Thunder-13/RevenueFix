import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ReferenceLine } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataPoint {
  date: string;
  value: number;
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
  type?: "line" | "area";
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
  type = "area"
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [chartType, setChartType] = useState<"line" | "area">(type);
  
  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toLocaleString()}${valueSuffix}`;
  };
  
  // Calculate average value
  const average = data.length > 0 
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length 
    : 0;
  
  // Filter data based on selected time range
  const filteredData = (() => {
    if (timeRange === "all" || !timeRange) return data;
    
    const days = parseInt(timeRange);
    if (isNaN(days) || days >= data.length) return data;
    
    return data.slice(-days);
  })();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>{title}</CardTitle>
        {showControls && (
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="14d">14 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex rounded-md border">
              <Button 
                variant={chartType === "area" ? "default" : "ghost"} 
                size="sm" 
                className="h-8 rounded-l-none"
                onClick={() => setChartType("area")}
              >
                Area
              </Button>
              <Button 
                variant={chartType === "line" ? "default" : "ghost"} 
                size="sm" 
                className="h-8 rounded-r-none border-r"
                onClick={() => setChartType("line")}
              >
                Line
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      {description && <p className="px-6 text-sm text-muted-foreground">{description}</p>}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === "line" ? (
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
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
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
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString();
                }}
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
                name="Revenue"
                stroke="#7e3af2"
                strokeWidth={2}
                dot={{ r: 3, fill: "#7e3af2" }}
                activeDot={{ r: 6, fill: "#7e3af2", stroke: "white", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          ) : (
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
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
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
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return date.toLocaleDateString();
                }}
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
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                name="Revenue"
                stroke="#7e3af2"
                strokeWidth={2}
                fill={showGradient ? "url(#colorValue)" : "#7e3af2"}
                fillOpacity={showGradient ? 1 : 0.2}
                activeDot={{ r: 6, fill: "#7e3af2", stroke: "white", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}