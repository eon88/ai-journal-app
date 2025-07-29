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
          <Badge className="bg-blue-600/20 text-blue-300 border-blue-400/30 px-4 py-2">
            AI-Powered Personal Growth
          </Badge>
          <h1 className="text-5xl font-bold text-white leading-tight landing-text">
            Transform Your Life Through
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent landing-gradient-text"> Intelligent Journaling</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed landing-text">
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

      {/* Why Journal Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8 text-white/90">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-6 landing-text">🎯 Why Journal?</h2>
            <p className="text-xl leading-relaxed landing-text">
              Because writing is clear thinking.<br />
              When you write, you're not just taking notes—you're taking command. A scattered mind produces scattered outcomes. But a focused pen produces power.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <div>
                <p className="text-lg leading-relaxed">
                  Your mind is for generating ideas, not for storing them. The more thoughts you hold inside, the more clutter you carry. 
                  Journaling frees you from mental overload. It becomes your second brain—a place to dump, sort, build, and grow.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🧱 One Brick at a Time</h3>
                <p className="leading-relaxed">
                  Success isn't one big leap. It's a brick laid on top of the last. One clear idea. One completed task. 
                  One honest reflection. Stack enough of those, and you build a fortress of focus. A castle made of clarity.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🔍 Measure to Master</h3>
                <p className="leading-relaxed">
                  What you can measure, you can manage.<br />
                  What you can manage, you can master.<br />
                  But if you're not even aware of what's running your life, it will master you.
                </p>
                <p className="leading-relaxed mt-3">
                  This journal helps you make the invisible visible. It reveals patterns, spotlights distractions, and makes progress trackable. 
                  You'll gain awareness, and with awareness, power.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🧭 Know Where You're Going</h3>
                <p className="leading-relaxed">
                  Vision-boarding, goal-setting, reflection—it all starts here.<br />
                  When you know where you're headed, the journey shortens. You act with intention, not reaction. 
                  You stop drifting, and start building.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">👥 You're Not Alone</h3>
                <p className="leading-relaxed">
                  Even the most legendary minds in history used journals. Not because they were weak—but because they were wise. 
                  They knew that writing doesn't make you soft. It makes you sharp.
                </p>
                <p className="leading-relaxed mt-3">
                  And here, you're not doing it alone. You've got a structure. A rhythm. A supportive system. 
                  And soon, an AI partner to reflect, guide, and grow with you.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">💪 Discipline is Not Slavery</h3>
                <p className="leading-relaxed">
                  If someone forces you to do what you don't want to do, that's slavery.<br />
                  But when you force yourself to do what you truly want—that's empowerment.
                </p>
                <p className="leading-relaxed mt-3">
                  This tool doesn't push you into a mold. It helps you mold your own life. On your terms. With your values. One line at a time.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">✅ Ready?</h3>
            <div className="space-y-2 text-lg">
              <p>Let's turn chaos into clarity.</p>
              <p>Let's shorten the journey.</p>
              <p>Let's help you become the architect of your own life.</p>
            </div>
            <div className="mt-6">
              <p className="text-xl font-semibold text-blue-300">
                Start journaling with purpose.<br />
                Your castle is waiting.
              </p>
              <Button 
                onClick={() => window.location.href = '/register'}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-bold rounded-full transition-all duration-200"
              >
                GO!
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Quest Journal?</h2>
          <p className="text-white/80 text-lg">Everything you need to discover your purpose and achieve meaningful growth</p>
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
                <CardDescription className="text-white/80">{feature.description}</CardDescription>
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
            <CardDescription className="text-xl text-white/85">
              Join thousands of users who have discovered their purpose and achieved meaningful growth
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => window.location.href = '/register'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg font-medium"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Start Free Account
              </Button>
            </div>
            <p className="text-white/70 mt-4">No commitment • Full access during beta</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
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