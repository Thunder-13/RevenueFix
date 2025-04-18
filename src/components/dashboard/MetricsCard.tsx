import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  infoTooltip?: string;
  onClick?: () => void;
  loading?: boolean;
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
  infoTooltip,
  onClick,
  loading = false
}: MetricsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(126, 58, 242, 0.1)" }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "metrics-card overflow-hidden border-[#7e3af2]/10 transition-all duration-300", 
          className,
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {infoTooltip && (
              <div className="relative group">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded-md bg-black px-2 py-1 text-xs text-white group-hover:block">
                  {infoTooltip}
                </div>
              </div>
            )}
          </div>
          <motion.div 
            className="rounded-full bg-[#7e3af2]/10 p-2 text-[#7e3af2]"
            animate={{ 
              scale: isHovered ? 1.1 : 1,
              backgroundColor: isHovered ? "rgba(126, 58, 242, 0.15)" : "rgba(126, 58, 242, 0.1)"
            }}
          >
            {icon}
          </motion.div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 w-24 rounded bg-gray-200"></div>
              <div className="mt-1 h-4 w-32 rounded bg-gray-100"></div>
            </div>
          ) : (
            <>
              <motion.div 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {prefix}
                {typeof value === "number" ? value.toLocaleString() : value}
                {suffix}
              </motion.div>
              {(description || trend !== undefined) && (
                <p className="text-xs text-muted-foreground">
                  {trend !== undefined && (
                    <motion.span
                      className={cn(
                        "mr-1 inline-flex items-center",
                        trend > 0
                          ? "text-green-500"
                          : trend < 0
                          ? "text-red-500"
                          : "text-gray-500"
                      )}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {trend > 0 ? (
                        <ArrowUpIcon className="mr-1 h-3 w-3" />
                      ) : trend < 0 ? (
                        <ArrowDownIcon className="mr-1 h-3 w-3" />
                      ) : null}
                      {Math.abs(trend)}%
                    </motion.span>
                  )}
                  {description}
                </p>
              )}
            </>
          )}
        </CardContent>
        
        {isHovered && (
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-[#7e3af2]" 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Card>
    </motion.div>
  );
}