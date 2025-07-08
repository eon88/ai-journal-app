import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderPlus, Edit3, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Folder {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

const FOLDER_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
  "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
];

export function FolderManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch folders
  const { data: folders, isLoading } = useQuery({
    queryKey: ["/api/folders"],
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderData: { name: string; color: string }) => {
      return apiRequest("/api/folders", "POST", folderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setIsCreateOpen(false);
      setNewFolderName("");
      setNewFolderColor(FOLDER_COLORS[0]);
      toast({
        title: "Folder created",
        description: "Your new folder has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update folder mutation
  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; color: string } }) => {
      return apiRequest(`/api/folders/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setEditingFolder(null);
      toast({
        title: "Folder updated",
        description: "Your folder has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update folder. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/folders/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Folder deleted",
        description: "Your folder has been deleted and entries moved to 'No folder'.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete folder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    createFolderMutation.mutate({
      name: newFolderName.trim(),
      color: newFolderColor,
    });
  };

  const handleUpdateFolder = (folder: Folder) => {
    if (!newFolderName.trim()) return;
    
    updateFolderMutation.mutate({
      id: folder.id,
      data: {
        name: newFolderName.trim(),
        color: newFolderColor,
      },
    });
  };

  const startEditing = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
  };

  const cancelEditing = () => {
    setEditingFolder(null);
    setNewFolderName("");
    setNewFolderColor(FOLDER_COLORS[0]);
  };

  if (isLoading) {
    return <div>Loading folders...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Folder Manager
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Folder Name</label>
                  <Input
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 mt-2">
                    {FOLDER_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newFolderColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewFolderColor(color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || createFolderMutation.isPending}
                  >
                    {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {folders && folders.length > 0 ? (
          <div className="space-y-3">
            {folders.map((folder: Folder) => (
              <div key={folder.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                {editingFolder?.id === folder.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder(folder)}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      {FOLDER_COLORS.map((color) => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border ${
                            newFolderColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewFolderColor(color)}
                        />
                      ))}
                    </div>
                    <Button size="sm" onClick={() => handleUpdateFolder(folder)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      <span className="font-medium">{folder.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => startEditing(folder)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => deleteFolderMutation.mutate(folder.id)}
                        disabled={deleteFolderMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No folders yet. Create your first folder to organize your entries!
          </p>
        )}
      </CardContent>
    </Card>
  );
}