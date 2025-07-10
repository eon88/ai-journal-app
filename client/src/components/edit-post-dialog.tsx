import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ForumPost } from "@shared/schema";

interface EditPostDialogProps {
  post: ForumPost;
  trigger?: React.ReactNode;
}

export function EditPostDialog({ post, trigger }: EditPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const editPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const response = await apiRequest(`/api/forum/posts/${post.id}`, "PATCH", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", post.id] });
      toast({
        title: "Post Updated!",
        description: "Your post has been successfully updated.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    editPostMutation.mutate({ title: title.trim(), content: content.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-800 border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Post</DialogTitle>
          <DialogDescription className="text-gray-300">
            Make changes to your post. Your edits will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-200">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              maxLength={200}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-200">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, experiences, or ask questions..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[200px]"
              maxLength={5000}
            />
            <div className="text-xs text-gray-400 text-right">
              {content.length}/5000 characters
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={editPostMutation.isPending || !title.trim() || !content.trim()}
              className="bg-journal-primary hover:bg-journal-primary/80 text-white"
            >
              {editPostMutation.isPending ? "Updating..." : "Update Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}