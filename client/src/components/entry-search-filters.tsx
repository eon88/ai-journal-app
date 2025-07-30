import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SearchFilters {
  query: string;
  tags: string[];
  mood: string;
  folderId: string;
  dateFrom: string;
  dateTo: string;
}

interface EntrySearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

const MOOD_OPTIONS = [
  "excited", "happy", "content", "neutral", "thoughtful", 
  "sad", "anxious", "frustrated", "calm", "energetic", "apathetic"
];

export function EntrySearchFilters({ onSearch, onClear }: EntrySearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    mood: "",
    folderId: "",
    dateFrom: "",
    dateTo: ""
  });
  const [tagInput, setTagInput] = useState("");

  // Fetch user folders
  const { data: folders } = useQuery({
    queryKey: ["/api/folders"],
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      const newFilters = { ...filters, tags: [...filters.tags, tagInput.trim()] };
      setFilters(newFilters);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newFilters = { ...filters, tags: filters.tags.filter(tag => tag !== tagToRemove) };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const emptyFilters = {
      query: "",
      tags: [],
      mood: "",
      folderId: "",
      dateFrom: "",
      dateTo: ""
    };
    setFilters(emptyFilters);
    setTagInput("");
    onClear();
  };

  const hasActiveFilters = filters.query || filters.tags.length > 0 || filters.mood || 
                          filters.folderId || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Search & Filter Entries</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="ml-auto text-sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Search Query */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Search in content</label>
        <Input
          placeholder="Search your entries..."
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
      </div>

      {/* Tags Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Tags</label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag to filter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <Button onClick={handleAddTag} size="sm">Add</Button>
        </div>
        {filters.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Mood Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Mood</label>
        <Select value={filters.mood || "all"} onValueChange={(value) => setFilters({ ...filters, mood: value === "all" ? "" : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-gray-900 dark:text-white">All moods</SelectItem>
            {MOOD_OPTIONS.map((mood) => (
              <SelectItem key={mood} value={mood} className="text-gray-900 dark:text-white">
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Folder Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white">Folder</label>
        <Select value={filters.folderId || "all"} onValueChange={(value) => setFilters({ ...filters, folderId: value === "all" ? "" : value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-gray-900 dark:text-white">All folders</SelectItem>
            <SelectItem value="none" className="text-gray-900 dark:text-white">No folder</SelectItem>
            {folders?.map((folder: any) => (
              <SelectItem key={folder.id} value={folder.id.toString()} className="text-gray-900 dark:text-white">
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">From Date</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">To Date</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <Button onClick={handleSearch} className="w-full">
        <Search className="w-4 h-4 mr-2" />
        Search Entries
      </Button>
    </div>
  );
}