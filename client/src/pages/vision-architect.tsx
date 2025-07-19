import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BetaFeature } from "@/hooks/useBetaAccess";
import { apiRequest } from "@/lib/queryClient";
import { Send, Sparkles, ArrowRight } from "lucide-react";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VisionData {
  categories: Record<string, {
    title: string;
    phrase: string;
    milestones: string[];
    icon?: string;
    color?: string;
  }>;
  commitmentTime: string;
  phase: 'chat' | 'board' | 'commitment';
  lifeVisionSummary?: string;
  extractedCategories?: Record<string, string>;
}

export default function VisionArchitect() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Vision Architect. I'll guide you through a structured exploration of 7 key areas of your life to create your complete vision. Instead of free-form conversation, I'll ask you specific questions about legacy, wealth, love, health, wisdom, spirituality, and character.\n\nThis process will be focused and efficient - each question is designed to extract the most meaningful insights for your life design.\n\nAre you ready to begin your structured life vision journey?",
      timestamp: new Date()
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [visionData, setVisionData] = useState<VisionData>({
    categories: {},
    commitmentTime: "",
    phase: 'chat'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest('/api/vision-architect/chat', 'POST', {
        messages: [...messages, { role: 'user', content: userMessage }],
        visionData
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }]);
      
      if (data.visionData) {
        setVisionData(data.visionData);
      }
      
      setIsTyping(false);
    },
    onError: (error: any) => {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  const handleSendMessage = () => {
    if (!currentInput.trim() || isTyping) return;

    const userMessage = {
      role: 'user' as const,
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsTyping(true);
    
    chatMutation.mutate(currentInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVisionBoard = () => {
    setVisionData(prev => ({ ...prev, phase: 'board' }));
  };

  const generateVisionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/vision-architect/generate', 'POST', {
        messages,
        visionData
      });
      return response.json();
    },
    onSuccess: (data) => {
      setVisionData(prev => ({
        ...prev,
        categories: data.ultimateGoals,
        lifeVisionSummary: data.lifeVisionSummary,
        extractedCategories: data.extractedCategories,
        phase: 'board'
      }));
      toast({
        title: "Vision Generated!",
        description: data.lifeVisionSummary ? "Your complete life vision with AI-enhanced insights has been created!" : "Your complete life vision with goals and milestones has been created.",
      });
    },
    onError: (error: any) => {
      console.error("Vision generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate vision. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateCompleteVision = () => {
    generateVisionMutation.mutate();
  };

  // Check if conversation is deep enough for vision generation
  const isConversationReady = () => {
    if (messages.length < 12) return false;
    
    // Check if user has shared substantial content
    const userMessages = messages.filter(m => m.role === 'user');
    const totalUserContent = userMessages.join(' ').length;
    
    // Look for keywords that indicate deep life exploration
    const conversationText = userMessages.join(' ').toLowerCase();
    const lifeKeywords = ['future', 'goal', 'dream', 'want', 'hope', 'feel', 'life', 'career', 'relationship', 'health', 'family', 'meaning', 'purpose', 'value', 'important', 'passionate', 'love', 'grow', 'learn', 'achieve', 'create', 'impact'];
    const keywordMatches = lifeKeywords.filter(keyword => conversationText.includes(keyword)).length;
    
    return totalUserContent > 800 && keywordMatches >= 8;
  };

  if (visionData.phase === 'board') {
    return <VisionBoard visionData={visionData} setVisionData={setVisionData} />;
  }

  if (visionData.phase === 'commitment') {
    return <CommitmentSystem visionData={visionData} setVisionData={setVisionData} />;
  }

  return (
    <BetaFeature fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Vision Architect
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Vision Architect is currently in beta testing. This feature will be available soon for all users.
            </p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Sparkles className="h-10 w-10 text-blue-400" />
              Vision Architect
            </h1>
            <p className="text-slate-300">
              Your AI-powered life design mentor
            </p>
          </div>

          {/* Chat Interface */}
          <Card className="bg-white/95 backdrop-blur-sm border-slate-300 shadow-2xl">
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator & Actions */}
          {isConversationReady() && (
            <Card className="mt-6 bg-white/95 backdrop-blur-sm border-slate-300">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="text-lg font-semibold">
                      Ready to Transform Your Vision Into Action
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    You've shared deep insights about your ideal life. Let me analyze everything and create your personalized vision with concrete goals, milestones, and visual representations.
                  </p>
                  
                  <Button
                    onClick={generateCompleteVision}
                    disabled={generateVisionMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 text-lg"
                  >
                    {generateVisionMutation.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating Your Vision...</span>
                      </div>
                    ) : (
                      <>
                        🎨 Generate My Complete Vision
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {Object.keys(visionData.categories).length > 0 && (
            <Card className="mt-6 bg-white/95 backdrop-blur-sm border-slate-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">
                      Vision Categories Discovered: {Object.keys(visionData.categories).length}
                    </span>
                  </div>
                  <Button
                    onClick={startVisionBoard}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    View Vision Board
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </BetaFeature>
  );
}

// Vision Board Component
function VisionBoard({ visionData, setVisionData }: { 
  visionData: VisionData, 
  setVisionData: (data: VisionData) => void 
}) {
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    // Initialize random positions for cards
    const positions: Record<string, { x: number, y: number }> = {};
    Object.keys(visionData.categories).forEach((category, index) => {
      positions[category] = {
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 200
      };
    });
    setCardPositions(positions);
  }, [visionData.categories]);

  const handleDragStart = (e: React.DragEvent, category: string) => {
    setDraggedCard(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedCard) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCardPositions(prev => ({
        ...prev,
        [draggedCard]: { x, y }
      }));
      setDraggedCard(null);
    }
  };

  const proceedToCommitment = () => {
    setVisionData(prev => ({ ...prev, phase: 'commitment' }));
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Vision Board</h1>
          <p className="text-slate-300">Drag the cards to arrange your life vision</p>
          
          {visionData.lifeVisionSummary && (
            <Card className="mt-6 bg-white/95 backdrop-blur-sm border-blue-300 max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-gray-900">AI-Enhanced Life Vision Summary</h3>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {visionData.lifeVisionSummary}
                </div>
                <div className="mt-4 text-xs text-gray-500 flex items-center gap-1">
                  <span>🤖</span>
                  <span>Enhanced by external n8n workflow</span>
                </div>
                
                {visionData.extractedCategories && (
                  <details className="mt-4">
                    <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                      View Extracted Life Categories →
                    </summary>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {Object.entries(visionData.extractedCategories).map(([category, value]) => (
                        <div key={category} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-semibold text-gray-700 capitalize mb-1">{category}</div>
                          <div className="text-gray-600">{value}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Canvas */}
        <div 
          className="relative bg-slate-800 rounded-lg border-2 border-slate-600 shadow-2xl overflow-hidden"
          style={{
            height: '600px',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {Object.entries(visionData.categories).map(([category, data]) => (
            <div
              key={category}
              draggable
              onDragStart={(e) => handleDragStart(e, category)}
              className="absolute cursor-move"
              style={{
                left: `${cardPositions[category]?.x || 0}px`,
                top: `${cardPositions[category]?.y || 0}px`,
                transform: draggedCard === category ? 'rotate(5deg)' : 'none'
              }}
            >
              <Card 
                className="w-72 bg-white/95 backdrop-blur-sm border-2 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105"
                style={{ borderColor: data.color || '#6B7280' }}
              >
                <CardContent className="p-4">
                  <div 
                    className="h-20 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: data.color ? `${data.color}20` : '#F3F4F6' }}
                  >
                    <div className="text-4xl">{data.icon || '🎯'}</div>
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{ backgroundColor: data.color || '#6B7280' }}
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{data.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{data.phrase}</p>
                  
                  {data.milestones && data.milestones.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Milestones:</div>
                      {data.milestones.slice(0, 3).map((milestone, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div 
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: data.color || '#6B7280' }}
                          />
                          <span className="text-xs text-gray-700 leading-relaxed">{milestone}</span>
                        </div>
                      ))}
                      {data.milestones.length > 3 && (
                        <div className="text-xs text-gray-500 italic">
                          +{data.milestones.length - 3} more...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={proceedToCommitment}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            I'm Ready to Commit
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Commitment System Component
function CommitmentSystem({ visionData, setVisionData }: { 
  visionData: VisionData, 
  setVisionData: (data: VisionData) => void 
}) {
  const [commitmentTime, setCommitmentTime] = useState("08:00");
  const [isComplete, setIsComplete] = useState(false);

  const handleCommit = () => {
    const updatedData = { ...visionData, commitmentTime };
    setVisionData(updatedData);
    
    // Save to localStorage
    localStorage.setItem('visionArchitectData', JSON.stringify(updatedData));
    
    setIsComplete(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Your Daily Commitment</h1>
          <p className="text-green-200">The final step in your vision journey</p>
        </div>

        {!isComplete ? (
          <Card className="bg-white/95 backdrop-blur-sm border-green-300">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">When do you want to reflect on your vision daily?</h3>
                  <p className="text-gray-600 mb-4">
                    Choose a time when you can spend 2-3 minutes connecting with your vision and setting a daily intention.
                  </p>
                  <Input
                    type="time"
                    value={commitmentTime}
                    onChange={(e) => setCommitmentTime(e.target.value)}
                    className="w-full text-lg"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What happens next:</h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li>• A daily reflection modal will appear at your chosen time</li>
                    <li>• You'll see your vision board briefly</li>
                    <li>• You'll be asked: "What's one step you can take today?"</li>
                    <li>• Your responses will be saved to track your progress</li>
                  </ul>
                </div>

                <Button
                  onClick={handleCommit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                >
                  I Commit to My Vision
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/95 backdrop-blur-sm border-green-300">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-4">Congratulations!</h3>
              <p className="text-gray-600 mb-6">
                You've completed your Vision Architect journey. Your vision board and daily commitment have been saved.
              </p>
              <p className="text-sm text-gray-500">
                Starting tomorrow at {commitmentTime}, you'll receive daily reflection prompts to help you stay aligned with your vision.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}