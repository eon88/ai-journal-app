import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BookOpen, Target, Heart, Users, Zap } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Smart Journaling",
      description: "Express yourself with custom symbols and automatic entry categorization"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Life Path Discovery",
      description: "Comprehensive questionnaire using FRAME→DESTINATION→MAP→COMPASS methodology"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI-Powered Insights",
      description: "Weekly and monthly reflections with Merlin, your AI guide"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Gamified Growth",
      description: "Level up with XP points, achievement badges, and daily challenges"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Streak & Progress",
      description: "Track your journaling consistency and personal growth over time"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Insights Vault",
      description: "Save and organize your most meaningful discoveries and goals"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Quest Journal
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            An AI-powered journaling experience that transforms personal reflection into 
            an immersive journey of self-discovery and growth.
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary">AI-Powered</Badge>
            <Badge variant="secondary">Gamified</Badge>
            <Badge variant="secondary">Personal Growth</Badge>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Our Mission</CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              Empowering personal transformation through intelligent journaling
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-800 dark:text-gray-200">
            <p className="mb-4">
              Life Path Companion was created to bridge the gap between traditional journaling 
              and modern technology. We believe that self-reflection is the cornerstone of 
              personal growth, and our platform makes this practice both engaging and insightful.
            </p>
            <p>
              By combining the proven benefits of structured journaling with AI-powered insights 
              and gamification elements, we've created a unique ecosystem that not only captures 
              your thoughts but actively helps you understand patterns, celebrate progress, and 
              discover your authentic path forward.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Features That Transform Your Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-journal-primary mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>



        {/* Values Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Our Values</CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              The principles that guide our development and design
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-800 dark:text-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Privacy First</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your journal entries and personal reflections are private and secure. 
                  We prioritize data protection and user privacy in everything we build.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Authentic Growth</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  We believe in genuine personal development over superficial metrics. 
                  Our features are designed to promote real self-awareness and growth.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Inclusive Design</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Our platform welcomes all journaling styles and personal paths. 
                  Whether you're new to reflection or a seasoned journaler, you belong here.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Continuous Innovation</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  We're constantly evolving our platform based on user feedback and 
                  the latest research in psychology, AI, and personal development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}