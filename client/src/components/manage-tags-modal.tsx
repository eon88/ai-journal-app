import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Settings, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserCustomTag {
  id: number;
  userId: number;
  tagName: string;
  displayOrder: number;
  createdAt: string;
}

interface UserProgress {
  currentLevel: number;
}

interface ManageTagsModalProps {
  trigger?: React.ReactNode;
}

export function ManageTagsModal({ trigger }: ManageTagsModalProps) {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [editingTag, setEditingTag] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading: tagsLoading } = useQuery<UserCustomTag[]>({
    queryKey: ["/api/custom-tags"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: progress } = useQuery<UserProgress>({
    queryKey: ["/api/user/progress"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: async (tagName: string) => {
      const response = await apiRequest("/api/custom-tags", "POST", { tagName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tags"] });
      setNewTagName("");
      toast({
        title: "Tag Created",
        description: "Your custom tag has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, tagName }: { id: number; tagName: string }) => {
      const response = await apiRequest(`/api/custom-tags/${id}`, "PUT", { tagName });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tags"] });
      setEditingTag(null);
      setEditingValue("");
      toast({
        title: "Tag Updated",
        description: "Your custom tag has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update tag",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/custom-tags/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-tags"] });
      toast({
        title: "Tag Deleted",
        description: "Your custom tag has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete tag",
        variant: "destructive",
      });
    },
  });

  const getTagLimit = (level: number) => {
    if (level <= 3) return 5;
    if (level <= 7) return 10;
    return 15;
  };

  const currentLevel = progress?.currentLevel || 1;
  const tagLimit = getTagLimit(currentLevel);
  const canAddMore = tags.length < tagLimit;

  const handleAddTag = () => {
    if (newTagName.trim()) {
      createMutation.mutate(newTagName.trim());
    }
  };

  const handleEditTag = (tag: UserCustomTag) => {
    setEditingTag(tag.id);
    setEditingValue(tag.tagName);
  };

  const handleSaveEdit = () => {
    if (editingTag && editingValue.trim()) {
      updateMutation.mutate({ id: editingTag, tagName: editingValue.trim() });
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditingValue("");
  };

  const handleDeleteTag = (id: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteMutation.mutate(id);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Settings className="h-4 w-4" />
      Manage Tags
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Custom Tags</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Usage indicator */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tags used: {tags.length}/{tagLimit}</span>
            <Badge variant="secondary">Level {currentLevel}</Badge>
          </div>

          {/* Add new tag */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Add New Tag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTag();
                    }
                  }}
                  maxLength={50}
                  disabled={!canAddMore || createMutation.isPending}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTagName.trim() || !canAddMore || createMutation.isPending}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {!canAddMore && (
                <p className="text-sm text-muted-foreground">
                  Tag limit reached. Level up to unlock more custom tags!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Current tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {tagsLoading ? (
                <div className="text-sm text-muted-foreground">Loading tags...</div>
              ) : tags.length === 0 ? (
                <div className="text-sm text-muted-foreground">No custom tags yet</div>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center gap-2 p-2 rounded border"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      
                      {editingTag === tag.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit();
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                            className="h-8"
                            maxLength={50}
                            autoFocus
                          />
                          <Button
                            onClick={handleSaveEdit}
                            size="sm"
                            variant="outline"
                            className="h-8"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="outline"
                            className="h-8"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="flex-1 cursor-pointer hover:bg-muted/50 p-1 rounded"
                            onClick={() => handleEditTag(tag)}
                          >
                            <Badge variant="outline">{tag.tagName}</Badge>
                          </div>
                          <Button
                            onClick={() => handleDeleteTag(tag.id)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Level upgrade prompt */}
          {progress && progress.currentLevel < 10 && (
            <div className="text-sm text-muted-foreground text-center">
              Level up to unlock more custom tags! Next unlock at Level {progress.currentLevel + 1}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}