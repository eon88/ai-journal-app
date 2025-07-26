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
import { Footer } from "@/components/footer";
import { LevelSidebar } from "@/components/level-sidebar";
import { MobileScoreboard } from "@/components/mobile-scoreboard";

import { useQuery } from "@tanstack/react-query";
import type { AIReflection } from "@shared/schema";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";

export default function Home() {
  // Simplified home page to debug rendering issues
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Quest Journal
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8">
            Your AI-powered journaling companion for personal growth and self-discovery.
          </p>
          
          {/* Simple Journal Entry Form */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Write Your Entry
            </h2>
            <JournalEntryForm />
          </div>
        </div>
        
        {/* Test other components one by one */}
        <div className="mt-8 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Mobile Scoreboard
            </h2>
            <MobileScoreboard />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Entries
            </h2>
            <RecentEntries />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
