import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Lock } from "lucide-react";
import { BULLET_SYMBOLS } from "@shared/schema";
import { useProgressiveFeatures } from "@/hooks/useProgressiveFeatures";

interface BulletSymbolSelectorProps {
  selectedSymbol?: string;
  onSymbolSelect: (symbol: string) => void;
}

export function BulletSymbolSelector({ selectedSymbol, onSymbolSelect }: BulletSymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { progress } = useProgressiveFeatures();

  // Define symbol levels for progressive unlocking
  const symbolsByLevel = {
    1: ["•", "○", "–", "❓", "★"], // Level 1: 5 basic symbols
    2: ["•", "○", "–", "❓", "★", "✔", "→", "✖"], // Level 2: 8 symbols (adds task completion)
    3: ["•", "○", "–", "❓", "★", "✔", "→", "✖", "🎯", "🏆", "🌱", "🪶", "🧭", "🔥", "🧙", "📸", "📌", "🧩"] // Level 3+: All 18 symbols
  };

  // Get symbols available at current level
  const getCurrentLevelSymbols = () => {
    if (!progress) return symbolsByLevel[1];
    
    const currentLevel = progress.currentLevel;
    if (currentLevel >= 3) return symbolsByLevel[3];
    if (currentLevel >= 2) return symbolsByLevel[2];
    return symbolsByLevel[1];
  };

  const availableSymbols = getCurrentLevelSymbols();
  const commonSymbols = availableSymbols.slice(0, 5); // Always show first 5 as common
  
  // Additional symbols in dropdown (only if unlocked)
  const additionalSymbols = availableSymbols.slice(5);
  const additionalSymbolCategories = {
    "Tasks": additionalSymbols.filter(s => ["✔", "→", "✖"].includes(s)),
    "Goals & Growth": additionalSymbols.filter(s => ["🎯", "🏆", "🌱"].includes(s)),
    "Insights & Direction": additionalSymbols.filter(s => ["🪶", "🧭", "🔥"].includes(s)),
    "Special": additionalSymbols.filter(s => ["🧙", "📸", "📌", "🧩"].includes(s)),
  };

  // Filter out empty categories
  const filteredCategories = Object.fromEntries(
    Object.entries(additionalSymbolCategories).filter(([_, symbols]) => symbols.length > 0)
  );

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
    setIsOpen(false);
  };

  // Get simple labels for main symbols
  const getSymbolLabel = (symbol: string) => {
    switch (symbol) {
      case "•": return "Task";
      case "○": return "Event";
      case "–": return "Note";
      case "❓": return "Question";
      case "★": return "Important";
      default: return "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Common symbols - always visible with descriptions */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        {commonSymbols.map((symbol) => {
          const config = BULLET_SYMBOLS[symbol as keyof typeof BULLET_SYMBOLS];
          return (
            <div key={symbol} className="flex flex-col items-center">
              <Button
                variant={selectedSymbol === symbol ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0 text-sm flex-shrink-0"
                onClick={() => onSymbolSelect(symbol)}
                title={config?.name}
              >
                {symbol}
              </Button>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {getSymbolLabel(symbol)}
              </span>
            </div>
          );
        })}
        
        {/* More symbols dropdown - only show if there are additional symbols */}
        {additionalSymbols.length > 0 && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 h-8 px-3 text-xs"
              >
                More symbols
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4" side="bottom" align="start">
              <div className="space-y-4">
                <div className="text-sm font-medium">Additional symbols:</div>
                
                {Object.entries(filteredCategories).map(([category, symbols]) => (
                  <div key={category} className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {symbols.map((symbol) => {
                        const config = BULLET_SYMBOLS[symbol as keyof typeof BULLET_SYMBOLS];
                        return (
                          <Button
                            key={symbol}
                            variant={selectedSymbol === symbol ? "default" : "ghost"}
                            size="sm"
                            className="flex items-center gap-2 h-auto px-3 py-2 text-left justify-start"
                            onClick={() => handleSymbolClick(symbol)}
                          >
                            <span className="text-base flex-shrink-0">{symbol}</span>
                            <div className="flex flex-col items-start min-w-0">
                              <span className="text-xs font-medium">{config?.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                                {config?.description}
                              </span>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* Level progression hint */}
                {progress && progress.currentLevel < 3 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded text-xs">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Lock className="w-3 h-3" />
                      <span className="font-medium">Level up to unlock more symbols!</span>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 mt-1">
                      {progress.currentLevel === 1 
                        ? "Reach Level 2 to unlock task completion symbols (✔ → ✖)"
                        : "Reach Level 3 to unlock all 18 symbols including goals, insights, and special symbols"
                      }
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Tip: You can also type the symbol directly at the start of your entry
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        {/* Show level hint if no additional symbols available */}
        {additionalSymbols.length === 0 && progress && progress.currentLevel < 2 && (
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Lock className="w-3 h-3" />
            <span>More symbols unlock at Level 2</span>
          </div>
        )}
      </div>
    </div>
  );
}