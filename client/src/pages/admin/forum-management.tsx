import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Users, 
  FolderOpen, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Plus, 
  Pin, 
  PinOff,
  Lock,
  Unlock,
  Star,
  StarOff,
  Shield,
  ShieldOff,
  Eye,
  Search,
  Filter,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ForumRankBadge } from "@/components/forum-rank-badge";
import type { ForumCategory, ForumPost, User } from "@shared/schema";

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

interface PostWithDetails extends ForumPost {
  author: { username: string; id: number; };
  category: { name: string; };
}

interface UserWithDetails extends User {
  totalPosts?: number;
  totalLikes?: number;
  joinedAt?: string;
  lastActive?: string;
  isModerator?: boolean;
}

export default function ForumManagement() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "MessageSquare",
    isActive: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data queries
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/forum/categories"],
    enabled: isAuthenticated && user?.username === 'eon',
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/forum/posts"],
    enabled: isAuthenticated && user?.username === 'eon',
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users-detailed"],
    enabled: isAuthenticated && user?.username === 'eon',
  });

  const { data: moderators = [], isLoading: loadingModerators } = useQuery({
    queryKey: ["/api/admin/forum/moderators"],
    enabled: isAuthenticated && user?.username === 'eon',
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: Omit<CategoryFormData, 'isActive'> & { isActive: boolean }) => {
      const response = await apiRequest("/api/admin/forum/categories", "POST", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      setShowCategoryDialog(false);
      setCategoryForm({ name: "", description: "", color: "#3B82F6", icon: "MessageSquare", isActive: true });
      toast({ title: "Category Created", description: "New forum category has been created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Creation Failed", description: error.message, variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CategoryFormData> }) => {
      const response = await apiRequest(`/api/admin/forum/categories/${id}`, "PATCH", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      setEditingCategory(null);
      setShowCategoryDialog(false);
      toast({ title: "Category Updated", description: "Category has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/forum/categories/${id}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      toast({ title: "Category Deleted", description: "Category has been deleted successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    },
  });

  // Post mutations
  const togglePostPinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: number; isPinned: boolean }) => {
      const response = await apiRequest(`/api/admin/forum/posts/${id}/pin`, "PATCH", { isPinned });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({ title: "Post Updated", description: "Post pin status updated successfully." });
    },
  });

  const togglePostFeatureMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      const response = await apiRequest(`/api/admin/forum/posts/${id}/feature`, "PATCH", { isFeatured });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({ title: "Post Updated", description: "Post feature status updated successfully." });
    },
  });

  const togglePostLockMutation = useMutation({
    mutationFn: async ({ id, isLocked }: { id: number; isLocked: boolean }) => {
      const response = await apiRequest(`/api/admin/forum/posts/${id}/lock`, "PATCH", { isLocked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({ title: "Post Updated", description: "Post lock status updated successfully." });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/forum/posts/${id}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
      toast({ title: "Post Deleted", description: "Post has been deleted successfully." });
    },
  });

  // Toggle photo permissions for category
  const toggleCategoryPhotosMutation = useMutation({
    mutationFn: async ({ id, allowPhotos }: { id: number; allowPhotos: boolean }) => {
      const response = await apiRequest(`/api/admin/forum/categories/${id}/photos`, "PATCH", { allowPhotos });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/categories"] });
      toast({ title: "Photo Settings Updated", description: "Category photo permissions updated successfully." });
    },
  });

  // User/Moderator mutations
  const toggleModeratorMutation = useMutation({
    mutationFn: async ({ userId, isModerator }: { userId: number; isModerator: boolean }) => {
      const endpoint = isModerator ? "/api/admin/forum/moderators" : `/api/admin/forum/moderators/${userId}`;
      const method = isModerator ? "POST" : "DELETE";
      const body = isModerator ? { userId } : undefined;
      const response = await apiRequest(endpoint, method, body);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/forum/moderators"] });
      toast({ title: "Moderator Status Updated", description: "User moderator privileges updated successfully." });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading forum management...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || user?.username !== 'eon') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access forum management.</p>
          </div>
        </main>
      </div>
    );
  }

  const handleCategorySubmit = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleEditCategory = (category: ForumCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive
    });
    setShowCategoryDialog(true);
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "", color: "#3B82F6", icon: "MessageSquare", isActive: true });
    setShowCategoryDialog(true);
  };

  const filteredPosts = posts.filter((post: PostWithDetails) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = (usersData?.users || []).filter((user: UserWithDetails) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Forum Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Manage categories, posts, users, and moderators
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              {categories.length} Categories
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {posts.length} Posts
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {filteredUsers.length} Users
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {moderators.length} Moderators
            </Badge>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search categories, posts, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="moderators">Moderators</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forum Categories</h2>
              <Button onClick={handleNewCategory}>
                <Plus className="w-4 h-4 mr-2" />
                New Category
              </Button>
            </div>

            <div className="grid gap-4">
              {categories.map((category: ForumCategory) => (
                <Card key={category.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${category.color}20`, color: category.color }}
                        >
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {category.name}
                            {!category.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Photo Upload Toggle */}
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-600 dark:text-gray-300">
                            Photos
                          </Label>
                          <Switch
                            checked={category.allowPhotos}
                            onCheckedChange={(allowPhotos) => 
                              toggleCategoryPhotosMutation.mutate({ id: category.id, allowPhotos })
                            }
                          />
                          <Camera className={`w-4 h-4 ${category.allowPhotos ? 'text-green-500' : 'text-gray-400'}`} />
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateCategoryMutation.mutate({ 
                                id: category.id, 
                                data: { isActive: !category.isActive } 
                              })}
                            >
                              {category.isActive ? (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forum Posts</h2>
            
            <div className="grid gap-4">
              {filteredPosts.map((post: PostWithDetails) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          {post.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
                          {post.isFeatured && <Star className="w-4 h-4 text-orange-500" />}
                          {post.isLocked && <Lock className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>By {post.author.username}</span>
                          <span>in {post.category.name}</span>
                          <span>{post.viewCount} views</span>
                          <span>{post.likeCount} likes</span>
                          <span>{post.replyCount} replies</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => togglePostPinMutation.mutate({ 
                              id: post.id, 
                              isPinned: !post.isPinned 
                            })}
                          >
                            {post.isPinned ? (
                              <>
                                <PinOff className="mr-2 h-4 w-4" />
                                Unpin Post
                              </>
                            ) : (
                              <>
                                <Pin className="mr-2 h-4 w-4" />
                                Pin Post
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePostFeatureMutation.mutate({ 
                              id: post.id, 
                              isFeatured: !post.isFeatured 
                            })}
                          >
                            {post.isFeatured ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Unfeature Post
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Feature Post
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePostLockMutation.mutate({ 
                              id: post.id, 
                              isLocked: !post.isLocked 
                            })}
                          >
                            {post.isLocked ? (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Unlock Post
                              </>
                            ) : (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Lock Post
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deletePostMutation.mutate(post.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
            
            <div className="grid gap-4">
              {filteredUsers.map((user: UserWithDetails) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle>{user.username}</CardTitle>
                            <ForumRankBadge xpPoints={user.xpPoints || 0} />
                            {user.isModerator && (
                              <Badge variant="default" className="bg-purple-600">
                                <Shield className="w-3 h-3 mr-1" />
                                Moderator
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            {user.email} • Joined {new Date(user.createdAt || '').toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                          <div>{user.totalPosts || 0} posts</div>
                          <div>{user.totalLikes || 0} likes</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => toggleModeratorMutation.mutate({ 
                                userId: user.id, 
                                isModerator: !user.isModerator 
                              })}
                            >
                              {user.isModerator ? (
                                <>
                                  <ShieldOff className="mr-2 h-4 w-4" />
                                  Remove Moderator
                                </>
                              ) : (
                                <>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Make Moderator
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Moderators Tab */}
          <TabsContent value="moderators" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forum Moderators</h2>
            
            <div className="grid gap-4">
              {moderators.map((moderator: any) => (
                <Card key={moderator.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {moderator.user.username}
                            <Badge variant="default" className="bg-purple-600">Moderator</Badge>
                          </CardTitle>
                          <CardDescription>
                            Assigned on {new Date(moderator.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleModeratorMutation.mutate({ 
                          userId: moderator.userId, 
                          isModerator: false 
                        })}
                      >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create New Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update the category details below." : "Add a new forum category for organizing discussions."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Describe what this category is for"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={categoryForm.isActive}
                  onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, isActive: checked })}
                />
                <Label htmlFor="active">Active Category</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCategorySubmit}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {editingCategory ? "Update" : "Create"} Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}