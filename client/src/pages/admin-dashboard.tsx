import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Download, 
  Search, 
  Filter,
  Crown,
  Star,
  TrendingUp,
  Calendar,
  Mail,
  User,
  Gift,
  Zap,
  Shield,
  CreditCard,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  isAdmin: boolean;
  progress: {
    currentLevel: number;
    xpPoints: number;
    unlockedFeatures: string[];
    levelTitle: string;
  };
  stats: {
    totalEntries: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: string;
  };
  badges: number;
}

const LEVEL_TITLES = [
  "Reflective Wanderer",
  "Mindful Seeker", 
  "Insight Student",
  "Growth Climber",
  "Wisdom Builder",
  "Path Navigator", 
  "Soul Architect",
  "Life Guardian",
  "Inner Sage",
  "Legendary Oracle"
];

const ENGAGEMENT_LEVELS = {
  HIGH: { label: "High", min: 15, color: "bg-green-500" },
  MEDIUM: { label: "Medium", min: 5, color: "bg-yellow-500" },
  LOW: { label: "Low", min: 1, color: "bg-red-500" },
  INACTIVE: { label: "Inactive", min: 0, color: "bg-gray-500" }
};

function getEngagementLevel(totalEntries: number, currentStreak: number): keyof typeof ENGAGEMENT_LEVELS {
  const score = totalEntries + (currentStreak * 2);
  if (score >= ENGAGEMENT_LEVELS.HIGH.min) return "HIGH";
  if (score >= ENGAGEMENT_LEVELS.MEDIUM.min) return "MEDIUM";
  if (score >= ENGAGEMENT_LEVELS.LOW.min) return "LOW";
  return "INACTIVE";
}

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [engagementFilter, setEngagementFilter] = useState<string>("all");
  
  // XP Gifting state
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [xpAmount, setXpAmount] = useState<string>("");
  const [giftReason, setGiftReason] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user is admin first
  const { data: adminCheck, isLoading: checkingAdmin } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  const { data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ["/api/admin/users-detailed"],
    enabled: adminCheck?.isAdmin === true,
    retry: false,
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === "all" || user.progress.currentLevel.toString() === levelFilter;
    
    const userEngagement = getEngagementLevel(user.stats.totalEntries, user.stats.currentStreak);
    const matchesEngagement = engagementFilter === "all" || userEngagement === engagementFilter;
    
    return matchesSearch && matchesLevel && matchesEngagement;
  }) || [];

  const exportToCSV = () => {
    if (!filteredUsers.length) {
      toast({
        title: "No data to export",
        description: "Apply filters to get user data first.",
        variant: "destructive",
      });
      return;
    }

    const csvHeader = "Username,Email,First Name,Last Name,Level,Level Title,XP Points,Total Entries,Current Streak,Longest Streak,Engagement Level,Badges,Admin,Created Date,Last Active\n";
    const csvData = filteredUsers.map(user => {
      const engagement = getEngagementLevel(user.stats.totalEntries, user.stats.currentStreak);
      return [
        user.username,
        user.email || "",
        user.firstName || "",
        user.lastName || "",
        user.progress.currentLevel,
        user.progress.levelTitle,
        user.progress.xpPoints,
        user.stats.totalEntries,
        user.stats.currentStreak,
        user.stats.longestStreak,
        ENGAGEMENT_LEVELS[engagement].label,
        user.badges,
        user.isAdmin ? "Yes" : "No",
        new Date(user.createdAt).toLocaleDateString(),
        user.stats.lastActiveDate ? new Date(user.stats.lastActiveDate).toLocaleDateString() : "Never"
      ].join(",");
    }).join("\n");

    const blob = new Blob([csvHeader + csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: `Exported ${filteredUsers.length} users to CSV`,
    });
  };

  // XP Gifting mutation
  const giftXPMutation = useMutation({
    mutationFn: async ({ userId, xpAmount, reason }: { userId: number; xpAmount: number; reason: string }) => {
      const response = await apiRequest("/api/admin/gift-xp", "POST", { userId, xpAmount, reason });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "XP Gifted Successfully!",
        description: data.message + (data.levelUp ? ` They leveled up to ${data.levelUp.newLevel}!` : ""),
      });
      // Reset form
      setSelectedUserId("");
      setXpAmount("");
      setGiftReason("");
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-detailed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to gift XP",
        description: error.message || "An error occurred while gifting XP",
        variant: "destructive",
      });
    },
  });

  // Level integrity check mutation
  const levelCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/admin/fix-level-consistency", "POST", {});
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Level Integrity Check Completed!",
        description: data.report,
      });
      // Refresh user data to see any fixes
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users-detailed"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to run level check",
        description: error.message || "An error occurred during the level integrity check",
        variant: "destructive",
      });
    },
  });

  const handleGiftXP = () => {
    if (!selectedUserId || !xpAmount || parseInt(xpAmount) <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a user and enter a valid XP amount",
        variant: "destructive",
      });
      return;
    }
    
    giftXPMutation.mutate({
      userId: parseInt(selectedUserId),
      xpAmount: parseInt(xpAmount),
      reason: giftReason || "Admin gift",
    });
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen font-inter">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking admin permissions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen font-inter">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to access the admin dashboard.
              </p>
              <div className="mt-4 text-sm text-gray-500">
                <p>Debug: Admin check result: {JSON.stringify(adminCheck)}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage users and analyze engagement data
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => window.location.href = '/pricing'} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Subscribe
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/contact-messages'} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Messages
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/forum-management'} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Forum Management
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/blog-management'} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Blog Management
            </Button>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Admin Tools Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* XP Gifting Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-500" />
                Gift XP to Users
              </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select User
                </label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username} - Level {user.progress.currentLevel} ({user.progress.xpPoints} XP)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  XP Amount
                </label>
                <Input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  placeholder="Enter XP amount"
                  min="1"
                  max="10000"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <Input
                  value={giftReason}
                  onChange={(e) => setGiftReason(e.target.value)}
                  placeholder="e.g., Community contribution"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGiftXP}
                  disabled={giftXPMutation.isPending}
                  className="w-full flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {giftXPMutation.isPending ? "Gifting..." : "Gift XP"}
                </Button>
              </div>
            </div>
          </CardContent>
          </Card>

          {/* Level Integrity Check Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Level Integrity Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan all users for level/XP inconsistencies and automatically fix them. This ensures users have the correct level based on their XP points.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What this does:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Checks all user stats for level consistency</li>
                    <li>• Recalculates proper level based on XP points</li>
                    <li>• Updates incorrect titles to match levels</li>
                    <li>• Reports how many users were fixed</li>
                  </ul>
                </div>
                
                <Button 
                  onClick={() => levelCheckMutation.mutate()}
                  disabled={levelCheckMutation.isPending}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Shield className="w-4 h-4" />
                  {levelCheckMutation.isPending ? "Checking..." : "Run Level Integrity Check"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users?.filter(u => getEngagementLevel(u.stats.totalEntries, u.stats.currentStreak) === "HIGH").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Level 5+</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users?.filter(u => u.progress.currentLevel >= 5).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users?.filter(u => {
                      if (!u.stats.lastActiveDate) return false;
                      const lastActive = new Date(u.stats.lastActiveDate);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return lastActive > weekAgo;
                    }).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
              
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Level {i + 1} - {LEVEL_TITLES[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={engagementFilter} onValueChange={setEngagementFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by engagement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engagement Levels</SelectItem>
                  <SelectItem value="HIGH">High Engagement</SelectItem>
                  <SelectItem value="MEDIUM">Medium Engagement</SelectItem>
                  <SelectItem value="LOW">Low Engagement</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                Showing {filteredUsers.length} of {users?.length || 0} users
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Database</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading user data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const engagement = getEngagementLevel(user.stats.totalEntries, user.stats.currentStreak);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}` 
                                    : user.username}
                                </div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{user.email || "No email"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="mb-1">
                                Level {user.progress.currentLevel}
                              </Badge>
                              <div className="text-xs text-gray-500">
                                {user.progress.levelTitle}
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.progress.xpPoints} XP
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${ENGAGEMENT_LEVELS[engagement].color}`}></div>
                              <span className="text-sm">{ENGAGEMENT_LEVELS[engagement].label}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {user.badges} badges
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.stats.totalEntries} entries</div>
                              <div className="text-gray-500">
                                {user.stats.currentStreak} day streak
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.isAdmin && (
                              <Badge variant="secondary" className="mb-1">
                                <Crown className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            <div className="text-xs text-gray-500">
                              {user.stats.lastActiveDate 
                                ? `Active ${new Date(user.stats.lastActiveDate).toLocaleDateString()}`
                                : "Never active"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}