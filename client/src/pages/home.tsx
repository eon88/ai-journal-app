import { useState } from "react";
import { Header } from "@/components/header";
import { JournalEntryForm } from "@/components/journal-entry-form";
import { AIReflectionComponent } from "@/components/ai-reflection";
import { RecentEntries } from "@/components/recent-entries";
import { PeriodicReflections } from "@/components/periodic-reflections";
import { StreakScoreboard } from "@/components/streak-scoreboard";
import { GrowthDashboard } from "@/components/growth-dashboard";
import { InsightsVault } from "@/components/insights-vault";
import { DailyChallenge } from "@/components/daily-challenge";
import { BadgeShowcase } from "@/components/badge-showcase";
import { MerlinAssistant } from "@/components/merlin-assistant";
import { UserNameSetup } from "@/components/user-name-setup";
import { Footer } from "@/components/footer";
import { LevelSidebar } from "@/components/level-sidebar";
import { ExportJournal } from "@/components/export-journal";
import type { AIReflection } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [aiReflection, setAiReflection] = useState<AIReflection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent entry for Merlin context
  const { data: recentEntries } = useQuery({
    queryKey: ["/api/entries"],
    queryFn: () => fetch("/api/entries?limit=1").then(res => res.json()),
  });

  const todaysEntry = recentEntries?.[0];
  const hasJournalToday = todaysEntry && new Date(todaysEntry.createdAt).toDateString() === new Date().toDateString();

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
    <div className="min-h-screen font-inter">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Left Sidebar - Level Category */}
          <div className="hidden lg:block">
            <LevelSidebar />
          </div>
          
          {/* Main Content Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Journal Entry */}
            <div className="lg:col-span-2 space-y-6">
              <JournalEntryForm onAnalysisResult={handleAnalysisResult} />
              <AIReflectionComponent 
                reflection={aiReflection}
                isLoading={isLoading}
                error={error}
                onRegenerate={handleRegenerate}
              />
            </div>
            
            {/* Right Column - Gamification Features */}
            <div className="space-y-6">
              <DailyChallenge />
              <BadgeShowcase />
            </div>
          </div>
        </div>
        
        {/* Periodic Reflections */}
        <PeriodicReflections />
        
        {/* Growth Dashboard */}
        <GrowthDashboard />
        
        {/* Insights Vault */}
        <InsightsVault />
        
        {/* Export Journal */}
        <ExportJournal />
        
        {/* Recent Entries */}
        <RecentEntries />
      </main>
      
      {/* Merlin Assistant - Floating AI Mentor */}
      <MerlinAssistant 
        userMood={todaysEntry?.mood}
        hasJournalToday={hasJournalToday}
        recentEntry={todaysEntry?.content}
      />
      
      <Footer />
      
      {/* User Name Setup Modal */}
      <UserNameSetup />
    </div>
  );
}
