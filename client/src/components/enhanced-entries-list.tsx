import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pin, PinOff, Download, FolderOpen, MoreVertical, Search, Filter, Calendar, Folder } from "lucide-react";

import { EntrySearchFilters } from "@/components/entry-search-filters";
import { FolderManager } from "@/components/folder-manager";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [sidebarFilter, setSidebarFilter] = useState<string>("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for entries
  const { data: entries, isLoading } = useQuery({
    queryKey: searchFilters ? ["/api/entries/search", searchFilters] : ["/api/entries"],
    queryFn: () => {
      if (searchFilters) {
        const params = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value) params.append(key, value as string);
        });
        return fetch(`/api/entries/search?${params}`).then(res => res.json());
      }
      return fetch("/api/entries").then(res => res.json());
    },
  });

  // Query for folders
  const { data: folders } = useQuery({
    queryKey: ["/api/folders"],
  });

  // Pin mutation
  const pinMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      await apiRequest(`/api/entries/${entry.id}/pin`, "PATCH", { isPinned: !entry.isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry updated",
        description: "Entry pinned status updated successfully.",
      });
    },
  });

  // Move to folder mutation
  const moveFolderMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: number; folderId: number | null }) => {
      await apiRequest(`/api/entries/${id}/folder`, "PATCH", { folderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry moved",
        description: "Entry moved to folder successfully.",
      });
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async (entryIds: number[]) => {
      const response = await fetch("/api/entries/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryIds }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to download entries");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Download complete",
        description: "Your journal entries have been downloaded.",
      });
    },
  });

  // Filter entries based on sidebar selection
  const filteredEntries = (() => {
    if (!entries) return [];
    
    let filtered = entries;
    
    // Apply sidebar filter
    if (sidebarFilter === "pinned") {
      filtered = entries.filter((entry: JournalEntry) => entry.isPinned);
    } else if (sidebarFilter === "no-folder") {
      filtered = entries.filter((entry: JournalEntry) => !entry.folderId);
    } else if (sidebarFilter.startsWith("folder-")) {
      const folderId = parseInt(sidebarFilter.replace("folder-", ""));
      filtered = entries.filter((entry: JournalEntry) => entry.folderId === folderId);
    } else if (sidebarFilter === "all" || sidebarFilter === "") {
      filtered = entries;
    }
    
    return filtered;
  })();

  const handleSelectAll = () => {
    if (selectedEntries.length === filteredEntries?.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(filteredEntries?.map((entry: JournalEntry) => entry.id) || []);
    }
  };

  const handleSelectEntry = (id: number) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  const handleClearSearch = () => {
    setSearchFilters(null);
  };

  const handlePin = (entry: JournalEntry) => {
    pinMutation.mutate(entry);
  };

  const handleMoveToFolder = (entryId: number, folderId: number | null) => {
    moveFolderMutation.mutate({ id: entryId, folderId });
  };

  const handleDownloadSelected = () => {
    if (selectedEntries.length === 0) return;
    downloadMutation.mutate(selectedEntries);
  };

  const handleDownloadSingle = (entryId: number) => {
    downloadMutation.mutate([entryId]);
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

  return (
    <div className="space-y-6">
      {/* Mobile Filter Dropdown */}
      <div className="md:hidden">
        <Card>
          <CardContent className="p-4">
            <Select value={sidebarFilter} onValueChange={setSidebarFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter entries..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📚 All Entries</SelectItem>
                <SelectItem value="pinned">📌 Pinned Entries</SelectItem>
                <SelectItem value="no-folder">🗂 No Folder</SelectItem>
                {folders?.map((folder: Folder) => (
                  <SelectItem key={folder.id} value={`folder-${folder.id}`}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-6">
        {/* Desktop Sidebar */}
        <div className="w-64 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={sidebarFilter === "all" || sidebarFilter === "" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSidebarFilter("all")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              All Entries
            </Button>
            <Button
              variant={sidebarFilter === "pinned" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSidebarFilter("pinned")}
            >
              <Pin className="w-4 h-4 mr-2" />
              Pinned Entries
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Folders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={sidebarFilter === "no-folder" ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSidebarFilter("no-folder")}
            >
              <div className="w-3 h-3 rounded-full bg-gray-400 mr-2" />
              No Folder
            </Button>
            {folders?.map((folder: Folder) => (
              <Button
                key={folder.id}
                variant={sidebarFilter === `folder-${folder.id}` ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSidebarFilter(`folder-${folder.id}`)}
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </Button>
            ))}
            <Dialog open={showFolderManager} onOpenChange={setShowFolderManager}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Folder Manager</DialogTitle>
                </DialogHeader>
                <FolderManager />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

        {/* Desktop Main Content */}
        <div className="flex-1 space-y-6">
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
        {filteredEntries && filteredEntries.length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Checkbox
              checked={selectedEntries.length === filteredEntries.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">
              {selectedEntries.length === filteredEntries.length 
                ? "Deselect all" 
                : `Select all (${filteredEntries.length})`}
            </span>
            {selectedEntries.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedEntries.length} selected
              </span>
            )}
          </div>
        )}

        {/* Entries List */}
        {filteredEntries && filteredEntries.length > 0 ? (
          <div className="space-y-3">
            {filteredEntries.map((entry: JournalEntry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isSelected={selectedEntries.includes(entry.id)}
                onSelect={handleSelectEntry}
                onPin={handlePin}
                onMoveToFolder={handleMoveToFolder}
                onDownloadSingle={handleDownloadSingle}
                folders={folders}
                getFolderName={getFolderName}
                getFolderColor={getFolderColor}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {sidebarFilter ? "No entries found in this category." : 
                 searchFilters ? "No entries found matching your search criteria." : 
                 "No journal entries yet."}
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      {/* Mobile Main Content */}
      <div className="md:hidden space-y-6">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Journal Entries</h2>
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchFilters(!showSearchFilters)}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {showSearchFilters ? "Hide Filters" : "Search & Filter"}
            </Button>
            {selectedEntries.length > 0 && (
              <Button
                onClick={handleDownloadSelected}
                disabled={downloadMutation.isPending}
                size="sm"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Selected ({selectedEntries.length})
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Filters */}
        {showSearchFilters && (
          <EntrySearchFilters 
            onSearch={handleSearch}
            onClear={handleClearSearch}
          />
        )}

        {/* Mobile Bulk Selection */}
        {filteredEntries && filteredEntries.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Checkbox
              checked={selectedEntries.length === filteredEntries.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-900 dark:text-white">
              {selectedEntries.length === filteredEntries.length 
                ? "Deselect all" 
                : `Select all (${filteredEntries.length})`}
            </span>
            {selectedEntries.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedEntries.length} selected
              </span>
            )}
          </div>
        )}

        {/* Mobile Entries List */}
        {filteredEntries && filteredEntries.length > 0 ? (
          <div className="space-y-3">
            {filteredEntries.map((entry: JournalEntry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isSelected={selectedEntries.includes(entry.id)}
                onSelect={handleSelectEntry}
                onPin={handlePin}
                onMoveToFolder={handleMoveToFolder}
                onDownloadSingle={handleDownloadSingle}
                folders={folders}
                getFolderName={getFolderName}
                getFolderColor={getFolderColor}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">
                {sidebarFilter ? "No entries found in this category." : 
                 searchFilters ? "No entries found matching your search criteria." : 
                 "No journal entries yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface EntryCardProps {
  entry: JournalEntry;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onPin: (entry: JournalEntry) => void;
  onMoveToFolder: (id: number, folderId: number | null) => void;
  onDownloadSingle: (id: number) => void;
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
  onDownloadSingle,
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
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(entry.id)}
            />
            {entry.isPinned && <Pin className="w-4 h-4 text-blue-500" />}
            <span className="text-sm text-gray-800 dark:text-gray-400" style={{ color: 'rgb(17, 24, 39)' }}>
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <span className="text-lg leading-none">⋯</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onPin(entry)}>
                {entry.isPinned ? "📌 Unpin Entry" : "📌 Pin Entry"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownloadSingle(entry.id)}>
                ⬇ Download Entry
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between w-full">
                  <span>🗂 Move to Folder</span>
                  <Select
                    value={entry.folderId?.toString() || "none"}
                    onValueChange={(value) => 
                      onMoveToFolder(entry.id, value === "none" ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-6 text-xs border-none p-0 focus:ring-0 w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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

        <p className="text-gray-900 dark:text-gray-200 mb-3 line-clamp-3 break-words" style={{ color: 'rgb(17, 24, 39)' }}>
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
            <span className="text-xs text-gray-800 dark:text-gray-400" style={{ color: 'rgb(17, 24, 39)' }}>
              {getFolderName(entry.folderId)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}