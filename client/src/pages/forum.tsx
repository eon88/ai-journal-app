import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, TrendingUp, Clock, Search, Shield, Pin, Heart, Brain, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NewPostDialog } from "@/components/new-post-dialog";
import { ForumRankBadge } from "@/components/forum-rank-badge";
import type { ForumCategory, ForumPost } from "@shared/schema";

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if current user is admin
  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  // Get real forum data
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/forum/categories"],
  });



  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/forum/posts"],
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["/api/forum/stats"],
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Brain': return <Brain className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diff = now.getTime() - created.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const displayStats = stats ? [
    { label: "Active Members", value: stats.activeMembers.toLocaleString() },
    { label: "Total Posts", value: stats.totalPosts.toLocaleString() },
    { label: "Categories", value: stats.totalCategories.toString() },
    { label: "Online Now", value: stats.onlineNow.toString() }
  ] : [
    { label: "Active Members", value: "..." },
    { label: "Total Posts", value: "..." },
    { label: "Categories", value: "..." },
    { label: "Online Now", value: "..." }
  ];

  const featuredPosts = posts.filter((post: ForumPost & { author: { username: string; }, category: { name: string; } }) => post.isFeatured);
  const recentPosts = posts.slice(0, 10);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Forum Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Community Forum
            </h1>
            <p className="text-gray-700 dark:text-gray-300">
              Connect, share experiences, and grow together on your journaling journey
            </p>
          </div>
          
          {/* Search and Actions - Mobile Responsive */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/forum/leaderboard'}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 flex-1 sm:flex-none"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
              <div className="flex-1 sm:flex-none">
                <NewPostDialog />
              </div>
              {adminCheck?.isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/forum/admin'}
                  className="border-journal-primary text-journal-primary hover:bg-journal-primary/10 flex-1 sm:flex-none"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Forum Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {displayStats.map((stat, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold text-journal-primary">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="featured">Featured Posts</TabsTrigger>
            <TabsTrigger value="recent">Recent Discussions</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            {loadingCategories ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
                <p className="text-gray-300">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300">No categories yet. Start creating discussions!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category: ForumCategory) => (
                  <Card 
                    key={category.id} 
                    className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/forum/category/${category.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          {getIconComponent(category.icon)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-300 mb-3">
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Category created</span>
                            <span>{formatTimeAgo(category.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Featured Posts Tab */}
          <TabsContent value="featured" className="space-y-4">
            {loadingPosts ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
                <p className="text-gray-300">Loading featured posts...</p>
              </div>
            ) : featuredPosts.length === 0 ? (
              <div className="text-center py-8">
                <Pin className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300">No featured posts yet. Create some amazing content!</p>
              </div>
            ) : (
              featuredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/forum/post/${post.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-journal-primary text-white text-sm">
                          {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-white mb-1">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span>{post.author?.username}</span>
                              {post.author?.xpPoints !== undefined && (
                                <ForumRankBadge xpPoints={post.author.xpPoints} size="sm" />
                              )}
                              <span>•</span>
                              <span>{post.category?.name}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(post.createdAt)}</span>
                              {post.isPinned && (
                                <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                                  <Pin className="w-3 h-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {post.content.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.viewCount} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Recent Discussions Tab */}
          <TabsContent value="recent" className="space-y-4">
            {loadingPosts ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
                <p className="text-gray-300">Loading recent discussions...</p>
              </div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300">No discussions yet. Be the first to start a conversation!</p>
              </div>
            ) : (
              recentPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/forum/post/${post.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-journal-primary text-white text-xs">
                          {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{post.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <span>{post.author?.username}</span>
                          {post.author?.xpPoints !== undefined && (
                            <ForumRankBadge xpPoints={post.author.xpPoints} size="sm" />
                          )}
                          <span>•</span>
                          <span>{post.category?.name}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {post.replyCount}
                          </span>
                          <span>{post.viewCount} views</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}