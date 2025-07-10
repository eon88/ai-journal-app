import { useState } from "react";
import { Header } from "@/components/header";
import { Link } from "wouter";
import { JournalEntryForm } from "@/components/journal-entry-form";

import { RecentEntries } from "@/components/recent-entries";
import { PeriodicReflections } from "@/components/periodic-reflections";
import { StreakScoreboard } from "@/components/streak-scoreboard";
import { GrowthDashboard } from "@/components/growth-dashboard";
import { InsightsVault } from "@/components/insights-vault";
import { DailyChallenge } from "@/components/daily-challenge";
import { DailyQuote } from "@/components/daily-quote";
import { BadgeShowcase } from "@/components/badge-showcase";
import { MerlinAssistant } from "@/components/merlin-assistant";
import { MerlinWhisper } from "@/components/merlin-whisper";

import { LifePathQuestionnaire } from "@/components/life-path-questionnaire";
import { Footer } from "@/components/footer";
import { LevelSidebar } from "@/components/level-sidebar";
import { MobileScoreboard } from "@/components/mobile-scoreboard";
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
        {/* Mobile Scoreboard */}
        <MobileScoreboard />
        
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
              <DailyQuote />
              <BadgeShowcase />
            </div>
          </div>
        </div>
        
        {/* Periodic Reflections */}
        <PeriodicReflections />
        
        {/* Community Link Section */}
        <div className="text-center py-8">
          <div className="glass-card-transparent rounded-xl p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Join Our Community</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Connect with fellow journalers, share insights, and grow together on your life path journey.
            </p>
            <Link to="/forum">
              <button className="bg-journal-primary hover:bg-journal-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                </svg>
                Visit Community Forum
              </button>
            </Link>
          </div>
        </div>
        
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
      
      {/* Merlin Whisper for Desktop */}
      <MerlinWhisper />
    </div>
  );
}
