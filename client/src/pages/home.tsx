import { useState } from "react";
import { Header } from "@/components/header";
import { JournalEntryForm } from "@/components/journal-entry-form-new";
import { AIReflectionComponent } from "@/components/ai-reflection";
import { RecentEntries } from "@/components/recent-entries";
import { Footer } from "@/components/footer";
import type { AIReflection } from "@shared/schema";

export default function Home() {
  const [aiReflection, setAiReflection] = useState<AIReflection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysisResult = (result: { summary: AIReflection }) => {
    setIsLoading(false);
    setError(null);
    setAiReflection(result.summary);
  };

  const handleRegenerate = () => {
    // This would trigger a new analysis of the current entry
    // For now, we'll just reset the state
    setAiReflection(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-journal-secondary font-inter">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <JournalEntryForm onAnalysisResult={handleAnalysisResult} />
        
        <AIReflectionComponent 
          reflection={aiReflection}
          isLoading={isLoading}
          error={error}
          onRegenerate={handleRegenerate}
        />
        
        <RecentEntries />
      </main>
      
      <Footer />
    </div>
  );
}
