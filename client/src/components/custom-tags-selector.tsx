import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Settings } from "lucide-react";
import { ManageTagsModal } from "./manage-tags-modal";

interface UserCustomTag {
  id: number;
  userId: number;
  tagName: string;
  displayOrder: number;
  createdAt: string;
}

interface CustomTagsSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  manualTag: string;
  onManualTagChange: (tag: string) => void;
}

export function CustomTagsSelector({
  selectedTags,
  onTagsChange,
  manualTag,
  onManualTagChange,
}: CustomTagsSelectorProps) {
  const [showManualInput, setShowManualInput] = useState(false);

  const { data: customTags = [], isLoading } = useQuery<UserCustomTag[]>({
    queryKey: ["/api/custom-tags"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleManualTagAdd = () => {
    if (manualTag.trim()) {
      const trimmedTag = manualTag.trim();
      if (!selectedTags.includes(trimmedTag)) {
        onTagsChange([...selectedTags, trimmedTag]);
      }
      onManualTagChange("");
      setShowManualInput(false);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="text-sm text-muted-foreground">Loading tags...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tag buttons and management */}
      <div className="flex flex-wrap items-center gap-2">
        {customTags.map((tag) => (
          <Button
            key={tag.id}
            variant={selectedTags.includes(tag.tagName) ? "default" : "outline"}
            size="sm"
            onClick={() => handleTagToggle(tag.tagName)}
            className="h-8 text-sm"
          >
            {tag.tagName}
          </Button>
        ))}
        
        <ManageTagsModal
          trigger={
            <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Manage Tags</span>
            </Button>
          }
        />
      </div>

      {/* Simple manual input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a tag and press Enter"
          value={manualTag}
          onChange={(e) => onManualTagChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleManualTagAdd();
            }
          }}
          className="h-9 text-sm"
        />
        <Button
          onClick={handleManualTagAdd}
          size="sm"
          variant="outline"
          className="h-9"
          disabled={!manualTag.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Empty state */}
      {customTags.length === 0 && (
        <div className="text-sm text-muted-foreground">
          No custom tag buttons yet. Click "Manage Tags" to create reusable tag buttons.
        </div>
      )}
    </div>
  );
}