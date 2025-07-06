import { Calendar, User } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <header className="glass-overlay shadow-sm border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">AI Bullet Journal</h1>
              <p className="text-sm text-muted-foreground">Reflect, grow, and discover insights</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Today, {formatDate(currentTime)}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <ThemeToggle />
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <User className="text-accent-foreground text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
