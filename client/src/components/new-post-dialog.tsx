import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ForumCategory } from "@shared/schema";

interface NewPostDialogProps {
  defaultCategoryId?: number;
}

export function NewPostDialog({ defaultCategoryId }: NewPostDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string>(defaultCategoryId ? defaultCategoryId.toString() : "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get categories for the dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/forum/categories"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { title: string; content: string; categoryId: string }) => {
      const response = await apiRequest("/api/forum/posts", "POST", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/stats"] });
      setOpen(false);
      setTitle("");
      setContent("");
      setCategoryId("");
      toast({
        title: "Post Created",
        description: "Your discussion has been posted successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({ title: title.trim(), content: content.trim(), categoryId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-journal-primary hover:bg-indigo-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Start a New Discussion</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Share your thoughts, ask questions, or start a meaningful conversation with the community.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-gray-900 dark:text-white">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select a category" className="text-gray-500 dark:text-gray-400" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  {categories.map((category: ForumCategory) => (
                    <SelectItem key={category.id} value={category.id.toString()} className="text-gray-900 dark:text-white">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-gray-900 dark:text-white">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your discussion about?"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                maxLength={200}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content" className="text-gray-900 dark:text-white">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, experiences, or questions..."
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 min-h-[120px] resize-none"
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending}
              className="bg-journal-primary hover:bg-indigo-700"
            >
              {createPostMutation.isPending ? "Posting..." : "Post Discussion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}