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
    Menu
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
    useSidebar
  } from "@/components/ui/sidebar";
  import { Link, useLocation } from "react-router-dom";
  import { useIsMobile } from "@/hooks/use-mobile";
  import { Button } from "@/components/ui/button";
  
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
    
    return (
      <Sidebar className="border-r bg-[#f8f9fa] dark:bg-[#1e1e2d]">
        <div className="flex h-14 items-center border-b px-4 justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7e3af2] text-white">
              RF
            </div>
            {expanded && <span className="text-lg font-semibold">RevenueFix</span>}
          </Link>
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8"
            >
              {expanded ? <ChevronLeft size={18} /> : <Menu size={18} />}
            </Button>
          )}
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className={location.pathname === item.url ? 
                        "bg-[#7e3af2]/10 text-[#7e3af2] font-medium" : 
                        "text-gray-600 dark:text-gray-300"
                      }
                    >
                      <Link to={item.url}>
                        <item.icon className={cn(
                          "h-5 w-5",
                          location.pathname === item.url ? "text-[#7e3af2]" : ""
                        )} />
                        {expanded && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }
  
  // Helper function to conditionally join class names
  function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
  }