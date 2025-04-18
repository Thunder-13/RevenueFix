import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Download, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KraMetric {
  name: string;
  value: number;
  target: number;
  achievement: number;
}

interface KraData {
  title: string;
  description: string;
  metrics: KraMetric[];
  trend: { date: string; value: number }[];
}

interface KraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: KraData | null;
  onMetricClick?: (metric: KraMetric) => void;
}

export function KraDialog({ open, onOpenChange, data, onMetricClick }: KraDialogProps) {
  if (!data) return null;
  
  const getAchievementColor = (achievement: number) => {
    if (achievement >= 100) return "bg-green-500";
    if (achievement >= 90) return "bg-emerald-500";
    if (achievement >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#7e3af2]">{data.title}</DialogTitle>
          <DialogDescription>{data.description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-medium">Key Metrics</h3>
            <div className="space-y-4">
              {data.metrics.map((metric, index) => (
                <motion.div 
                  key={metric.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-[#7e3af2]/30 hover:shadow-md transition-all duration-200"
                    onClick={() => onMetricClick && onMetricClick(metric)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold">
                              {metric.name.toLowerCase().includes('revenue') ? '$' : ''}
                              {metric.value.toLocaleString()}
                              {metric.name.toLowerCase().includes('percentage') || metric.name.toLowerCase().includes('rate') ? '%' : ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              / {metric.target.toLocaleString()}
                              {metric.name.toLowerCase().includes('percentage') || metric.name.toLowerCase().includes('rate') ? '%' : ''}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-[#7e3af2]">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="mt-2">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span className={metric.achievement >= 100 ? "text-green-500" : ""}>{metric.achievement}%</span>
                        </div>
                        <Progress 
                          value={Math.min(metric.achievement, 100)} 
                          className={cn("h-2", getAchievementColor(metric.achievement))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
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
              showControls={false}
              height={300}
              type="area"
            />
            
            <div className="mt-6 rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-2 font-medium">Key Insights</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>Performance is {data.metrics[0].achievement >= 90 ? 'on track' : 'below target'} with {data.metrics[0].achievement}% achievement rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>Trend shows {data.trend[data.trend.length - 1].value > data.trend[0].value ? 'positive' : 'negative'} growth over the period</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowUpRight className="mt-0.5 h-4 w-4 text-green-500" />
                  <span>Click on any metric to view detailed breakdown</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}