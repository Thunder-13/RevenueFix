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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  return (
    <div
      className={cn(
        "fixed left-5 top-24 h-[calc(100vh-8rem)] w-[15%] min-w-[200px] max-w-[250px] rounded-xl", // Added fixed positioning
        "bg-gradient-to-b from-[#7e3af2] to-[#1e1e2d] dark:from-[#1e1e2d] dark:to-[#7e3af2]",
        "flex flex-col shadow-lg",
        className
      )}
    >
      {/* Navigation Items with custom scrollbar */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-[3%]">
        {children}
      </div>

      {/* Theme Toggle - Fixed at bottom */}
      <div className="p-[4%] border-t border-gray-700 bg-inherit mt-auto">
        <button
          onClick={() => {
            setIsDarkMode(!isDarkMode);
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
          }}
          className="w-full flex items-center justify-center gap-[2%] p-[2%] rounded-md 
                   text-white hover:bg-white/10 transition-colors"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-[12%] h-auto" />
              <span className="text-[0.75rem]">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-[12%] h-auto" />
              <span className="text-[0.75rem]">Dark Mode</span>
            </>
          )}
        </button>
      </div>
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
  return (
    <li
      className={cn(
        "group flex items-center gap-[3%] p-[3%] text-[0.75rem] transition-all duration-200",
        isActive
          ? "bg-[#7e3af2] text-white font-bold shadow-lg border-l-4 border-[#ffffff]"
          : "text-white hover:bg-[#7e3af2]/20 hover:text-white",
        "justify-start"
      )}
    >
      <Link to={url} className="flex items-center gap-[3%] w-full">
        <Icon
          className={cn(
            "w-[15%] h-auto transition-transform duration-200",
            isActive ? "text-white scale-110" : "text-white group-hover:scale-110"
          )}
        />
        <span className="whitespace-nowrap">{children}</span>
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
      { title: "Voice", url: "/voice", icon: PhoneCall },
      { title: "Data", url: "/data", icon: Database },
      { title: "SMS", url: "/sms", icon: MessageSquare },
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
  // Always keep sidebar expanded
  const [expanded, setExpanded] = useState(true);

  // No need to save expanded state since it's always true

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
                    <SidebarSubmenu items={item.submenu} expanded={expanded} />
                  )}
                </li>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarContext.Provider>
  );
 }

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AppSidebar />
      <div className="flex-1 ml-[calc(30%+16rem)] p-6"> {/* Adjusted margin for fixed sidebar */}
        <main className="w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-[2%] min-h-[95vh]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Update submenu styles
function SidebarSubmenu({ items, expanded }: { items: any[]; expanded: boolean }) {
  return (
    <ul className="ml-[8%] w-[92%]">
      {items.map((subItem) => (
        <SidebarMenuItem
          key={subItem.title}
          icon={subItem.icon}
          isActive={false}
          url={subItem.url}
        >
          {subItem.title}
        </SidebarMenuItem>
      ))}
    </ul>
  );
}
