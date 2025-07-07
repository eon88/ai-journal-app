import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Target, TrendingUp, Users, Zap, Star, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Life Path Companion</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Sign In with Replit
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30 px-4 py-2">
            AI-Powered Personal Growth
          </Badge>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Transform Your Life Through
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Intelligent Journaling</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover your purpose, track meaningful growth, and unlock your potential with our AI-powered journaling companion. 
            Get personalized insights, reflections, and guidance on your journey to becoming your best self.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg font-medium"
            >
              Start Your Journey
            </Button>
            <p className="text-gray-400">Free during beta • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Life Path Companion?</h2>
          <p className="text-gray-300 text-lg">Everything you need to discover your purpose and achieve meaningful growth</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Brain className="w-8 h-8" />,
              title: "AI-Powered Insights",
              description: "Get personalized reflections and growth patterns identified by advanced AI analysis"
            },
            {
              icon: <Target className="w-8 h-8" />,
              title: "Life Path Discovery",
              description: "16-question journey using proven methodology to uncover your unique purpose and direction"
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: "Growth Tracking",
              description: "Visual analytics, streak tracking, and comprehensive progress monitoring"
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Daily Challenges",
              description: "Micro-quests and prompts designed to foster continuous personal development"
            },
            {
              icon: <Star className="w-8 h-8" />,
              title: "Achievement System",
              description: "Unlock badges, gain XP, and celebrate milestones on your growth journey"
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Merlin AI Guide",
              description: "Your personal AI mentor providing wisdom, guidance, and motivational support"
            }
          ].map((feature, index) => (
            <Card key={index} className="glass-card border-white/10 hover:border-white/20 transition-all">
              <CardHeader>
                <div className="text-blue-400 mb-2">{feature.icon}</div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl text-white mb-4">Ready to Begin Your Transformation?</CardTitle>
            <CardDescription className="text-xl text-gray-300">
              Join thousands of users who have discovered their purpose and achieved meaningful growth
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg font-medium"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Start Free Account
              </Button>
            </div>
            <p className="text-gray-400 mt-4">No commitment • Full access during beta</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold">Life Path Companion</span>
            </div>
            <p className="text-gray-400">© 2025 Life Path Companion. Transforming lives through intelligent reflection.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}