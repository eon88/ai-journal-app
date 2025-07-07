import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Heart, Clock, Send, CheckCircle, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error Sending Message",
        description: "There was a problem sending your message. Please try again or contact us directly at tiny0.0thinker@gmail.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      description: "Get help with technical issues or account questions",
      contact: "tiny0.0thinker@gmail.com",
      responseTime: "Within 24 hours"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "General Inquiries",
      description: "Questions about features, partnerships, or feedback",
      contact: "tiny0.0thinker@gmail.com", 
      responseTime: "Within 48 hours"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Share Your Story",
      description: "Tell us how Life Path Companion has impacted your journey",
      contact: "tiny0.0thinker@gmail.com",
      responseTime: "We read every message"
    }
  ];

  const faqs = [
    {
      question: "Is my journal data private and secure?",
      answer: "Absolutely. Your journal entries are encrypted and stored securely. We never share personal data with third parties, and you maintain full control over your information."
    },
    {
      question: "How does the AI analysis work?",
      answer: "Our AI uses OpenAI's GPT-4o to analyze patterns in your entries and provide insights. The analysis happens securely and your data is processed according to strict privacy guidelines."
    },
    {
      question: "How long are my entries stored?",
      answer: "Your journal entries are stored securely for as long as you maintain your account. You have full control over your data and can delete entries individually if needed."
    },
    {
      question: "Do I need to journal every day?",
      answer: "Not at all! While daily journaling can build great habits, the platform works with whatever schedule suits you. Quality reflection matters more than frequency."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            We're here to help you on your journey. Whether you have questions, 
            feedback, or just want to share your story, we'd love to hear from you.
          </p>
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Average response: 24 hours
          </Badge>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="text-journal-primary mb-3 flex justify-center">
                  {method.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {method.description}
                </p>
                <div className="text-journal-primary font-medium text-sm mb-1">
                  {method.contact}
                </div>
                <div className="text-xs text-gray-400">
                  {method.responseTime}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Send us a message</CardTitle>
              <CardDescription className="text-gray-300">
                Fill out the form below and we'll get back to you soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Name *
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Your name"
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="What's this about?"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-journal-primary hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-gray-300">
                Quick answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                  <h4 className="font-medium text-white mb-2 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-journal-primary mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </h4>
                  <p className="text-sm text-gray-300 ml-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Community Section */}
        <Card className="glass-card text-center">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-white mb-3">
              Join Our Community
            </h3>
            <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
              Connect with other journalers, share insights, and be part of a community 
              dedicated to personal growth and self-discovery.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/forum'}
                className="bg-journal-primary hover:bg-indigo-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Visit Community Forum
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}