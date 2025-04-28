import { Bell, Settings, User, Menu, Search, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export function Header() {
  const isMobile = useIsMobile();
  const { expanded, setExpanded } = useSidebar();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [notifications, setNotifications] = useState<number>(3);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  return (
    <header className="sticky top-4 z-30 mx-auto flex h-16 w-[98%] items-center justify-between rounded-lg border-b bg-gradient-to-r from-[#7e3af2] to-[#1e1e2d] px-8 py-4 shadow-sm dark:from-[#1e1e2d] dark:to-[#7e3af2] md:px-10">
      {/* Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#7e3af2] text-white shadow-md">
          RF
        </div>
        <span className="text-xl font-bold text-white">RevenueFix</span>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="text-white"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Other Header Content */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
                >
                  {notifications}
                </motion.div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="outline" className="text-xs">
                {notifications} new
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">System Update</p>
                    <p className="text-xs text-muted-foreground">New features have been added to the dashboard</p>
                    <p className="text-xs text-muted-foreground mt-1">10 minutes ago</p>
                  </div>
                </div>
              </div>
              <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium">Critical Alert</p>
                    <p className="text-xs text-muted-foreground">Billing system discrepancy detected</p>
                    <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                  </div>
                </div>
              </div>
              <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Revenue Target</p>
                    <p className="text-xs text-muted-foreground">Monthly revenue target achieved</p>
                    <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Button variant="ghost" size="sm" className="w-full text-white">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="text-white">
          <HelpCircle className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/assets/images/user-icon.png" alt="User" />
                <AvatarFallback className="bg-[#7e3af2] text-white">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {!isMobile && (
                <>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium text-white">{user?.name || "Demo User"}</span>
                    <span className="text-xs text-gray-300">Admin</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-300" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {user && (
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-300">{user.email}</div>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/profile" className="flex w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/settings" className="flex w-full">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/logout" className="flex w-full">
                Logout
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}