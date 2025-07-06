import { useState } from "react";
import { Header } from "@/components/header";
import { JournalEntryForm } from "@/components/journal-entry-form";
import { AIReflectionComponent } from "@/components/ai-reflection";
import { RecentEntries } from "@/components/recent-entries";
import { PeriodicReflections } from "@/components/periodic-reflections";
import { StreakScoreboard } from "@/components/streak-scoreboard";
import { GrowthDashboard } from "@/components/growth-dashboard";
import { InsightsVault } from "@/components/insights-vault";
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
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Streak and Progress Overview */}
        <StreakScoreboard />
        
        {/* Journal Entry and AI Reflection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <JournalEntryForm onAnalysisResult={handleAnalysisResult} />
            <AIReflectionComponent 
              reflection={aiReflection}
              isLoading={isLoading}
              error={error}
              onRegenerate={handleRegenerate}
            />
          </div>
          
          {/* Growth Dashboard */}
          <div>
            <GrowthDashboard />
          </div>
        </div>
        
        {/* Periodic Reflections */}
        <PeriodicReflections />
        
        {/* Insights Vault */}
        <InsightsVault />
        
        {/* Recent Entries */}
        <RecentEntries />
      </main>
      
      <Footer />
    </div>
  );
}
