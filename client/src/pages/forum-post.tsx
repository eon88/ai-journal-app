import { useState } from "react";
import { useParams } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Heart, Reply, MessageSquare, Clock, Pin, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ForumRankBadge } from "@/components/forum-rank-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ForumPost, ForumReply } from "@shared/schema";

export default function ForumPostPage() {
  const { id } = useParams();
  const postId = parseInt(id || "0");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get post data
  const { data: post, isLoading: loadingPost } = useQuery({
    queryKey: ["/api/forum/posts", postId],
    queryFn: () => fetch(`/api/forum/posts/${postId}`).then(res => res.json())
  });

  // Get replies
  const { data: replies = [], isLoading: loadingReplies } = useQuery({
    queryKey: ["/api/forum/posts", postId, "replies"],
    queryFn: () => fetch(`/api/forum/posts/${postId}/replies`).then(res => res.json())
  });

  // Create reply mutation
  const createReplyMutation = useMutation({
    mutationFn: async (data: { content: string; parentReplyId?: number }) => {
      return await apiRequest(`/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId, "replies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId] });
      setReplyContent("");
      setReplyingTo(null);
      toast({
        title: "Reply posted!",
        description: "Your reply has been added to the discussion.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/forum/like", {
        method: 'POST',
        body: JSON.stringify({ postId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts", postId] });
    }
  });

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

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    createReplyMutation.mutate({
      content: replyContent,
      parentReplyId: replyingTo || undefined
    });
  };

  if (loadingPost) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
            <p className="text-gray-300">Loading post...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h1 className="text-xl font-semibold text-white mb-2">Post not found</h1>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/forum'}
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
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/forum'}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        </div>

        {/* Main Post */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-journal-primary text-white">
                  {post.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-white mb-2">
                      {post.title}
                    </h1>
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
                      {post.isLocked && (
                        <Badge variant="outline" className="text-xs border-red-500 text-red-400">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none mb-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    {post.likeCount}
                  </Button>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {post.replyCount} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.viewCount} views
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {!post.isLocked && (
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSubmitReply}>
                <div className="mb-4">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={!replyContent.trim() || createReplyMutation.isPending}
                    className="bg-journal-primary hover:bg-journal-primary/90"
                  >
                    {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                  {replyingTo && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="border-gray-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Replies ({replies.length})
          </h3>
          
          {loadingReplies ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
              <p className="text-gray-300">Loading replies...</p>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300">No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((reply: ForumReply & { author: { username: string; xpPoints: number; } }) => (
              <Card key={reply.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-journal-primary text-white text-xs">
                        {reply.author?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <span>{reply.author?.username}</span>
                        {reply.author?.xpPoints !== undefined && (
                          <ForumRankBadge xpPoints={reply.author.xpPoints} size="sm" />
                        )}
                        <span>•</span>
                        <span>{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
                        {reply.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400 h-6 px-2 text-xs"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {reply.likeCount}
                        </Button>
                        {!post.isLocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(reply.id);
                              setReplyContent(`@${reply.author.username} `);
                            }}
                            className="text-gray-400 hover:text-blue-400 h-6 px-2 text-xs"
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        )}
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