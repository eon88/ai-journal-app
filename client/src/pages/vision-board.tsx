import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw, Target, Sparkles, Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

interface VisionGoal {
  id: number;
  userId: number;
  responseId: number;
  pillarId: string;
  pillarName: string;
  goal: string;
  actionSteps: string[];
  createdAt: string;
  updatedAt: string;
}

interface PillarNode {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  goal?: string;
  actionSteps?: string[];
}

export default function VisionBoard() {
  const [, setLocation] = useLocation();
  const [zoomLevel, setZoomLevel] = useState(50);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [selectedSubBubble, setSelectedSubBubble] = useState<{ pillarId: string; stepIndex: number } | null>(null);

  const { data: goals = [], isLoading, error } = useQuery<VisionGoal[]>({
    queryKey: ['/api/vision/goals'],
  });

  const handleRetakeQuestionnaire = () => {
    setLocation('/vision-questionnaire');
  };

  // Define pillar positions in a circle around the center
  const pillarNodes: PillarNode[] = [
    { id: 'health', name: 'Health', color: '#EF4444', x: 420, y: 200 },
    { id: 'wealth', name: 'Wealth', color: '#F97316', x: 540, y: 130 },
    { id: 'love', name: 'Love', color: '#EC4899', x: 620, y: 200 },
    { id: 'legacy', name: 'Legacy', color: '#8B5CF6', x: 620, y: 350 },
    { id: 'wisdom', name: 'Wisdom', color: '#EAB308', x: 520, y: 420 },
    { id: 'spirituality', name: 'Spirituality', color: '#22C55E', x: 330, y: 420 },
    { id: 'character', name: 'Character', color: '#3B82F6', x: 420, y: 350 },
  ];

  // Map goals to pillar nodes
  const nodesWithGoals = pillarNodes.map(node => {
    const goal = goals.find(g => g.pillarId === node.id);
    return {
      ...node,
      goal: goal?.goal,
      actionSteps: goal?.actionSteps
    };
  });

  const handleZoomIn = () => setZoomLevel(Math.min(100, zoomLevel + 10));
  const handleZoomOut = () => setZoomLevel(Math.max(20, zoomLevel - 10));

  const handlePillarClick = (pillarId: string) => {
    setExpandedPillar(expandedPillar === pillarId ? null : pillarId);
    setSelectedSubBubble(null); // Clear sub-bubble selection when clicking main pillar
  };

  const handleSubBubbleClick = (pillarId: string, stepIndex: number) => {
    setSelectedSubBubble({ pillarId, stepIndex });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading your vision board...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <p className="text-lg text-red-600 dark:text-red-400">Error loading vision board</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6">
              <Target className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Complete Your Vision Questionnaire
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Answer 7 deep questions to generate your personalized life vision board
                </p>
                <Button onClick={handleRetakeQuestionnaire} size="lg" className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Start Questionnaire
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Your Life Vision
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Click to expand goals • Drag to rearrange
              </p>
            </div>
            <Button 
              onClick={handleRetakeQuestionnaire}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Retake Questionnaire
            </Button>
          </div>
        </div>
      </div>

      {/* Vision Board Canvas */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-lg">
          <Button size="sm" variant="ghost" onClick={handleZoomOut}>
            <Minus size={16} />
          </Button>
          <span className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">
            {zoomLevel}%
          </span>
          <Button size="sm" variant="ghost" onClick={handleZoomIn}>
            <Plus size={16} />
          </Button>
          <Button size="sm" variant="ghost">
            <RefreshCw size={16} />
          </Button>
        </div>

        {/* SVG Canvas */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`${400 - (400 * zoomLevel/100)} ${300 - (300 * zoomLevel/100)} ${800 * zoomLevel/100} ${600 * zoomLevel/100}`}
          className="w-full h-full transition-all duration-200"
        >
          {/* Background */}
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
          </defs>
          <rect width="800" height="600" fill="url(#bgGradient)" />

          {/* Connection Lines */}
          {nodesWithGoals.map((node) => (
            <line
              key={`line-${node.id}`}
              x1="400"
              y1="300"
              x2={node.x}
              y2={node.y}
              stroke="#e2e8f0"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}

          {/* Central Vision Board Node */}
          <g transform="translate(400, 300)">
            <circle
              cx="0"
              cy="0"
              r="40"
              fill="#374151"
              stroke="#6b7280"
              strokeWidth="2"
            />
            <text
              x="0"
              y="-5"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              Vision
            </text>
            <text
              x="0"
              y="8"
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              Board
            </text>
          </g>

          {/* Pillar Nodes */}
          {nodesWithGoals.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle
                cx="0"
                cy="0"
                r="35"
                fill={node.color}
                stroke={expandedPillar === node.id ? "#374151" : "white"}
                strokeWidth={expandedPillar === node.id ? "3" : "2"}
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => handlePillarClick(node.id)}
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {node.name}
              </text>
              
              {/* Sub-bubbles for action steps when expanded */}
              {expandedPillar === node.id && node.actionSteps && (
                <>
                  {node.actionSteps.slice(0, 4).map((step, index) => {
                    // Position sub-bubbles further outside around the main bubble
                    const positions = [
                      { x: -45, y: -60 }, // top left
                      { x: 45, y: -60 },  // top right  
                      { x: -60, y: 30 },  // bottom left
                      { x: 60, y: 30 },   // bottom right
                    ];
                    const pos = positions[index] || { x: 0, y: -70 };
                    
                    // Truncate long text to fit in bubble
                    const truncatedText = step.length > 15 ? step.substring(0, 12) + "..." : step;
                    const words = truncatedText.split(' ');
                    const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                    const line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
                    
                    return (
                      <g key={`sub-${index}`} transform={`translate(${pos.x}, ${pos.y})`}>
                        <circle
                          cx="0"
                          cy="0"
                          r="22"
                          fill={node.color}
                          fillOpacity="0.9"
                          stroke={selectedSubBubble?.pillarId === node.id && selectedSubBubble?.stepIndex === index ? "#374151" : "white"}
                          strokeWidth={selectedSubBubble?.pillarId === node.id && selectedSubBubble?.stepIndex === index ? "3" : "2"}
                          className="animate-in fade-in duration-300 cursor-pointer hover:opacity-80"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubBubbleClick(node.id, index);
                          }}
                        />
                        <text
                          x="0"
                          y="-2"
                          textAnchor="middle"
                          fill="white"
                          fontSize="7"
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {line1}
                        </text>
                        {line2 && (
                          <text
                            x="0"
                            y="8"
                            textAnchor="middle"
                            fill="white"
                            fontSize="7"
                            fontWeight="bold"
                            className="pointer-events-none"
                          >
                            {line2}
                          </text>
                        )}
                        {/* Connecting line to main bubble */}
                        <line
                          x1="0"
                          y1="0"
                          x2={-pos.x * 0.6}
                          y2={-pos.y * 0.6}
                          stroke={node.color}
                          strokeWidth="1"
                          strokeOpacity="0.4"
                          strokeDasharray="3,3"
                          className="pointer-events-none"
                        />
                      </g>
                    );
                  })}
                </>
              )}
            </g>
          ))}
        </svg>
      </div>



      {/* Timeline Panel at Bottom - Sub-bubble Selected */}
      {selectedSubBubble && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out z-40">
          <div className="container mx-auto px-6 py-6">
            {(() => {
              const pillar = nodesWithGoals.find(n => n.id === selectedSubBubble.pillarId);
              const goal = goals.find(g => g.pillarId === selectedSubBubble.pillarId);
              const selectedStep = goal?.actionSteps?.[selectedSubBubble.stepIndex];
              
              return (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: pillar?.color }}
                      >
                        <span className="text-white font-bold text-lg">
                          {selectedSubBubble.stepIndex + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedStep}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {pillar?.name} - Milestone Timeline
                        </p>
                      </div>
                    </div>
                    
                    {/* Timeline visualization with checkable tasks */}
                    <div className="relative">
                      <div className="grid grid-cols-4 gap-4 mb-6">
                        {['Research Destinations', 'Save Budget', 'Book Flights', 'Plan Itinerary'].map((taskName, taskIndex) => (
                          <div key={taskIndex} className="text-center">
                            <div className="flex flex-col items-center gap-2">
                              <button 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  taskIndex <= selectedSubBubble.stepIndex 
                                    ? 'border-green-500 bg-green-500 text-white' 
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                                onClick={() => {
                                  // Toggle task completion - this would update the backend in real implementation
                                  console.log(`Toggled task ${taskIndex}: ${taskName}`);
                                }}
                              >
                                {taskIndex <= selectedSubBubble.stepIndex && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                  </svg>
                                )}
                              </button>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {taskName}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {['2 months', '$200/month', '3 months ahead', '1 month ahead'][taskIndex]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Progress bar */}
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: pillar?.color,
                            width: `${((selectedSubBubble.stepIndex + 1) / 4) * 100}%`
                          }}
                        />
                        
                        {/* Timeline markers on progress bar */}
                        {[0, 1, 2, 3].map((markerIndex) => (
                          <div
                            key={markerIndex}
                            className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                              markerIndex <= selectedSubBubble.stepIndex 
                                ? 'border-white bg-green-500' 
                                : 'border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-600'
                            }`}
                            style={{
                              left: `${(markerIndex / 3) * 100}%`,
                              marginLeft: '-6px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSubBubble(null)}
                    className="ml-4"
                  >
                    ✕
                  </Button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}