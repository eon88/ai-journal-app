import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

interface EditEntryFormProps {
  entry: JournalEntry;
  onSave: (updates: Partial<JournalEntry>) => void;
  onCancel: () => void;
}

function EditEntryForm({ entry, onSave, onCancel }: EditEntryFormProps) {
  const [content, setContent] = useState(entry.content);
  const [mood, setMood] = useState(entry.mood || "");
  const [tags, setTags] = useState(entry.tags ? entry.tags.join(", ") : "");

  const handleSave = () => {
    const updates: Partial<JournalEntry> = {
      content,
      mood: mood || undefined,
      tags: tags ? tags.split(",").map(tag => tag.trim()).filter(Boolean) : undefined,
    };
    onSave(updates);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="mood">Mood</Label>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select mood..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No mood</SelectItem>
            {Object.entries(MOOD_EMOJIS).map(([moodKey, emoji]) => (
              <SelectItem key={moodKey} value={moodKey}>
                {emoji} {moodKey.charAt(0).toUpperCase() + moodKey.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="work, personal, growth..."
          className="mt-1"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export function EnhancedEntriesList() {
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [searchFilters, setSearchFilters] = useState<any>(null);
  const [sidebarFilter, setSidebarFilter] = useState<string>("all");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for entries
  const { data: entries, isLoading } = useQuery({
    queryKey: searchFilters ? ["/api/entries/search", searchFilters] : ["/api/entries", { limit: "all" }],
    queryFn: () => {
      if (searchFilters) {
        const params = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value) params.append(key, value as string);
        });
        return fetch(`/api/entries/search?${params}`, {
          credentials: "include"
        }).then(res => res.json());
      }
      return fetch("/api/entries", {
        credentials: "include"
      }).then(res => res.json());
    },
    staleTime: 0, // Always fetch fresh data
    retry: 1,
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
      // Invalidate all entry-related queries with different parameters
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: 6 }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: 1 }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: "all" }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
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
      // Invalidate all entry-related queries with different parameters
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: 6 }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: 1 }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", { limit: "all" }] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
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

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<JournalEntry> }) => {
      await apiRequest(`/api/entries/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
      setEditingEntry(null);
      toast({
        title: "Entry updated",
        description: "Entry has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update entry",
        description: error.message || "An error occurred while updating the entry.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/entries/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries/search"] });
      setDeletingEntryId(null);
      toast({
        title: "Entry deleted",
        description: "Entry has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete entry",
        description: error.message || "An error occurred while deleting the entry.",
        variant: "destructive",
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

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
  };

  const handleDelete = (entryId: number) => {
    setDeletingEntryId(entryId);
  };

  const confirmDelete = () => {
    if (deletingEntryId) {
      deleteMutation.mutate(deletingEntryId);
    }
  };

  const handleSaveEdit = (updates: Partial<JournalEntry>) => {
    if (editingEntry) {
      editMutation.mutate({ id: editingEntry.id, updates });
    }
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
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      {folder.name}
                    </div>
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
                onEdit={handleEdit}
                onDelete={handleDelete}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Journal Entries</h2>
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
            <Dialog open={showFolderManager} onOpenChange={setShowFolderManager}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
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
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {selectedEntries.length === filteredEntries.length 
                ? "Deselect all" 
                : `Select all (${filteredEntries.length})`}
            </span>
            {selectedEntries.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
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
                onEdit={handleEdit}
                onDelete={handleDelete}
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

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && <EditEntryForm entry={editingEntry} onSave={handleSaveEdit} onCancel={() => setEditingEntry(null)} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEntryId} onOpenChange={() => setDeletingEntryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingEntryId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface EntryCardProps {
  entry: JournalEntry;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
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
  onEdit,
  onDelete,
  onPin, 
  onMoveToFolder, 
  onDownloadSingle,
  folders, 
  getFolderName, 
  getFolderColor 
}: EntryCardProps) {
  const isToday = (date: string | Date) => {
    const entryDate = new Date(date);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  };

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
            {isToday(entry.createdAt) && (
              <svg 
                className="w-4 h-4 opacity-80 text-amber-600" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                title="Today's Entry"
              >
                <path d="M12 2L13.09 6.26L18 5L16.74 9.74L22 12L16.74 14.26L18 19L13.09 17.74L12 22L10.91 17.74L6 19L7.26 14.26L2 12L7.26 9.74L6 5L10.91 6.26L12 2Z"/>
              </svg>
            )}
            <span className="text-sm text-gray-800 dark:text-gray-300">
              {new Date(entry.createdAt).toLocaleDateString()}
            </span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <span className="text-lg leading-none">⋯</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-8"
                  onClick={() => onEdit(entry)}
                >
                  ✏️ Edit Entry
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => onDelete(entry.id)}
                >
                  🗑️ Delete Entry
                </Button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-8"
                  onClick={() => onPin(entry)}
                >
                  {entry.isPinned ? "📌 Unpin Entry" : "📌 Pin Entry"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-8"
                  onClick={() => onDownloadSingle(entry.id)}
                >
                  ⬇ Download Entry
                </Button>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-sm">🗂 Move to Folder</span>
                  <Select
                    value={entry.folderId?.toString() || "none"}
                    onValueChange={(value) => 
                      onMoveToFolder(entry.id, value === "none" ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-7 text-xs w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {folders?.map((folder: Folder) => (
                        <SelectItem key={folder.id} value={folder.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: folder.color }}
                            />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <p className="text-gray-900 dark:text-gray-100 mb-3 line-clamp-3 break-words">
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
                  <Badge 
                    key={index} 
                    variant={tag === "Daily Challenge" ? "default" : "outline"} 
                    className={tag === "Daily Challenge" ? 
                      "text-xs bg-yellow-500 text-yellow-900 hover:bg-yellow-600" : 
                      "text-xs"
                    }
                  >
                    {tag === "Daily Challenge" ? "🎯 " + tag : tag}
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
            <span className="text-xs text-gray-800 dark:text-gray-300">
              {getFolderName(entry.folderId)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}