import { Calendar, User, Crown, LogOut, UserCircle, Home, Sparkles, X } from "lucide-react";
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
import { MerlinAssistant } from "@/components/merlin-assistant";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMerlin, setShowMerlin] = useState(false);

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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Merlin button - visible on mobile only */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMerlin(true)}
                className="w-8 h-8 p-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">AI Bullet Journal</h1>
              <p className="text-sm text-muted-foreground">Reflect, grow, and discover insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-4 mr-3">
              <span className="text-sm text-muted-foreground">
                Today, {formatDate(currentTime)}
              </span>
              <span className="text-sm text-muted-foreground">
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
                  onClick={() => {
                    // Clear any stored user data
                    localStorage.removeItem('premium_user');
                    localStorage.removeItem('user_name');
                    // Redirect to logout endpoint or home page
                    window.location.href = '/api/logout';
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
      
      {/* Mobile Merlin Assistant Modal */}
      {showMerlin && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50">
          <div className="fixed inset-x-4 top-20 bottom-4 bg-background rounded-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Merlin the Wise</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMerlin(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <MerlinAssistant />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
