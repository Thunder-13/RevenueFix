import { Bell, Settings, User, Menu } from "lucide-react";
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

export function Header() {
  const isMobile = useIsMobile();
  const { expanded, setExpanded } = useSidebar();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white dark:bg-[#1e1e2d] px-4 md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setExpanded(!expanded)}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {isMobile && (
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#7e3af2] text-white">
              RF
            </div>
            <span className="text-lg font-semibold">RevenueFix</span>
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="text-[#7e3af2] border-[#7e3af2]/20">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="text-[#7e3af2] border-[#7e3af2]/20">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            {user && (
              <div className="px-2 py-1.5 text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/settings" className="flex w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/settings" className="flex w-full">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link to="/logout" className="flex w-full">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}