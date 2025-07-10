import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Star, 
  Crown, 
  Trophy, 
  Target, 
  Calendar, 
  Tags, 
  Pin, 
  TrendingUp, 
  Eye,
  Book,
  Sparkles,
  Flame,
  ArrowLeft,
  Lock,
  Unlock
} from "lucide-react";
import { Link } from "wouter";

export default function RulesOfTheGame() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Rules of the Game
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Master the art of self-reflection and unlock your inner potential through strategic journaling
            </p>
          </div>
        </div>

        {/* XP System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="w-6 h-6 text-yellow-500" />
                XP System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-500" />
                    <span>Basic journal entry</span>
                  </div>
                  <Badge variant="secondary">+10 XP</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>3-day streak bonus</span>
                  </div>
                  <Badge variant="secondary">+50 XP</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span>Daily challenge</span>
                  </div>
                  <Badge variant="secondary">+25 XP</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-pink-500" />
                    <span>Weekly reflection</span>
                  </div>
                  <Badge variant="secondary">+100 XP</Badge>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Pro Tips:</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Longer, more thoughtful entries yield bonus XP</li>
                  <li>• Consistency matters more than length</li>
                  <li>• Use mood tracking and tags for extra points</li>
                  <li>• Complete daily challenges for quick XP boosts</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Level System */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Crown className="w-6 h-6 text-purple-500" />
                Level Progression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gray-500" />
                    <span>Level 1-2</span>
                  </div>
                  <Badge>Basic Features</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>Level 3-4</span>
                  </div>
                  <Badge>Advanced Tools</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-500" />
                    <span>Level 5-7</span>
                  </div>
                  <Badge>Expert Features</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gold-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Level 8-10</span>
                  </div>
                  <Badge>Master Tier</Badge>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Level Benefits:</h4>
                <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                  <li>• Each level unlocks new features</li>
                  <li>• Higher levels = more powerful tools</li>
                  <li>• Requires 1000 XP per level</li>
                  <li>• Unlock titles and achievements</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Unlocks */}
        <Card className="glass-card mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Unlock className="w-6 h-6 text-green-500" />
              Feature Unlock Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Level 1 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-lg">Level 1</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-500" />
                    <span>Basic journaling (30 entries)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>5 bullet symbols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Mood tracking</span>
                  </div>
                </div>
              </div>

              {/* Level 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-lg">Level 2</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span>Weekly reflections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    <span>Mood history</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-teal-500" />
                    <span>8 bullet symbols</span>
                  </div>
                </div>
              </div>

              {/* Level 3 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-lg">Level 3</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>Monthly insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tags className="w-4 h-4 text-orange-500" />
                    <span>Smart tag suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pin className="w-4 h-4 text-red-500" />
                    <span>Entry pinning</span>
                  </div>
                </div>
              </div>

              {/* Level 4 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-lg">Level 4</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-500" />
                    <span>12 bullet symbols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span>AI insights vault</span>
                  </div>
                </div>
              </div>

              {/* Level 5 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">5</span>
                  </div>
                  <h3 className="font-semibold text-lg">Level 5</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span>Goal tracking system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-blue-500" />
                    <span>All 18 bullet symbols</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gold-500" />
                    <span>Master tier features</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Strategies */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Master Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Streak Building
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Write something every day, even if it's just one sentence</li>
                  <li>• Set a specific time for journaling (morning or evening)</li>
                  <li>• Use the daily challenges as writing prompts</li>
                  <li>• Track your mood to maintain awareness</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  XP Optimization
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Complete daily challenges for quick XP</li>
                  <li>• Use tags and mood tracking for bonus points</li>
                  <li>• Write longer, more reflective entries</li>
                  <li>• Pin important entries to organize your thoughts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link to="/">
            <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white">
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}