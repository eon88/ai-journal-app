import { useState } from "react";
import { Header } from "@/components/header";
import { JournalEntryForm } from "@/components/journal-entry-form";

import { RecentEntries } from "@/components/recent-entries";
import { PeriodicReflections } from "@/components/periodic-reflections";
import { StreakScoreboard } from "@/components/streak-scoreboard";
import { GrowthDashboard } from "@/components/growth-dashboard";
import { InsightsVault } from "@/components/insights-vault";
import { DailyChallenge } from "@/components/daily-challenge";
import { BadgeShowcase } from "@/components/badge-showcase";
import { MerlinAssistant } from "@/components/merlin-assistant";
import { UserNameSetup } from "@/components/user-name-setup";
import { LifePathQuestionnaire } from "@/components/life-path-questionnaire";
import { Footer } from "@/components/footer";
import { LevelSidebar } from "@/components/level-sidebar";
import { useUser } from "@/components/user-provider";

import { useQuery } from "@tanstack/react-query";
import type { AIReflection } from "@shared/schema";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

export default function Home() {

  const { hasCompletedQuestionnaire, setHasCompletedQuestionnaire } = useUser();

  // Fetch recent entry for Merlin context
  const { data: recentEntries } = useQuery({
    queryKey: ["/api/entries"],
    queryFn: () => fetch("/api/entries?limit=1").then(res => res.json()),
  });

  const todaysEntry = recentEntries?.[0];
  const hasJournalToday = todaysEntry && new Date(todaysEntry.createdAt).toDateString() === new Date().toDateString();



  const handleQuestionnaireComplete = () => {
    setHasCompletedQuestionnaire(true);
  };

  const handleQuestionnaireSkip = () => {
    setHasCompletedQuestionnaire(true);
  };

  // Show questionnaire if user hasn't completed it yet
  if (!hasCompletedQuestionnaire) {
    return (
      <LifePathQuestionnaire
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
      />
    );
  }

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
              <JournalEntryForm />
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
