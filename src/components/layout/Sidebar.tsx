import {
  Home,
  BarChart3,
  Network,
  FileText,
  Briefcase,
  Users,
  PhoneCall,
  Radio,
  HeartPulse,
  Bell,
  UserCog,
  FolderKanban,
  Sparkles,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Database,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Network vs Billing",
    url: "/network-billing",
    icon: Network,
  },
  {
    title: "Mediation vs Billing",
    url: "/mediation-billing",
    icon: FileText,
  },
  {
    title: "CRM vs Billing",
    url: "/crm-billing",
    icon: Database,
  },
  {
    title: "B2B Analysis",
    url: "/b2b-analysis",
    icon: Briefcase,
  },
  {
    title: "B2C Analysis",
    url: "/b2c-analysis",
    icon: Users,
  },
  {
    title: "Fixed Line",
    url: "/fixed-line",
    icon: Radio,
  },
  {
    title: "Voice / SMS / Data",
    url: "/voice-sms-data",
    icon: PhoneCall,
  },
  {
    title: "CRM Insights",
    url: "/crm-insights",
    icon: HeartPulse,
  },
  {
    title: "Alarm Management",
    url: "/alarm-management",
    icon: Bell,
  },
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCog,
  },
  {
    title: "Case Management",
    url: "/case-management",
    icon: FolderKanban,
  },
  {
    title: "Upcoming Features",
    url: "/upcoming-features",
    icon: Sparkles,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { expanded, setExpanded } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setExpanded(false);
    }
  }, [location.pathname, isMobile, setExpanded]);

  return (
    <Sidebar className="border-r bg-white shadow-sm dark:bg-[#1e1e2d] dark:border-gray-800">
      <div className="flex h-16 items-center border-b px-4 justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#7e3af2] text-white shadow-md">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              RF
            </motion.div>
          </div>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-bold text-[#7e3af2]"
            >
              RevenueFix
            </motion.span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 text-[#7e3af2] hover:bg-[#7e3af2]/10 transition-colors duration-200"
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      <SidebarContent className="scrollbar-thin scrollbar-thumb-[#7e3af2]/20 scrollbar-track-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "sidebar-item group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200",
                        isActive
                          ? "bg-[#7e3af2]/10 text-[#7e3af2] font-medium"
                          : "text-gray-600 hover:text-[#7e3af2] dark:text-gray-300",
                        hoveredItem === item.title &&
                          !isActive &&
                          "bg-[#7e3af2]/5"
                      )}
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link
                        to={item.url}
                        className="flex w-full items-center gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            "flex h-6 w-6 items-center justify-center transition-transform duration-200",
                            isActive && "text-[#7e3af2]"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </motion.div>

                        {expanded && (
                          <span
                            className={cn(
                              "transition-all duration-200",
                              isActive && "font-medium text-[#7e3af2]"
                            )}
                          >
                            {item.title}
                          </span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#7e3af2]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
