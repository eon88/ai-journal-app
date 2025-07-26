import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Tag, MessageCircle, RotateCcw, Download, Edit3, Trash2, X, Folder } from "lucide-react";
import { AIReflectionComponent } from "@/components/ai-reflection";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JournalEntry, Folder as FolderType } from "@shared/schema";
import { useState } from "react";

import { Link } from "wouter";

export default function EntryDetail() {
  const [match, params] = useRoute("/entry/:id");
  const entryId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editFolder, setEditFolder] = useState("");

  const { data: entry, isLoading, error } = useQuery<JournalEntry>({
    queryKey: ["/api/entries", entryId],
    queryFn: async () => {
      const response = await fetch(`/api/entries/${entryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch entry");
      }
      return response.json();
    },
    enabled: !!entryId,
  });

  // Fetch user folders for edit dialog
  const { data: folders = [] } = useQuery<FolderType[]>({
    queryKey: ["/api/folders"],
  });

  // AI reflection generation mutation
  const reflectionMutation = useMutation({
    mutationFn: async () => {
      if (!entryId) throw new Error("No entry ID");
      const response = await apiRequest(`/api/entries/${entryId}/analyze`, "POST");
      return await response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "AI Reflection Generated!",
        description: "Your AI insights are ready to view.",
      });
      
      // Update the cache with the updated entry
      if (data.entry) {
        queryClient.setQueryData(["/api/entries", entryId], data.entry);
        queryClient.invalidateQueries({ queryKey: ["/api/entries", entryId] });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to generate reflection",
        description: "Please try again later.",
        variant: "destructive",
      });
      console.error("Reflection generation error:", error);
    },
  });

  // Download single entry mutation
  const downloadMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const response = await apiRequest("/api/entries/download", "POST", {
        entryIds: [parseInt(entryId)]
      });
      return await response.blob();
    },
    onSuccess: (blob, entryId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `journal-entry-${entryId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Complete",
        description: "Your journal entry has been downloaded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Download Failed",
        description: "Unable to download the entry. Please try again.",
        variant: "destructive",
      });
      console.error("Download error:", error);
    },
  });

  // Edit entry mutation
  const editMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: string; tags?: string[]; folderId?: number | null }) => {
      if (!entryId) throw new Error("No entry ID");
      const response = await apiRequest(`/api/entries/${entryId}`, "PUT", data);
      return await response.json();
    },
    onSuccess: (updatedEntry) => {
      toast({
        title: "Entry Updated",
        description: "Your journal entry has been successfully updated.",
      });
      
      // Update the cache with the updated entry
      queryClient.setQueryData(["/api/entries", entryId], updatedEntry);
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Unable to update the entry. Please try again.",
        variant: "destructive",
      });
      console.error("Edit error:", error);
    },
  });

  // Delete entry mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!entryId) throw new Error("No entry ID");
      const response = await apiRequest(`/api/entries/${entryId}`, "DELETE");
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Deleted",
        description: "Your journal entry has been permanently deleted.",
      });
      
      // Invalidate cache and redirect to home
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: "Unable to delete the entry. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  const handleDownload = () => {
    if (entryId) {
      downloadMutation.mutate(entryId);
    }
  };

  const handleEdit = () => {
    if (entry) {
      setEditContent(entry.content || "");
      setEditMood(entry.mood || "");
      setEditTags(entry.tags ? entry.tags.join(", ") : "");
      setEditFolder(entry.folderId ? entry.folderId.toString() : "");
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    const tagsArray = editTags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    editMutation.mutate({
      content: editContent,
      mood: editMood || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      folderId: editFolder && editFolder !== "" ? parseInt(editFolder) : null,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood?: string | null) => {
    switch (mood?.toLowerCase()) {
      case 'excited': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'happy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'content': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'neutral': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'thoughtful': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sad': return 'bg-blue-700/20 text-blue-300 border-blue-700/30';
      case 'anxious': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'frustrated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'calm': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'energetic': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'apathetic': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Entry Not Found</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">The journal entry you're looking for doesn't exist or has been removed.</p>
            <Link to="/">
              <Button className="bg-journal-primary hover:bg-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Entry Header */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                <CardTitle className="text-gray-900 dark:text-white text-xl">
                  Journal Entry
                </CardTitle>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border-blue-200 dark:border-blue-800 w-full sm:w-auto"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border-red-200 dark:border-red-800 w-full sm:w-auto"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full sm:w-auto"
                >
                  {downloadMutation.isPending ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
                {entry.mood && (
                  <Badge className={getMoodColor(entry.mood)}>
                    {entry.mood}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Entry Content */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  {entry.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant={tag === "Daily Challenge" ? "default" : "outline"} 
                      className={tag === "Daily Challenge" ? 
                        "bg-yellow-500 text-yellow-900 hover:bg-yellow-600 border-yellow-600" : 
                        "text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-600"
                      }
                    >
                      {tag === "Daily Challenge" ? "🎯 " + tag : tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Type and Status */}
            {entry.type && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {entry.type && (
                    <span>Type: <span className="text-journal-primary capitalize">{entry.type}</span></span>
                  )}
                  {entry.status && (
                    <span>Status: <span className="text-journal-primary capitalize">{entry.status}</span></span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Reflection */}
        {entry.aiReflection ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-journal-primary" />
                AI Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIReflectionComponent 
                reflection={entry.aiReflection}
                isLoading={reflectionMutation.isPending}
                error={reflectionMutation.error?.message || null}
                onRegenerate={() => {
                  reflectionMutation.mutate();
                }}
                entryId={entryId}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 dark:text-gray-300 mb-4">No AI reflection generated for this entry yet.</p>
              <Button 
                className="bg-journal-primary hover:bg-indigo-700"
                onClick={() => {
                  reflectionMutation.mutate();
                }}
                disabled={reflectionMutation.isPending || !entry?.content}
              >
                {reflectionMutation.isPending ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate AI Reflection"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Journal Entry</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Make changes to your journal entry. Your AI reflection will remain the same.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write about your thoughts, feelings, and experiences..."
                className="min-h-[200px] text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                rows={8}
              />
            </div>
            
            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mood (optional)
              </label>
              <Select value={editMood} onValueChange={setEditMood}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="excited">😆 Excited</SelectItem>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="content">😌 Content</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="thoughtful">🤔 Thoughtful</SelectItem>
                  <SelectItem value="sad">😢 Sad</SelectItem>
                  <SelectItem value="anxious">😰 Anxious</SelectItem>
                  <SelectItem value="frustrated">😤 Frustrated</SelectItem>
                  <SelectItem value="calm">😌 Calm</SelectItem>
                  <SelectItem value="energetic">⚡ Energetic</SelectItem>
                  <SelectItem value="apathetic">😑 Apathetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (optional)
              </label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Separate tags with commas (e.g., work, goals, reflection)"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate multiple tags with commas
              </p>
            </div>
            
            {/* Folder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Folder (optional)
              </label>
              <Select value={editFolder} onValueChange={setEditFolder}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    <SelectValue placeholder="Select a folder" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      No Folder
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
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
          
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-gray-600 dark:text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editMutation.isPending || !editContent.trim()}
              className="bg-journal-primary hover:bg-indigo-700"
            >
              {editMutation.isPending ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}