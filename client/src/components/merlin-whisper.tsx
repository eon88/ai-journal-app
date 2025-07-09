import { useState, useEffect } from "react";
import { Zap, Sparkles, Star, Crown } from "lucide-react";
import merlinWizardImage from "@assets/ChatGPT Image Jul 6, 2025, 01_31_56 PM_1751805312463.png";

const MERLIN_WHISPERS = [
  {
    text: "Psst... write daily for 3 days and the ancient forces will double thy XP gains.",
    icon: <Zap className="w-4 h-4" />,
    color: "from-orange-400 to-red-500"
  },
  {
    text: "The wise know that each journal entry brings 10 XP... but deeper thoughts yield more.",
    icon: <Star className="w-4 h-4" />,
    color: "from-purple-400 to-indigo-500"
  },
  {
    text: "Level 2 unlocks the weekly visions... thy mind's eye shall open to patterns.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "from-blue-400 to-cyan-500"
  },
  {
    text: "Tag thy entries with intention... the mystical threads connect all things.",
    icon: <Crown className="w-4 h-4" />,
    color: "from-green-400 to-emerald-500"
  },
  {
    text: "Pin thy most sacred thoughts... they hold power beyond ordinary words.",
    icon: <Star className="w-4 h-4" />,
    color: "from-yellow-400 to-orange-500"
  },
  {
    text: "The daily challenges... complete them for bonus XP flows like hidden springs.",
    icon: <Zap className="w-4 h-4" />,
    color: "from-pink-400 to-rose-500"
  },
  {
    text: "At Level 5, the goal system awakens... thy true purpose shall be revealed.",
    icon: <Crown className="w-4 h-4" />,
    color: "from-indigo-400 to-purple-500"
  },
  {
    text: "Monthly reflections at Level 3... the grand tapestry begins to show itself.",
    icon: <Sparkles className="w-4 h-4" />,
    color: "from-teal-400 to-blue-500"
  },
  {
    text: "Mood tracking unlocks insights... thy emotional patterns reveal hidden truths.",
    icon: <Star className="w-4 h-4" />,
    color: "from-violet-400 to-pink-500"
  },
  {
    text: "Seven days of writing unlocks new symbols... ancient knowledge awaits thee.",
    icon: <Zap className="w-4 h-4" />,
    color: "from-amber-400 to-yellow-500"
  }
];

export function MerlinWhisper() {
  const [currentWhisper, setCurrentWhisper] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show on desktop (hidden on mobile)
    const checkDesktop = () => window.innerWidth >= 768;
    
    if (!checkDesktop()) return;

    const whisperInterval = setInterval(() => {
      // 20% chance to show a whisper every 20-40 seconds
      if (Math.random() < 0.2) {
        const randomWhisper = MERLIN_WHISPERS[Math.floor(Math.random() * MERLIN_WHISPERS.length)];
        setCurrentWhisper(randomWhisper);
        setIsVisible(true);
        
        // Show for 6 seconds, then fade out
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => setCurrentWhisper(null), 500);
        }, 6000);
      }
    }, Math.random() * 20000 + 20000); // 20-40 seconds

    return () => clearInterval(whisperInterval);
  }, []);

  if (!currentWhisper) return null;

  return (
    <div className="hidden md:block fixed top-6 right-28 z-40">
      <div className="relative">        
        {/* Whisper Bubble - positioned to the left of existing Merlin */}
        <div className={`absolute top-0 right-0 w-80 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          <div className={`bg-gradient-to-br ${currentWhisper.color} p-4 rounded-2xl rounded-br-sm shadow-2xl border border-white/20`}>
            <div className="flex items-start gap-3">
              <div className="text-white/80 mt-1">
                {currentWhisper.icon}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium text-sm leading-relaxed italic">
                  {currentWhisper.text}
                </p>
                <div className="mt-2 text-xs text-white/70 font-semibold">
                  — Merlin whispers
                </div>
              </div>
            </div>
          </div>
          
          {/* Speech bubble tail pointing to Merlin */}
          <div className={`absolute top-6 -right-3 w-0 h-0 border-l-[12px] border-t-[12px] border-b-[12px] border-l-transparent border-t-transparent border-b-transparent`} 
               style={{
                 borderLeftColor: `rgb(251 146 60)`, // Default to orange, will be overridden by gradient
                 filter: 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))'
               }}>
          </div>
        </div>
        
        {/* Magical sparkles around the whisper area */}
        {isVisible && (
          <div className="absolute -inset-4 pointer-events-none">
            <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
            <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
            <div className="absolute bottom-8 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}