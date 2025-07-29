import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Target, TrendingUp, Users, Zap, Star, CheckCircle } from "lucide-react";

export default function LandingNew() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Single Header - No Duplication */}
      <header className="w-full bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Quest Journal</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="space-y-6">
          <Badge className="bg-blue-600/30 text-white border-blue-400/50 px-4 py-2">
            AI-Powered Personal Growth
          </Badge>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Transform Your Life Through
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Intelligent Journaling</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Discover your purpose, track meaningful growth, and unlock your potential with our AI-powered journaling companion. 
            Get personalized insights, reflections, and guidance on your journey to becoming your best self.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              onClick={() => window.location.href = '/register'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg font-medium"
            >
              Start Your Journey
            </Button>
            <p className="text-white/70">Free during beta • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <Brain className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">Get personalized reflections and growth patterns from your journal entries.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <Target className="w-8 h-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Goal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">Set meaningful goals and track your progress with intelligent milestone detection.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80">Visualize your personal development journey with detailed progress analytics.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Single Footer - No Duplication */}
      <footer className="w-full bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold">Quest Journal</span>
            </div>
            <p className="text-white/70">© 2025 Quest Journal. Transforming lives through intelligent reflection.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}