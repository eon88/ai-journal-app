import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Edit3, Trash2, Shield, Bell, Palette, Save, Target } from "lucide-react";
import { useUser } from "@/components/user-provider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { SubscriptionManager } from "@/components/subscription-manager";
import { GoalsManager } from "@/components/goals-manager";
import { AIReviewViewer } from "@/components/ai-review-viewer";

export default function UserProfile() {
  const { userName, setUserName } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const { settings, updateSetting, isLoading: settingsLoading } = useNotificationSettings();
  const { toast } = useToast();

  // Check for upgrade success message in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeSuccess = urlParams.get('upgrade');
    const planId = urlParams.get('plan');
    
    if (upgradeSuccess === 'success') {
      const planNames = {
        '1': 'Life Path Light Monthly',
        '2': 'Life Path Light Annual'
      };
      
      const planName = planNames[planId as keyof typeof planNames] || 'Premium Plan';
      
      toast({
        title: "Payment Successful!",
        description: `Welcome to ${planName}! You now have access to all premium features.`,
        variant: "default",
      });
      
      // Update account status to premium and refresh data
      setTimeout(() => {
        // Simulate premium status by adding query parameter to subsequent API calls
        localStorage.setItem('premium_user', 'true');
        window.location.reload(); // Refresh to show premium features
      }, 2000);
      
      // Clean up the URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [toast]);

  // Fetch user stats
  const { data: userStats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => fetch("/api/stats").then(res => res.json()),
  });

  // Fetch total entries count
  const { data: allEntries } = useQuery({
    queryKey: ["/api/entries"],
    queryFn: () => fetch("/api/entries").then(res => res.json()),
  });

  const handleNameSave = () => {
    if (newName.trim()) {
      setUserName(newName.trim());
      setEditingName(false);
      toast({
        title: "Name Updated",
        description: "Your display name has been updated successfully.",
      });
    }
  };

  const handleSettingChange = async (setting: keyof typeof settings, value: boolean) => {
    const result = await updateSetting(setting, value);
    
    if (result.success) {
      toast({
        title: "Setting Updated",
        description: `${getSettingDisplayName(setting)} ${value ? 'enabled' : 'disabled'} successfully.`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save setting. Your preference has been saved locally.",
        variant: "destructive",
      });
    }
  };

  const getSettingDisplayName = (setting: string) => {
    const names = {
      emailNotifications: 'Email notifications',
      weeklyReflections: 'Weekly reflection notifications',
      dailyChallenges: 'Daily challenge notifications',
      progressReminders: 'Progress reminders',
      darkMode: 'Dark mode'
    };
    return names[setting as keyof typeof names] || setting;
  };



  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  const joinDate = "January 2025"; // This would come from actual user data
  const totalWords = allEntries?.reduce((total: number, entry: any) => 
    total + (entry.content?.split(' ').length || 0), 0) || 0;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 profile-mobile-spacing md:profile-mobile-spacing-none">
        {/* Profile Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-journal-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          
          {editingName ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-2 px-4 sm:px-0">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full sm:w-48 text-center"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
              />
              <Button size="sm" onClick={handleNameSave} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-2 px-4 sm:px-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center">{userName}</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingName(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">Member since {joinDate}</p>
          
          <div className="flex justify-center mt-3 sm:mt-4 px-4 sm:px-0">
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
              Level {userStats?.level || 1} • {userStats?.title || "Reflective Wanderer"}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 p-1 bg-gray-50 dark:bg-gray-800">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-3">Overview</TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs sm:text-sm px-2 py-3">Analysis</TabsTrigger>
              <TabsTrigger value="goals" className="text-xs sm:text-sm px-2 py-3">Goals</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm px-2 py-3">Settings</TabsTrigger>
              <TabsTrigger value="subscription" className="text-xs sm:text-sm px-1 py-3">Sub</TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm px-2 py-3">Data</TabsTrigger>
              <TabsTrigger value="account" className="text-xs sm:text-sm px-2 py-3">Account</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Container */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm min-h-[500px]">

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card className="glass-card">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-journal-primary mb-1">
                    {userStats?.totalEntries || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Journal Entries</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-journal-primary mb-1">
                    {userStats?.currentStreak || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Current Streak</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-3 sm:p-6 text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-journal-primary mb-1">
                    {totalWords.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Words Written</div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-foreground text-base sm:text-lg">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">
                  Your journaling journey at a glance
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-journal-primary rounded-full"></div>
                    <span className="text-foreground">Longest streak: {userStats?.longestStreak || 0} days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-foreground">XP Points: {userStats?.xpPoints || 0}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-foreground">Achievement level: {userStats?.level || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            {/* AI Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4 sm:space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Life Path Analysis
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View your personalized AI-generated life path insights based on your questionnaire responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIReviewViewer />
              </CardContent>
            </Card>
          </TabsContent>

            {/* Goals Tab */}
            <TabsContent value="goals" className="space-y-4 sm:space-y-6">
            <GoalsManager />
          </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 sm:space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Weekly Reflections</div>
                    <div className="text-sm text-muted-foreground">Get notified about weekly insights</div>
                  </div>
                  <Switch 
                    checked={settings.weeklyReflections}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReflections', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Daily Challenges</div>
                    <div className="text-sm text-muted-foreground">Receive daily journaling prompts</div>
                  </div>
                  <Switch 
                    checked={settings.dailyChallenges}
                    onCheckedChange={(checked) => handleSettingChange('dailyChallenges', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Progress Reminders</div>
                    <div className="text-sm text-muted-foreground">Gentle reminders to journal</div>
                  </div>
                  <Switch 
                    checked={settings.progressReminders}
                    onCheckedChange={(checked) => handleSettingChange('progressReminders', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize your journaling experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Dark Mode</div>
                    <div className="text-sm text-muted-foreground">Use dark theme (recommended)</div>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-4 sm:space-y-6">
            <SubscriptionManager />
          </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-4 sm:space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Information about your data and storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Your journal entries and personal reflections are stored securely in our encrypted database. 
                  You maintain full ownership and control over your data at all times.
                </p>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-journal-primary rounded-full mt-2"></div>
                    <div>All entries are encrypted at rest and in transit</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-journal-primary rounded-full mt-2"></div>
                    <div>Data is backed up regularly for reliability</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-journal-primary rounded-full mt-2"></div>
                    <div>You can delete individual entries anytime</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Information about how your data is protected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>Your journal entries are encrypted and stored securely</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>AI analysis happens securely without storing personal data</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>You have full control over your data and can delete it anytime</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>We never share your personal information with third parties</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-4 sm:space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground">Account Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Display Name
                  </label>
                  <div className="text-foreground">{userName}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Member Since
                  </label>
                  <div className="text-foreground">{joinDate}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Account Type
                  </label>
                  <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Free Beta Account
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Deleting your account will permanently remove all your journal entries, 
                  insights, and progress. This action cannot be undone.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          </div>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}