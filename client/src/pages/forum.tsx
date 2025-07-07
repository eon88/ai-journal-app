import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Users, TrendingUp, Clock, Search, Plus, Pin, Heart, Reply, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Check if current user is admin
  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  const forumCategories = [
    {
      id: "journaling-tips",
      title: "Journaling Tips & Techniques",
      description: "Share your favorite journaling methods and discover new approaches",
      icon: <MessageSquare className="w-5 h-5" />,
      posts: 127,
      latestPost: "How bullet symbols changed my life",
      lastActivity: "2 hours ago",
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      id: "personal-growth",
      title: "Personal Growth Stories",
      description: "Celebrate breakthroughs and support each other's journey",
      icon: <TrendingUp className="w-5 h-5" />,
      posts: 89,
      latestPost: "6 months of consistent journaling - my transformation",
      lastActivity: "4 hours ago",
      color: "bg-green-500/10 text-green-400"
    },
    {
      id: "merlin-ai",
      title: "AI Insights & Reflections",
      description: "Discuss AI-generated insights and share meaningful reflections",
      icon: <MessageSquare className="w-5 h-5" />,
      posts: 64,
      latestPost: "Best weekly reflection I've received from Merlin",
      lastActivity: "6 hours ago",
      color: "bg-purple-500/10 text-purple-400"
    },
    {
      id: "challenges",
      title: "Daily Challenges & Goals",
      description: "Share your daily challenge completions and goal achievements",
      icon: <Users className="w-5 h-5" />,
      posts: 156,
      latestPost: "30-day streak completed! What's next?",
      lastActivity: "1 hour ago",
      color: "bg-orange-500/10 text-orange-400"
    }
  ];

  const featuredPosts = [
    {
      id: 1,
      title: "The Power of Bullet Symbols: A Complete Guide",
      author: "Sarah Chen",
      authorInitials: "SC",
      category: "Journaling Tips",
      replies: 23,
      likes: 45,
      timeAgo: "3 hours ago",
      isPinned: true,
      excerpt: "I've been using bullet symbols for 6 months now and they've completely transformed how I organize my thoughts..."
    },
    {
      id: 2,
      title: "From Zero to 100-Day Streak: My Journey",
      author: "Alex Morgan",
      authorInitials: "AM",
      category: "Personal Growth",
      replies: 18,
      likes: 32,
      timeAgo: "5 hours ago",
      isPinned: false,
      excerpt: "When I started this app, I never thought I'd make it past a week. Today marks my 100th day of consistent journaling..."
    },
    {
      id: 3,
      title: "Merlin's Best Life Path Insights - Share Yours!",
      author: "Jordan Kim",
      authorInitials: "JK",
      category: "AI Insights",
      replies: 31,
      likes: 67,
      timeAgo: "8 hours ago",
      isPinned: true,
      excerpt: "I asked Merlin about my career direction and got the most profound insight. What's the best advice you've received?"
    },
    {
      id: 4,
      title: "Weekly Challenge: Gratitude in Dark Times",
      author: "Maya Patel",
      authorInitials: "MP",
      category: "Challenges",
      replies: 15,
      likes: 28,
      timeAgo: "12 hours ago",
      isPinned: false,
      excerpt: "This week's gratitude challenge helped me find light during a difficult period. How do you practice gratitude when things are tough?"
    }
  ];

  const recentDiscussions = [
    {
      id: 5,
      title: "How do you handle writer's block?",
      author: "Chris Lee",
      authorInitials: "CL",
      category: "Journaling Tips",
      replies: 7,
      likes: 12,
      timeAgo: "1 hour ago"
    },
    {
      id: 6,
      title: "Breakthrough moment with fear exploration",
      author: "Taylor Swift",
      authorInitials: "TS",
      category: "Personal Growth",
      replies: 9,
      likes: 18,
      timeAgo: "2 hours ago"
    },
    {
      id: 7,
      title: "Monthly reflection showed me my patterns",
      author: "David Park",
      authorInitials: "DP",
      category: "AI Insights",
      replies: 5,
      likes: 14,
      timeAgo: "3 hours ago"
    }
  ];

  const forumStats = [
    { label: "Active Members", value: "1,247" },
    { label: "Total Posts", value: "4,892" },
    { label: "Categories", value: "4" },
    { label: "Online Now", value: "73" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            Community Forum
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect with fellow journalers, share insights, and grow together on your personal development journey.
          </p>
          
          {/* Search and Stats */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-journal-primary hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </Button>
              {adminCheck?.isAdmin && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/forum/admin'}
                  className="border-journal-primary text-journal-primary hover:bg-journal-primary/10"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
            </div>
          </div>

          {/* Forum Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {forumStats.map((stat, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-lg font-bold text-journal-primary">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="featured">Featured Posts</TabsTrigger>
            <TabsTrigger value="recent">Recent Discussions</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forumCategories.map((category) => (
                <Card key={category.id} className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-300 mb-3">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{category.posts} posts</span>
                          <span>Latest: {category.lastActivity}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-300">
                          "{category.latestPost}"
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Featured Posts Tab */}
          <TabsContent value="featured" className="space-y-4">
            {featuredPosts.map((post) => (
              <Card key={post.id} className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-journal-primary text-white text-sm">
                        {post.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{post.title}</h3>
                            {post.isPinned && <Pin className="w-4 h-4 text-journal-primary" />}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>by {post.author}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{post.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Reply className="w-4 h-4" />
                          <span>{post.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Recent Discussions Tab */}
          <TabsContent value="recent" className="space-y-4">
            {recentDiscussions.map((post) => (
              <Card key={post.id} className="glass-card hover:bg-gray-800/60 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gray-600 text-white text-xs">
                        {post.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm mb-1">{post.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>by {post.author}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        <span>{post.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{post.likes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center py-8">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Load More Discussions
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Guidelines */}
        <Card className="glass-card mt-8">
          <CardHeader>
            <CardTitle className="text-white">Community Guidelines</CardTitle>
            <CardDescription className="text-gray-300">
              Help us maintain a supportive and inspiring environment
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Be Respectful</h4>
              <p>Treat all community members with kindness and respect. We're all on our own unique journeys.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Share Thoughtfully</h4>
              <p>Share genuine insights and experiences. Avoid spam, self-promotion, or off-topic content.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Support Each Other</h4>
              <p>Offer encouragement and constructive feedback. Celebrate others' progress and breakthroughs.</p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}