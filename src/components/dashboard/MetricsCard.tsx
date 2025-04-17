import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function MetricsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  prefix = "",
  suffix = "",
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden border-[#7e3af2]/10 hover:shadow-md transition-all", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full bg-[#7e3af2]/10 p-2 text-[#7e3af2]">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </div>
        {(description || trend !== undefined) && (
          <p className="text-xs text-muted-foreground">
            {trend !== undefined && (
              <span
                className={cn(
                  "mr-1 inline-flex items-center",
                  trend > 0
                    ? "text-green-500"
                    : trend < 0
                    ? "text-red-500"
                    : "text-gray-500"
                )}
              >
                {trend > 0 ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : trend < 0 ? (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                ) : null}
                {Math.abs(trend)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}