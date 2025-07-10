import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Users, 
  Settings,
  Crown,
  UserCheck,
  UserX,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const { data: adminCheck, isLoading: checkingAdmin } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  // Get all users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: adminCheck?.isAdmin === true,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await apiRequest(`/api/admin/users/${userId}/role`, "PATCH", { role });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-white">
            <Shield className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Checking admin permissions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-300">You don't have admin permissions to access this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-300">
              Manage users and forum permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Users className="w-4 h-4 mr-2" />
                User Dashboard
              </Button>
            </Link>
            <Badge variant="outline" className="border-journal-primary text-journal-primary">
              <Crown className="w-3 h-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Admin Settings</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription className="text-gray-300">
                  View and manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 mx-auto mb-4 animate-pulse text-gray-400" />
                    <p className="text-gray-300">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user: User) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-journal-primary text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">{user.username}</h3>
                              {user.role === 'admin' && (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">{user.email}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {user.role === 'admin' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRoleChange(user.id, 'user')}
                              disabled={updateRoleMutation.isPending}
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Remove Admin
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRoleChange(user.id, 'admin')}
                              disabled={updateRoleMutation.isPending}
                              className="border-green-500 text-green-400 hover:bg-green-500/10"
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Make Admin
                            </Button>
                          )}
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
                  Admin Settings
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Configure admin panel and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Admin Role Management</h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Admins can access the forum admin panel, manage posts, moderate content, and promote/demote other users.
                  </p>
                  <div className="text-sm text-gray-400">
                    <strong>Current Admins:</strong> {users.filter((u: User) => u.role === 'admin').length}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Forum Access</h3>
                  <p className="text-sm text-gray-300">
                    Admin users can access the Forum Admin panel to manage posts, categories, and community content.
                  </p>
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