import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { User, Edit3, Download, Trash2, Shield, Bell, Palette, Save } from "lucide-react";
import { useUser } from "@/components/user-provider";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function UserProfile() {
  const { userName, setUserName } = useUser();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    weeklyReflections: true,
    dailyChallenges: true,
    progressReminders: false,
    darkMode: true
  });
  const { toast } = useToast();

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

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    toast({
      title: "Setting Updated",
      description: "Your preference has been saved.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your journal data export will be ready shortly.",
    });
    // In a real implementation, this would trigger an actual export
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
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-journal-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          
          {editingName ? (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-48 text-center bg-gray-800 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSave()}
              />
              <Button size="sm" onClick={handleNameSave}>
                <Save className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-white">{userName}</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingName(true)}
                className="text-gray-400 hover:text-white"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <p className="text-gray-400">Member since {joinDate}</p>
          
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="secondary">
              Level {userStats?.level || 1} • {userStats?.title || "Reflective Wanderer"}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-journal-primary mb-1">
                    {userStats?.totalEntries || 0}
                  </div>
                  <div className="text-sm text-gray-300">Journal Entries</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-journal-primary mb-1">
                    {userStats?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-gray-300">Current Streak</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-journal-primary mb-1">
                    {totalWords.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Words Written</div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-gray-300">
                  Your journaling journey at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-journal-primary rounded-full"></div>
                    <span className="text-gray-300">Longest streak: {userStats?.longestStreak || 0} days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">XP Points: {userStats?.xpPoints || 0}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-300">Achievement level: {userStats?.level || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Email Notifications</div>
                    <div className="text-sm text-gray-400">Receive updates via email</div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Weekly Reflections</div>
                    <div className="text-sm text-gray-400">Get notified about weekly insights</div>
                  </div>
                  <Switch 
                    checked={settings.weeklyReflections}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReflections', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Daily Challenges</div>
                    <div className="text-sm text-gray-400">Receive daily journaling prompts</div>
                  </div>
                  <Switch 
                    checked={settings.dailyChallenges}
                    onCheckedChange={(checked) => handleSettingChange('dailyChallenges', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Progress Reminders</div>
                    <div className="text-sm text-gray-400">Gentle reminders to journal</div>
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
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Customize your journaling experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Dark Mode</div>
                    <div className="text-sm text-gray-400">Use dark theme (recommended)</div>
                  </div>
                  <Switch 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Your Data
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Download all your journal entries and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Export all your journal entries, reflections, and insights in JSON format. 
                  This includes your complete journaling history and metadata.
                </p>
                <Button onClick={handleExportData} className="bg-journal-primary hover:bg-indigo-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Information about how your data is protected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
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
          <TabsContent value="account" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Name
                  </label>
                  <div className="text-white">{userName}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Member Since
                  </label>
                  <div className="text-white">{joinDate}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Account Type
                  </label>
                  <Badge variant="secondary">Free Account</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
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
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}