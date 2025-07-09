import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { BULLET_SYMBOLS } from "@shared/schema";

interface BulletSymbolSelectorProps {
  selectedSymbol?: string;
  onSymbolSelect: (symbol: string) => void;
}

export function BulletSymbolSelector({ selectedSymbol, onSymbolSelect }: BulletSymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Common symbols displayed directly
  const commonSymbols = ["•", "○", "–", "❓", "★"];
  
  // Additional symbols in dropdown
  const additionalSymbolCategories = {
    "Tasks": ["✔", "→", "✖"],
    "Goals & Growth": ["🎯", "🏆", "🌱"],
    "Insights & Direction": ["🪶", "🧭", "🔥"],
    "Special": ["🧙", "📸", "📌", "🧩"],
  };

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Common symbols - always visible */}
      <div className="flex flex-wrap gap-2">
        {commonSymbols.map((symbol) => {
          const config = BULLET_SYMBOLS[symbol as keyof typeof BULLET_SYMBOLS];
          return (
            <Button
              key={symbol}
              variant={selectedSymbol === symbol ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2 h-8 px-3 text-xs"
              onClick={() => onSymbolSelect(symbol)}
              title={config?.name}
            >
              <span className="text-base">{symbol}</span>
              <span className="hidden sm:inline">{config?.name}</span>
            </Button>
          );
        })}
        
        {/* More symbols dropdown */}
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
              
              {Object.entries(additionalSymbolCategories).map(([category, symbols]) => (
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

              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tip: You can also type the symbol directly at the start of your entry
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}