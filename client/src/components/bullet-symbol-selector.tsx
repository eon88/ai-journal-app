import { Button } from "@/components/ui/button";
import { BULLET_SYMBOLS } from "@shared/schema";

interface BulletSymbolSelectorProps {
  selectedSymbol?: string;
  onSymbolSelect: (symbol: string) => void;
}

export function BulletSymbolSelector({ selectedSymbol, onSymbolSelect }: BulletSymbolSelectorProps) {
  const symbolCategories = {
    "Tasks": ["•", "✔", "→", "✖"],
    "Events & Goals": ["○", "🎯", "🏆"],
    "Notes & Insights": ["–", "🪶", "🌱", "❓"],
    "Themes & Direction": ["🧭", "🔥", "★"],
    "Special": ["🧙", "📸", "📌", "🧩"],
  };

  return (
    <div className="space-y-3">
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
          </div>
        </div>
      ))}
      
      <div className="pt-2 border-t">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tip: You can also type the symbol directly at the start of your entry
        </div>
      </div>
    </div>
  );
}