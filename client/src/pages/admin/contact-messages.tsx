import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Clock, User, MessageSquare, MoreVertical, Trash2, Archive, Pin, ArchiveX, PinOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContactMessage {
  id: number;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  archived?: boolean;
  pinned?: boolean;
}

export default function ContactMessages() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: response, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAuthenticated && user?.username === 'eon',
  });

  // Message management mutations
  const deleteMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest(`/api/admin/contact-messages/${messageId}`, "DELETE");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: "Message Deleted",
        description: "Contact message has been permanently deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete message.",
        variant: "destructive",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async ({ messageId, archived }: { messageId: number; archived: boolean }) => {
      const response = await apiRequest(`/api/admin/contact-messages/${messageId}/archive`, "PATCH", { archived });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: variables.archived ? "Message Archived" : "Message Unarchived",
        description: `Message has been ${variables.archived ? 'moved to archive' : 'restored from archive'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Archive Failed",
        description: error.message || "Failed to archive message.",
        variant: "destructive",
      });
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ messageId, pinned }: { messageId: number; pinned: boolean }) => {
      const response = await apiRequest(`/api/admin/contact-messages/${messageId}/pin`, "PATCH", { pinned });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: variables.pinned ? "Message Pinned" : "Message Unpinned",
        description: `Message has been ${variables.pinned ? 'pinned to top' : 'unpinned'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Pin Failed",
        description: error.message || "Failed to pin message.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || messagesLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading contact messages...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || user?.username !== 'eon') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to view this page.</p>
          </div>
        </main>
      </div>
    );
  }

  const allMessages = response?.messages || [];

  // Filter messages based on active tab
  const filterMessages = (messages: ContactMessage[]) => {
    switch (activeTab) {
      case "pinned":
        return messages.filter(msg => msg.pinned);
      case "archived":
        return messages.filter(msg => msg.archived);
      case "active":
        return messages.filter(msg => !msg.archived);
      default:
        return messages;
    }
  };

  // Sort messages: pinned first, then by date
  const sortMessages = (messages: ContactMessage[]) => {
    return messages.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  };

  const messages = sortMessages(filterMessages(allMessages));

  // Parse content to extract structured data
  const parseMessage = (content: string) => {
    const lines = content.split('\n');
    const data: any = {};
    
    for (const line of lines) {
      if (line.startsWith('Name: ')) {
        data.name = line.substring(6);
      } else if (line.startsWith('Email: ')) {
        data.email = line.substring(7);
      } else if (line.startsWith('Message:')) {
        const messageIndex = lines.indexOf(line);
        data.message = lines.slice(messageIndex + 1)
          .filter(l => !l.startsWith('--') && l.trim())
          .join('\n');
      }
    }
    
    return data;
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contact Messages
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Messages received through the contact form
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {allMessages.length} Total
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Pin className="w-4 h-4" />
              {allMessages.filter(m => m.pinned).length} Pinned
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              {allMessages.filter(m => m.archived).length} Archived
            </Badge>
          </div>
        </div>

        {/* Tabs for filtering */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Messages List */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {activeTab === "all" ? "No Messages Yet" : `No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Messages`}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {activeTab === "all" 
                    ? "Contact form messages will appear here when users submit them."
                    : `No messages are currently ${activeTab}.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg: ContactMessage) => {
              const parsed = parseMessage(msg.content);
              const date = new Date(msg.timestamp);
              
              return (
                <Card key={msg.id} className={`hover:shadow-lg transition-shadow relative ${msg.pinned ? 'border-yellow-500 border-2' : ''} ${msg.archived ? 'opacity-75' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg text-gray-900 dark:text-white">
                              {parsed.name || 'Unknown'}
                            </CardTitle>
                            {msg.pinned && (
                              <Pin className="w-4 h-4 text-yellow-500" />
                            )}
                            {msg.archived && (
                              <Archive className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {parsed.email || 'No email provided'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {date.toLocaleDateString()}
                          </Badge>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {date.toLocaleTimeString()}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => pinMutation.mutate({ messageId: msg.id, pinned: !msg.pinned })}
                              disabled={pinMutation.isPending}
                            >
                              {msg.pinned ? (
                                <>
                                  <PinOff className="mr-2 h-4 w-4" />
                                  Unpin Message
                                </>
                              ) : (
                                <>
                                  <Pin className="mr-2 h-4 w-4" />
                                  Pin to Top
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => archiveMutation.mutate({ messageId: msg.id, archived: !msg.archived })}
                              disabled={archiveMutation.isPending}
                            >
                              {msg.archived ? (
                                <>
                                  <ArchiveX className="mr-2 h-4 w-4" />
                                  Unarchive
                                </>
                              ) : (
                                <>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteMutation.mutate(msg.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Forever
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Subject */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Subject</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {msg.subject.replace('Contact Form: ', '')}
                        </p>
                      </div>

                      {/* Message */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {parsed.message || 'No message content'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}