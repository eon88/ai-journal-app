import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Search, MessageSquare, Heart, Clock, Pin, Plus, TrendingUp, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NewPostDialog } from "@/components/new-post-dialog";
import { ForumRankBadge } from "@/components/forum-rank-badge";
import type { ForumCategory, ForumPost } from "@shared/schema";

export default function ForumCategory() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const categoryId = parseInt(id || "0");
  const [searchQuery, setSearchQuery] = useState("");

  // Get category data
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/forum/categories"],
  });

  // Get posts for this category
  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["/api/forum/posts", categoryId],
    queryFn: () => fetch(`/api/forum/posts?categoryId=${categoryId}`).then(res => res.json())
  });

  const category = categories.find((cat: ForumCategory) => cat.id === categoryId);

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

  const filteredPosts = posts.filter((post: ForumPost & { author: { username: string; }, category: { name: string; } }) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!category) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h1 className="text-xl font-semibold text-white mb-2">Category not found</h1>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/forum')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forum
            </Button>
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
        {/* Category Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/forum')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className={`p-3 rounded-lg ${category.color}`}>
            {getIconComponent(category.icon)}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {category.name}
            </h1>
            <p className="text-gray-300">
              {category.description}
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
          <NewPostDialog defaultCategoryId={categoryId} />
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loadingPosts ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
              <p className="text-gray-300">Loading posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300">No posts in this category yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            filteredPosts.map((post: ForumPost & { author: { username: string; xpPoints: number; }, category: { name: string; } }) => (
              <Card 
                key={post.id} 
                className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer"
                onClick={() => setLocation(`/forum/post/${post.id}`)}
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
}