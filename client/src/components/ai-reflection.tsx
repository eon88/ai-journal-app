import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Lightbulb, 
  HelpCircle, 
  TrendingUp, 
  Bookmark, 
  Share, 
  RotateCcw,
  AlertTriangle 
} from "lucide-react";
import type { AIReflection } from "@shared/schema";

interface AIReflectionProps {
  reflection: AIReflection | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => void;
}

export function AIReflectionComponent({ 
  reflection, 
  isLoading, 
  error, 
  onRegenerate 
}: AIReflectionProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
    // TODO: Implement save functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-journal-light to-white rounded-xl shadow-sm border border-journal-border p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-journal-accent rounded-full flex items-center justify-center">
            <Bot className="text-white text-sm" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Reflection</h2>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-journal-primary"></div>
            <p className="text-sm text-gray-500">AI is reflecting on your entry...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-journal-light to-white rounded-xl shadow-sm border border-journal-border p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-journal-accent rounded-full flex items-center justify-center">
            <Bot className="text-white text-sm" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Reflection</h2>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-2 w-5 h-5" />
            <p className="text-red-700 text-sm flex-1">
              {error}
            </p>
            <Button 
              onClick={onRegenerate}
              variant="outline"
              size="sm"
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!reflection) {
    return (
      <div className="bg-gradient-to-br from-journal-light to-white rounded-xl shadow-sm border border-journal-border p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-journal-accent rounded-full flex items-center justify-center">
            <Bot className="text-white text-sm" />
          </div>
          <h2 className="text-xl font-semibold text-white">AI Reflection</h2>
        </div>
        
        <div className="text-center py-12 text-white">
          <p>Write a journal entry above to get AI-powered insights and reflections.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-journal-light to-white rounded-xl shadow-sm border border-journal-border p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-journal-accent rounded-full flex items-center justify-center">
          <Bot className="text-white text-sm" />
        </div>
        <h2 className="text-xl font-semibold text-white">AI Reflection</h2>
        <div className="flex-1"></div>
        <Button 
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="text-sm text-gray-500 hover:text-journal-primary"
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      <div className="prose prose-gray max-w-none leading-relaxed">
        <div className="bg-white rounded-lg p-6 border border-journal-border">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-journal-text mb-2 flex items-center">
                <Lightbulb className="text-journal-accent mr-2 w-5 h-5" />
                Key Insights
              </h3>
              <p className="text-gray-700">
                {reflection.insights}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-journal-text mb-2 flex items-center">
                <HelpCircle className="text-journal-primary mr-2 w-5 h-5" />
                Reflection Question
              </h3>
              <p className="text-gray-700 italic bg-journal-light p-3 rounded-lg border-l-4 border-journal-primary">
                "{reflection.reflectionQuestion}"
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-journal-text mb-2 flex items-center">
                <TrendingUp className="text-green-500 mr-2 w-5 h-5" />
                Growth Pattern
              </h3>
              <p className="text-gray-700">
                {reflection.growthPattern}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-journal-border">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <span className="mr-1">✨</span>
            Powered by GPT-4o
          </span>
          <span>Response time: {reflection.processingTime.toFixed(1)}s</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-sm text-gray-500 hover:text-journal-primary"
          >
            <Share className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            className="text-sm text-gray-500 hover:text-journal-primary"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
