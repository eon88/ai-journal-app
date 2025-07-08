import { Calendar, User, Crown, LogOut, UserCircle, Home, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Check if current user is admin
  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <header className="glass-overlay shadow-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">Life Path Companion</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Reflect, grow, and discover insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden md:flex items-center space-x-4 mr-3">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Today, {formatDate(currentTime)}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatTime(currentTime)}
              </span>
            </div>
{/* Upgrade button temporarily hidden - payment system is properly configured but in test mode */}
            <ThemeToggle />
            <Link href="/">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                <Home className="text-accent-foreground text-sm" />
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors">
                  <User className="text-accent-foreground text-sm" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                {adminCheck?.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = '/api/login';
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={async () => {
                    try {
                      // Call logout API
                      await fetch('/api/logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      // Clear any stored user data
                      localStorage.removeItem('premium_user');
                      localStorage.removeItem('user_name');
                      // Refresh the page to update auth state
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Even if logout fails, clear local data and redirect
                      localStorage.removeItem('premium_user');
                      localStorage.removeItem('user_name');
                      window.location.href = '/';
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

    </header>
  );
}
