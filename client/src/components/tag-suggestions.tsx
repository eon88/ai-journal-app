import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tags } from "lucide-react";

interface TagSuggestionsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TAG_SUGGESTIONS = {
  "Mind & Emotion": [
    "clarity", "confusion", "overthinking", "gratitude", "frustration", 
    "calm", "focus", "resistance", "motivation"
  ],
  "Inner Work": [
    "self-awareness", "healing", "identity", "habits", "triggers", 
    "breakthroughs", "patterns", "beliefs"
  ],
  "Goals & Progress": [
    "goals", "discipline", "progress", "action", "planning", 
    "productivity", "momentum", "stuck"
  ],
  "Relationships": [
    "family", "friendships", "communication", "conflict", "boundaries", 
    "support", "connection", "loneliness"
  ],
  "Life Design": [
    "vision", "values", "purpose", "career", "decisions", 
    "dreams", "future-self", "priorities"
  ],
  "Spiritual & Reflective": [
    "faith", "meaning", "stillness", "meditation", "integrity", 
    "truth", "prayer", "inner-voice"
  ],
  "Health & Energy": [
    "sleep", "nutrition", "exercise", "rest", "stress", 
    "energy", "tension", "balance"
  ]
};

export function TagSuggestions({ tags, onTagsChange }: TagSuggestionsProps) {
  const [newTag, setNewTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<{category: string, tags: string[]}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten all suggestions for easy searching
  const allTags = Object.values(TAG_SUGGESTIONS).flat();

  useEffect(() => {
    if (newTag.length >= 2) {
      const filtered = Object.entries(TAG_SUGGESTIONS)
        .map(([category, categoryTags]) => ({
          category,
          tags: categoryTags.filter(tag => 
            tag.toLowerCase().includes(newTag.toLowerCase()) && 
            !tags.includes(tag)
          )
        }))
        .filter(item => item.tags.length > 0);
      
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [newTag, tags]);

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onTagsChange([...tags, tag.trim()]);
      setNewTag("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Display current tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              #{tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Tag input with suggestions */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <Tags className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => newTag.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Add tags... (start typing for suggestions)"
              className="pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => addTag(newTag)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredSuggestions.map(({ category, tags: categoryTags }) => (
              <div key={category} className="p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  🔹 {category}
                </div>
                <div className="flex flex-wrap gap-1">
                  {categoryTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick suggestions when input is empty */}
      {!newTag && tags.length === 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Popular tags: {allTags.slice(0, 8).map((tag, index) => (
            <button
              key={tag}
              type="button"
              className="mx-1 underline hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => addTag(tag)}
            >
              {tag}{index < 7 ? "," : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}