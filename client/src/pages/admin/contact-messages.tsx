import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, User, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface ContactMessage {
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
}

export default function ContactMessages() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.username !== 'eon')) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading, user]);

  const { data: response, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAuthenticated && user?.username === 'eon',
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
    return null;
  }

  const messages = response?.messages || [];

  // Parse content to extract structured data
  const parseMessage = (content: string) => {
    const lines = content.split('\n');
    const result = {
      name: '',
      email: '',
      subject: '',
      message: '',
      timestamp: ''
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('Name: ')) {
        result.name = line.substring(6);
      } else if (line.startsWith('Email: ')) {
        result.email = line.substring(7);
      } else if (line.startsWith('Subject: ')) {
        result.subject = line.substring(9);
      } else if (line.startsWith('Time: ')) {
        result.timestamp = line.substring(6);
      } else if (line === 'Message:' && i + 1 < lines.length) {
        // Take everything after "Message:" until "--"
        const messageLines = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j] === '--') break;
          messageLines.push(lines[j]);
        }
        result.message = messageLines.join('\n');
        break;
      }
    }

    return result;
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
          <Badge variant="secondary" className="flex items-center gap-2 w-fit mx-auto">
            <Mail className="w-4 h-4" />
            {messages.length} Total Messages
          </Badge>
        </div>

        {/* Messages List */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Messages Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Contact form messages will appear here when users submit them.
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg: ContactMessage, index: number) => {
              const parsed = parseMessage(msg.content);
              const date = new Date(msg.timestamp);
              
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900 dark:text-white">
                            {parsed.name || 'Unknown'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {parsed.email || 'No email provided'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {date.toLocaleDateString()}
                        </Badge>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {date.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {parsed.subject && parsed.subject !== 'No subject provided' && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Subject
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {parsed.subject}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </h4>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {parsed.message || 'No message content'}
                        </p>
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