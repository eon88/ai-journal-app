import { Calendar, User } from "lucide-react";
import { useEffect, useState } from "react";

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
    <header className="bg-white shadow-sm border-b border-journal-border">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-journal-primary rounded-lg flex items-center justify-center">
              <Calendar className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-journal-text">AI Bullet Journal</h1>
              <p className="text-sm text-gray-500">Reflect, grow, and discover insights</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Today, {formatDate(currentTime)}
            </span>
            <span className="text-sm text-gray-500">
              {formatTime(currentTime)}
            </span>
            <div className="w-8 h-8 bg-journal-accent rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
