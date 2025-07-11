import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  Edit3, 
  Trash2, 
  Pin, 
  PinOff, 
  Eye, 
  EyeOff, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  Plus,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForumAdmin() {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  const adminStats = [
    { label: "Total Posts", value: "4,892", change: "+23 today" },
    { label: "Active Users", value: "1,247", change: "+8 today" },
    { label: "Pending Reports", value: "3", change: "2 new" },
    { label: "Categories", value: "4", change: "All active" }
  ];

  const allPosts = [
    {
      id: 1,
      title: "The Power of Bullet Symbols: A Complete Guide",
      author: "Sarah Chen",
      authorInitials: "SC",
      category: "Journaling Tips",
      status: "published",
      isPinned: true,
      isHidden: false,
      replies: 23,
      likes: 45,
      reports: 0,
      createdAt: "2025-01-06T15:30:00Z",
      excerpt: "I've been using bullet symbols for 6 months now and they've completely transformed how I organize my thoughts..."
    },
    {
      id: 2,
      title: "From Zero to 100-Day Streak: My Journey",
      author: "Alex Morgan",
      authorInitials: "AM",
      category: "Personal Growth",
      status: "published",
      isPinned: false,
      isHidden: false,
      replies: 18,
      likes: 32,
      reports: 1,
      createdAt: "2025-01-06T12:15:00Z",
      excerpt: "When I started this app, I never thought I'd make it past a week. Today marks my 100th day of consistent journaling..."
    },
    {
      id: 3,
      title: "Inappropriate content example",
      author: "Spam User",
      authorInitials: "SU",
      category: "Off-topic",
      status: "reported",
      isPinned: false,
      isHidden: true,
      replies: 2,
      likes: 0,
      reports: 5,
      createdAt: "2025-01-06T08:45:00Z",
      excerpt: "This is spam content that needs moderation..."
    },
    {
      id: 4,
      title: "Weekly Challenge: Gratitude in Dark Times",
      author: "Maya Patel",
      authorInitials: "MP",
      category: "Challenges",
      status: "published",
      isPinned: false,
      isHidden: false,
      replies: 15,
      likes: 28,
      reports: 0,
      createdAt: "2025-01-05T20:30:00Z",
      excerpt: "This week's gratitude challenge helped me find light during a difficult period. How do you practice gratitude when things are tough?"
    }
  ];

  const [posts, setPosts] = useState(allPosts);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "Journaling Tips",
    isPinned: false
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || post.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSelectPost = (postId: number) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
    }
  };

  const handleBulkAction = (action: string) => {
    const actionText = action === 'delete' ? 'deleted' : 
                      action === 'pin' ? 'pinned' : 
                      action === 'unpin' ? 'unpinned' :
                      action === 'hide' ? 'hidden' : 'shown';
    
    toast({
      title: "Bulk Action Complete",
      description: `${selectedPosts.length} posts ${actionText} successfully.`,
    });
    setSelectedPosts([]);
  };

  const handleTogglePin = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isPinned: !post.isPinned } : post
    ));
    
    const post = posts.find(p => p.id === postId);
    toast({
      title: post?.isPinned ? "Post Unpinned" : "Post Pinned",
      description: `"${post?.title}" has been ${post?.isPinned ? 'unpinned' : 'pinned'}.`,
    });
  };

  const handleToggleVisibility = (postId: number) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isHidden: !post.isHidden } : post
    ));
    
    const post = posts.find(p => p.id === postId);
    toast({
      title: post?.isHidden ? "Post Shown" : "Post Hidden",
      description: `"${post?.title}" is now ${post?.isHidden ? 'visible' : 'hidden'}.`,
    });
  };

  const handleDeletePost = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    
    toast({
      title: "Post Deleted",
      description: `"${post?.title}" has been permanently deleted.`,
      variant: "destructive",
    });
  };

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const post = {
      id: Math.max(...posts.map(p => p.id)) + 1,
      title: newPost.title,
      author: "Admin",
      authorInitials: "AD",
      category: newPost.category,
      status: "published" as const,
      isPinned: newPost.isPinned,
      isHidden: false,
      replies: 0,
      likes: 0,
      reports: 0,
      createdAt: new Date().toISOString(),
      excerpt: newPost.content.substring(0, 100) + "..."
    };

    setPosts(prev => [post, ...prev]);
    setNewPost({ title: "", content: "", category: "Journaling Tips", isPinned: false });
    
    toast({
      title: "Post Created",
      description: `"${post.title}" has been published successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-400';
      case 'reported': return 'bg-red-500/10 text-red-400';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Forum Administration
            </h1>
            <p className="text-gray-300">
              Manage posts, moderate content, and oversee community discussions
            </p>
          </div>
          <Badge variant="outline" className="border-journal-primary text-journal-primary">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {adminStats.map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-4">
                <div className="text-lg font-bold text-journal-primary">{stat.value}</div>
                <div className="text-sm text-gray-300 mb-1">{stat.label}</div>
                <div className="text-xs text-gray-400">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="posts">Manage Posts</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Manage Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {/* Controls */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="reported">Reported</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="border-gray-600"
                    >
                      {selectedPosts.length === filteredPosts.length ? "Deselect All" : "Select All"}
                    </Button>
                    
                    {selectedPosts.length > 0 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('pin')}
                          className="border-gray-600"
                        >
                          Pin Selected
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBulkAction('hide')}
                          className="border-gray-600"
                        >
                          Hide Selected
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleBulkAction('delete')}
                        >
                          Delete Selected
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                        className="mt-2"
                      />
                      
                      <Avatar className="w-10 h-10 mt-1">
                        <AvatarFallback className="bg-journal-primary text-white text-sm">
                          {post.authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-medium ${post.isHidden ? 'text-gray-500 line-through' : 'text-white'}`}>
                                {post.title}
                              </h3>
                              {post.isPinned && <Pin className="w-4 h-4 text-journal-primary" />}
                              {post.reports > 0 && <AlertTriangle className="w-4 h-4 text-red-400" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                              <span>by {post.author}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                              <span>•</span>
                              <Badge className={`text-xs ${getStatusColor(post.status)}`}>
                                {post.status}
                              </Badge>
                              {post.reports > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-400">{post.reports} reports</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-3">{post.excerpt}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{post.replies} replies</span>
                            <span>{post.likes} likes</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePin(post.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              {post.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVisibility(post.id)}
                              className="text-gray-400 hover:text-white"
                            >
                              {post.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Create Post Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Create New Post</CardTitle>
                <CardDescription className="text-gray-300">
                  Create an official post as admin to guide discussions or make announcements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Post Title
                  </label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                  >
                    <option value="Journaling Tips">Journaling Tips & Techniques</option>
                    <option value="Personal Growth">Personal Growth Stories</option>
                    <option value="AI Insights">AI Insights & Reflections</option>
                    <option value="Challenges">Daily Challenges & Goals</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Post Content
                  </label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your post content..."
                    className="bg-gray-800 border-gray-600 text-white min-h-[200px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newPost.isPinned}
                    onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, isPinned: checked }))}
                  />
                  <label className="text-sm text-gray-300">Pin this post</label>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost} className="bg-journal-primary hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Publish Post
                  </Button>
                  <Button variant="outline" className="border-gray-600">
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Reported Content
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Review and moderate reported posts and comments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {posts.filter(post => post.reports > 0).length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p>No reported content to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.filter(post => post.reports > 0).map((post) => (
                      <div key={post.id} className="border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-white">{post.title}</h4>
                          <Badge className="bg-red-500/10 text-red-400">
                            {post.reports} reports
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">by {post.author}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-600 text-green-400 hover:bg-green-600/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                          >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Hide
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Forum Settings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure forum behavior and moderation rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Auto-moderate reported posts</div>
                    <div className="text-sm text-gray-400">Automatically hide posts with 3+ reports</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Require approval for new posts</div>
                    <div className="text-sm text-gray-400">All new posts need admin approval</div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Email notifications for reports</div>
                    <div className="text-sm text-gray-400">Get notified when content is reported</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Allow anonymous posting</div>
                    <div className="text-sm text-gray-400">Users can post without showing their name</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}