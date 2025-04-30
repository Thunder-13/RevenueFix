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
  Sun,
  Moon,
  MessageSquare,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, createContext, useContext } from "react";
import { motion } from "framer-motion";

// Sidebar Context
const SidebarContext = createContext({
  expanded: false,
  setExpanded: (value: boolean) => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// Sidebar Component
function Sidebar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { expanded } = useSidebar();
  return (
    <div
      className={cn(
        `fixed top-24 left-4 h-[calc(100%-8rem)] z-50 ${expanded ? "w-64" : "w-16"} transition-all duration-300 
        bg-gradient-to-b from-[#7e3af2] to-[#1e1e2d] dark:from-[#1e1e2d] dark:to-[#7e3af2] 
        rounded-lg p-2 shadow-lg`, // Adjusted top and height
        className
      )}
    >
      {children}
    </div>
  );
}

function SidebarContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex-1 overflow-y-auto ${className}`}>{children}</div>;
}

function SidebarGroup({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>;
}

function SidebarGroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-4 py-2 ${className}`}>{children}</div>;
}

function SidebarGroupContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul>{children}</ul>;
}

// SidebarMenuItem Component
function SidebarMenuItem({
  children,
  icon: Icon,
  isActive,
  url,
}: {
  children: React.ReactNode;
  icon: React.ElementType;
  isActive: boolean;
  url: string;
}) {
  const { expanded } = useSidebar();
  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all duration-200",
        isActive
          ? "bg-[#7e3af2] text-white font-bold shadow-lg border-l-4 border-[#ffffff]"
          : "text-white hover:bg-[#7e3af2]/20 hover:text-white", // Ensure text is white
        expanded ? "justify-start" : "justify-center"
      )}
    >
      <Link to={url} className="flex items-center gap-3 w-full">
        <Icon
          className={cn(
            "h-6 w-6 transition-transform duration-200",
            isActive ? "text-white scale-110" : "text-white group-hover:scale-110" // Ensure icon is white
          )}
        />
        {expanded && <span className="whitespace-nowrap">{children}</span>}
      </Link>
    </li>
  );
}

// Helper function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Sidebar Items
const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "CRM vs Billing", url: "/crm-billing", icon: Database },
  {
    title: "Network vs Billing",
    url: "/network-billing",
    icon: Network,
    submenu: [
      { title: "Voice", url: "/network-billing-voice", icon: PhoneCall },
      { title: "Data", url: "/network-billing-data", icon: Database },
      { title: "SMS", url: "/network-billing-sms", icon: MessageSquare },
    ],
  },
  { title: "CRM Insights", url: "/crm-insights", icon: HeartPulse },
  { title: "Alarm Management", url: "/alarm-management", icon: Bell },
  { title: "Case Management", url: "/case-management", icon: FolderKanban },
  { title: "User Management", url: "/user-management", icon: UserCog },
  { title: "Upcoming Features", url: "/upcoming-features", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

// Main Sidebar Component
export function AppSidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(() => {
    const savedState = localStorage.getItem("sidebar-expanded");
    return savedState === "true";
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      document.body.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", expanded.toString());
  }, [expanded]);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      <Sidebar>
        {/* Sidebar Content */}
        <SidebarContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <li key={item.title}>
                  <SidebarMenuItem
                    icon={item.icon}
                    isActive={isActive}
                    url={item.url}
                  >
                    {item.title}
                  </SidebarMenuItem>
                  {item.submenu && expanded && (
                    <ul className="ml-6">
                      {item.submenu.map((subItem) => {
                        const isSubActive = location.pathname === subItem.url;
                        return (
                          <SidebarMenuItem
                            key={subItem.title}
                            icon={subItem.icon}
                            isActive={isSubActive}
                            url={subItem.url}
                          >
                            {subItem.title}
                          </SidebarMenuItem>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* Theme Toggle Button */}
        <div className="absolute bottom-16 left-0 w-full flex justify-center">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-8 w-8 text-white hover:bg-[#7e3af2]/10 transition-colors duration-200 rounded-full"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Collapse/Expand Button */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 text-white hover:bg-[#7e3af2]/10 transition-colors duration-200 rounded-full"
          >
            {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </Sidebar>
    </SidebarContext.Provider>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 ml-16 md:ml-64">
        {children}
      </div>
    </div>
  );
}
