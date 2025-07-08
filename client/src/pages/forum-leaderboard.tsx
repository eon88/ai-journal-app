import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Crown, Star, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ForumRankBadge, ForumRankDisplay } from "@/components/forum-rank-badge";
import { FORUM_RANKS, getForumRank } from "@shared/schema";

interface LeaderboardUser {
  id: number;
  username: string;
  xpPoints: number;
  level: number;
  title: string;
  totalEntries: number;
  currentStreak: number;
}

export default function ForumLeaderboard() {
  // Get top users by XP
  const { data: topUsers, isLoading } = useQuery({
    queryKey: ["/api/leaderboard/top-users"],
    queryFn: async () => {
      const response = await fetch("/api/leaderboard/top-users");
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
  });

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3: return <Star className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>;
    }
  };

  const getPodiumClass = (position: number) => {
    switch (position) {
      case 1: return "border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20";
      case 2: return "border-2 border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20";
      case 3: return "border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20";
      default: return "border border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Community Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the most dedicated journalers in our community. Earn XP through writing, 
            engaging with others, and completing challenges to climb the ranks!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Journalers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topUsers && topUsers.length > 0 ? (
                  <div className="space-y-3">
                    {topUsers.map((user: LeaderboardUser, index: number) => {
                      const position = index + 1;
                      const rank = getForumRank(user.xpPoints);
                      
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:scale-[1.02] ${getPodiumClass(position)}`}
                        >
                          <div className="flex items-center gap-3">
                            {getPodiumIcon(position)}
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {user.username}
                              </h3>
                              <ForumRankBadge xpPoints={user.xpPoints} size="sm" />
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {user.xpPoints} XP
                              </span>
                              <span>Level {user.level}</span>
                              <span>{user.totalEntries} entries</span>
                              <span>{user.currentStreak} day streak</span>
                            </div>
                          </div>
                          
                          {position <= 3 && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                position === 1 ? 'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' :
                                position === 2 ? 'border-gray-400 text-gray-600 bg-gray-50 dark:bg-gray-900/20' :
                                'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                              }`}
                            >
                              {position === 1 ? 'Champion' : position === 2 ? 'Runner-up' : 'Third Place'}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No users found. Be the first to start journaling!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rank Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Forum Ranks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {FORUM_RANKS.map((rank) => (
                  <ForumRankDisplay key={rank.id} rank={rank} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Earn XP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Write a journal entry</span>
                  <Badge variant="outline">+10 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Complete daily challenge</span>
                  <Badge variant="outline">+15 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>7-day writing streak</span>
                  <Badge variant="outline">+50 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Create forum post</span>
                  <Badge variant="outline">+5 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reply to discussion</span>
                  <Badge variant="outline">+2 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Unlock achievement badge</span>
                  <Badge variant="outline">+25 XP</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}