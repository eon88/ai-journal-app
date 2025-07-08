import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pin, PinOff, Download, FolderOpen, MoreVertical, Search, Filter, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { EntrySearchFilters } from "@/components/entry-search-filters";
import { FolderManager } from "@/components/folder-manager";

interface JournalEntry {
  id: number;
  content: string;
  mood?: string;
  tags?: string[];
  isPinned: boolean;
  folderId?: number;
  createdAt: string;
}

interface Folder {
  id: number;
  name: string;
  color: string;
}

const MOOD_EMOJIS: Record<string, string> = {
  excited: "🤩", happy: "😊", content: "😌", neutral: "😐", thoughtful: "🤔",
  sad: "😢", anxious: "😰", frustrated: "😤", calm: "😎", energetic: "⚡"
};

export function EnhancedEntriesList() {
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Determine which API endpoint to use based on search filters
  const shouldUseSearch = searchFilters && Object.values(searchFilters).some(val => 
    Array.isArray(val) ? val.length > 0 : val
  );

  // Fetch entries (regular or search)
  const { data: entries, isLoading } = useQuery({
    queryKey: shouldUseSearch 
      ? ["/api/entries/search", searchFilters] 
      : ["/api/entries"],
    queryFn: () => {
      if (shouldUseSearch) {
        const params = new URLSearchParams();
        if (searchFilters.query) params.append('query', searchFilters.query);
        if (searchFilters.mood) params.append('mood', searchFilters.mood);
        if (searchFilters.folderId) params.append('folderId', searchFilters.folderId);
        if (searchFilters.dateFrom) params.append('dateFrom', searchFilters.dateFrom);
        if (searchFilters.dateTo) params.append('dateTo', searchFilters.dateTo);
        if (searchFilters.tags?.length > 0) {
          searchFilters.tags.forEach((tag: string) => params.append('tags', tag));
        }
        return fetch(`/api/entries/search?${params}`).then(res => res.json());
      }
      return fetch('/api/entries').then(res => res.json());
    },
  });

  // Fetch folders
  const { data: folders } = useQuery({
    queryKey: ["/api/folders"],
  });

  // Pin/unpin mutation
  const pinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) => {
      return apiRequest(`/api/entries/${id}/pin`, "PATCH", { isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
      toast({
        title: "Entry updated",
        description: "Entry pin status has been updated.",
      });
    },
  });

  // Move to folder mutation
  const moveFolderMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: number; folderId: number | null }) => {
      return apiRequest(`/api/entries/${id}/folder`, "PATCH", { folderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
      toast({
        title: "Entry moved",
        description: "Entry has been moved to the selected folder.",
      });
    },
  });

  // Download entries mutation
  const downloadMutation = useMutation({
    mutationFn: async (entryIds: number[]) => {
      const response = await fetch("/api/entries/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryIds }),
      });
      
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      setSelectedEntries([]);
      toast({
        title: "Download complete",
        description: "Your entries have been downloaded as a text file.",
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedEntries.length === entries?.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(entries?.map((entry: JournalEntry) => entry.id) || []);
    }
  };

  const handleSelectEntry = (entryId: number) => {
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  const handleClearSearch = () => {
    setSearchFilters(null);
  };

  const handlePin = (entry: JournalEntry) => {
    pinMutation.mutate({ id: entry.id, isPinned: !entry.isPinned });
  };

  const handleMoveToFolder = (entryId: number, folderId: number | null) => {
    moveFolderMutation.mutate({ id: entryId, folderId });
  };

  const handleDownloadSelected = () => {
    if (selectedEntries.length === 0) return;
    downloadMutation.mutate(selectedEntries);
  };

  const getFolderName = (folderId?: number) => {
    if (!folderId) return "No folder";
    const folder = folders?.find((f: Folder) => f.id === folderId);
    return folder?.name || "Unknown folder";
  };

  const getFolderColor = (folderId?: number) => {
    if (!folderId) return "#94A3B8";
    const folder = folders?.find((f: Folder) => f.id === folderId);
    return folder?.color || "#94A3B8";
  };

  if (isLoading) {
    return <div>Loading entries...</div>;
  }

  const pinnedEntries = entries?.filter((entry: JournalEntry) => entry.isPinned) || [];
  const regularEntries = entries?.filter((entry: JournalEntry) => !entry.isPinned) || [];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Journal Entries</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSearchFilters(!showSearchFilters)}
          >
            <Search className="w-4 h-4 mr-2" />
            {showSearchFilters ? "Hide Filters" : "Search & Filter"}
          </Button>
          <Dialog open={showFolderManager} onOpenChange={setShowFolderManager}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="w-4 h-4 mr-2" />
                Manage Folders
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Folder Manager</DialogTitle>
              </DialogHeader>
              <FolderManager />
            </DialogContent>
          </Dialog>
          {selectedEntries.length > 0 && (
            <Button
              onClick={handleDownloadSelected}
              disabled={downloadMutation.isPending}
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Selected ({selectedEntries.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search Filters */}
      {showSearchFilters && (
        <EntrySearchFilters 
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      )}

      {/* Bulk Selection */}
      {entries && entries.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Checkbox
            checked={selectedEntries.length === entries.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm">
            {selectedEntries.length === entries.length 
              ? "Deselect all" 
              : `Select all (${entries.length})`}
          </span>
          {selectedEntries.length > 0 && (
            <span className="text-sm text-gray-500">
              {selectedEntries.length} selected
            </span>
          )}
        </div>
      )}

      {/* Pinned Entries */}
      {pinnedEntries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Pinned Entries</h3>
          </div>
          <div className="space-y-3">
            {pinnedEntries.map((entry: JournalEntry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isSelected={selectedEntries.includes(entry.id)}
                onSelect={handleSelectEntry}
                onPin={handlePin}
                onMoveToFolder={handleMoveToFolder}
                folders={folders}
                getFolderName={getFolderName}
                getFolderColor={getFolderColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Entries */}
      {regularEntries.length > 0 && (
        <div className="space-y-4">
          {pinnedEntries.length > 0 && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold">All Entries</h3>
            </div>
          )}
          <div className="space-y-3">
            {regularEntries.map((entry: JournalEntry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isSelected={selectedEntries.includes(entry.id)}
                onSelect={handleSelectEntry}
                onPin={handlePin}
                onMoveToFolder={handleMoveToFolder}
                folders={folders}
                getFolderName={getFolderName}
                getFolderColor={getFolderColor}
              />
            ))}
          </div>
        </div>
      )}

      {(!entries || entries.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {searchFilters ? "No entries found matching your search criteria." : "No journal entries yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface EntryCardProps {
  entry: JournalEntry;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onPin: (entry: JournalEntry) => void;
  onMoveToFolder: (id: number, folderId: number | null) => void;
  folders: Folder[];
  getFolderName: (folderId?: number) => string;
  getFolderColor: (folderId?: number) => string;
}

function EntryCard({ 
  entry, 
  isSelected, 
  onSelect, 
  onPin, 
  onMoveToFolder, 
  folders, 
  getFolderName, 
  getFolderColor 
}: EntryCardProps) {
  return (
    <Card className={`cursor-pointer transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    } ${entry.isPinned ? 'border-blue-300 bg-blue-50 dark:bg-blue-950' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(entry.id)}
            />
            {entry.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
            <span className="text-sm text-gray-500">
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPin(entry)}>
                {entry.isPinned ? (
                  <>
                    <PinOff className="w-4 h-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="w-4 h-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  <Select
                    value={entry.folderId?.toString() || "none"}
                    onValueChange={(value) => 
                      onMoveToFolder(entry.id, value === "none" ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-6 text-xs border-none p-0 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No folder</SelectItem>
                      {folders?.map((folder: Folder) => (
                        <SelectItem key={folder.id} value={folder.id.toString()}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
          {entry.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {entry.mood && (
              <Badge variant="secondary" className="text-xs">
                {MOOD_EMOJIS[entry.mood]} {entry.mood}
              </Badge>
            )}
            {entry.tags && entry.tags.length > 0 && (
              <>
                {entry.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {entry.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{entry.tags.length - 3} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getFolderColor(entry.folderId) }}
            />
            <span className="text-xs text-gray-500">
              {getFolderName(entry.folderId)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}