import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { BULLET_SYMBOLS } from "@shared/schema";

interface BulletSymbolSelectorProps {
  selectedSymbol?: string;
  onSymbolSelect: (symbol: string) => void;
}

export function BulletSymbolSelector({ selectedSymbol, onSymbolSelect }: BulletSymbolSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const symbolCategories = {
    "Tasks": ["•", "✔", "→", "✖"],
    "Events & Goals": ["○", "🎯", "🏆"],
    "Notes & Insights": ["–", "🪶", "🌱", "❓"],
    "Themes & Direction": ["🧭", "🔥", "★"],
    "Special": ["🧙", "📸", "📌", "🧩"],
  };

  const handleSymbolClick = (symbol: string) => {
    onSymbolSelect(symbol);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-32 justify-start"
          size="sm"
        >
          {selectedSymbol ? (
            <span className="flex items-center gap-2">
              {selectedSymbol} <span className="text-xs">{BULLET_SYMBOLS[selectedSymbol as keyof typeof BULLET_SYMBOLS]?.name}</span>
            </span>
          ) : (
            "Add symbol"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="bottom" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Choose a bullet symbol:</div>
          
          {Object.entries(symbolCategories).map(([category, symbols]) => (
            <div key={category} className="space-y-2">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {symbols.map((symbol) => {
                  const config = BULLET_SYMBOLS[symbol as keyof typeof BULLET_SYMBOLS];
                  return (
                    <Button
                      key={symbol}
                      variant={selectedSymbol === symbol ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2 h-8 px-3"
                      onClick={() => handleSymbolClick(symbol)}
                    >
                      <span className="text-base">{symbol}</span>
                      <span className="text-xs">{config?.name}</span>
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
  );
}