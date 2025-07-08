import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Tag, MessageCircle, Heart, RotateCcw } from "lucide-react";
import { AIReflectionComponent } from "@/components/ai-reflection";
import type { JournalEntry } from "@shared/schema";
import { BULLET_SYMBOLS } from "@shared/schema";
import { Link } from "wouter";

export default function EntryDetail() {
  const [match, params] = useRoute("/entry/:id");
  const entryId = params?.id;

  const { data: entry, isLoading, error } = useQuery<JournalEntry>({
    queryKey: ["/api/entries", entryId],
    queryFn: async () => {
      const response = await fetch(`/api/entries/${entryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch entry");
      }
      return response.json();
    },
    enabled: !!entryId,
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood?: string | null) => {
    switch (mood?.toLowerCase()) {
      case 'excited': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'happy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'content': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'neutral': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'thoughtful': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'sad': return 'bg-blue-700/20 text-blue-300 border-blue-700/30';
      case 'anxious': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'frustrated': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'calm': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'energetic': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getBulletSymbol = (type?: string | null, status?: string | null) => {
    if (!type) return null;
    
    const symbolData = BULLET_SYMBOLS.find(s => s.type === type && s.status === status);
    return symbolData?.symbol || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Entry Not Found</h1>
            <p className="text-gray-300 mb-6">The journal entry you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button className="bg-journal-primary hover:bg-indigo-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
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
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Entry Header */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                <CardTitle className="text-white text-xl">
                  {getBulletSymbol(entry.type, entry.status) && (
                    <span className="mr-3 text-journal-primary">
                      {getBulletSymbol(entry.type, entry.status)}
                    </span>
                  )}
                  Journal Entry
                </CardTitle>
              </div>
              {entry.mood && (
                <Badge className={getMoodColor(entry.mood)}>
                  {entry.mood}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Entry Content */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-gray-300 border-gray-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Type and Status */}
            {entry.type && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {entry.type && (
                    <span>Type: <span className="text-journal-primary capitalize">{entry.type}</span></span>
                  )}
                  {entry.status && (
                    <span>Status: <span className="text-journal-primary capitalize">{entry.status}</span></span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Reflection */}
        {entry.aiReflection ? (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-journal-primary" />
                AI Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIReflectionComponent 
                reflection={entry.aiReflection}
                isLoading={false}
                error={null}
                onRegenerate={() => {
                  // Handle regeneration if needed
                  console.log("Regenerating reflection for entry:", entry.id);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-300 mb-4">No AI reflection generated for this entry yet.</p>
              <Button 
                className="bg-journal-primary hover:bg-indigo-700"
                onClick={() => {
                  // Trigger AI analysis for this entry
                  console.log("Analyzing entry:", entry.id);
                }}
              >
                Generate AI Reflection
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}