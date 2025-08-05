import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw, Target, Sparkles, Plus, Minus } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [zoomLevel, setZoomLevel] = useState(100);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [selectedSubBubble, setSelectedSubBubble] = useState<{ pillarId: string; stepIndex: number } | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [editingText, setEditingText] = useState<{ type: 'pillar' | 'subBubble' | 'task'; id: string; index?: number } | null>(null);
  const [draggedPillar, setDraggedPillar] = useState<string | null>(null);
  const [pillarPositions, setPillarPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { data: goals = [], isLoading, error } = useQuery<VisionGoal[]>({
    queryKey: ['/api/vision/goals'],
  });

  const handleRetakeQuestionnaire = () => {
    setLocation('/vision-questionnaire');
  };

  // Define pillar positions in a circle around the center
  const pillarNodes: PillarNode[] = [
    { id: 'health', name: 'Health', color: '#FFFFFF', x: 420, y: 200 },
    { id: 'wealth', name: 'Wealth', color: '#22C55E', x: 540, y: 130 },
    { id: 'love', name: 'Love', color: '#F8BBD0', x: 620, y: 200 },
    { id: 'legacy', name: 'Legacy', color: '#000000', x: 620, y: 350 },
    { id: 'wisdom', name: 'Wisdom', color: '#E5E7EB', x: 520, y: 420 },
    { id: 'spirituality', name: 'Spirituality', color: '#BFDBFE', x: 330, y: 420 },
    { id: 'character', name: 'Character', color: '#FEF3C7', x: 420, y: 350 },
  ];



  // Map goals to pillar nodes with custom positions
  const nodesWithGoals = pillarNodes.map(node => {
    const goal = goals.find(g => g.pillarId === node.id);
    const customPosition = pillarPositions[node.id];
    return {
      ...node,
      x: customPosition?.x ?? node.x,
      y: customPosition?.y ?? node.y,
      goal: goal?.goal,
      actionSteps: goal?.actionSteps || []
    };
  });

  const handleZoomIn = () => setZoomLevel(Math.min(200, zoomLevel + 10));
  const handleZoomOut = () => setZoomLevel(Math.max(20, zoomLevel - 10));

  const handlePillarClick = (pillarId: string) => {
    setExpandedPillar(expandedPillar === pillarId ? null : pillarId);
    setSelectedSubBubble(null); // Clear sub-bubble selection when clicking main pillar
  };

  const handleSubBubbleClick = (pillarId: string, stepIndex: number) => {
    setSelectedSubBubble({ pillarId, stepIndex });
  };

  const handleTaskToggle = (taskIndex: number) => {
    if (!selectedSubBubble) return;
    
    const taskKey = `${selectedSubBubble.pillarId}-${selectedSubBubble.stepIndex}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [taskKey]: !prev[taskKey]
    }));
  };

  const isSubBubbleComplete = (pillarId: string, stepIndex: number) => {
    const taskKeys = [0, 1, 2, 3].map(i => `${pillarId}-${stepIndex}-${i}`);
    return taskKeys.every(key => completedTasks[key] || false);
  };

  const handlePillarDrag = (pillarId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDraggedPillar(pillarId);
    
    const handleMouseMove = (e: MouseEvent) => {
      const svg = (e.target as Element).closest('svg');
      if (!svg) return;
      
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * (800 * 100/zoomLevel) + (400 - (400 * 100/zoomLevel));
      const y = ((e.clientY - rect.top) / rect.height) * (600 * 100/zoomLevel) + (300 - (300 * 100/zoomLevel));
      
      setPillarPositions(prev => ({
        ...prev,
        [pillarId]: { x, y }
      }));
    };
    
    const handleMouseUp = () => {
      setDraggedPillar(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Vision Board
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm md:text-base">
                {isMobile ? "Tap to expand goals • Pinch to zoom • Double-tap text to edit" : "Click to expand goals • Drag to rearrange • Double-click text to edit"}
              </p>
            </div>
            <Button 
              onClick={handleRetakeQuestionnaire}
              variant="outline"
              className="flex items-center gap-2 text-xs md:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Retake Questionnaire</span>
              <span className="sm:hidden">Retake</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Vision Board Canvas - Works on both mobile and desktop */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Zoom Controls - Responsive positioning */}
        <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-10 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-lg`}>
          <Button size="sm" variant="ghost" onClick={handleZoomOut}>
            <Minus size={isMobile ? 14 : 16} />
          </Button>
          <span className={`${isMobile ? 'text-xs px-1' : 'text-sm px-2'} font-medium text-gray-700 dark:text-gray-300`}>
            {zoomLevel}%
          </span>
          <Button size="sm" variant="ghost" onClick={handleZoomIn}>
            <Plus size={isMobile ? 14 : 16} />
          </Button>
          <Button size="sm" variant="ghost">
            <RefreshCw size={isMobile ? 14 : 16} />
          </Button>
        </div>

        {/* SVG Canvas - Mobile optimized */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`${400 - (400 * 100/zoomLevel)} ${300 - (300 * 100/zoomLevel)} ${800 * 100/zoomLevel} ${600 * 100/zoomLevel}`}
          className="w-full h-full transition-all duration-200 touch-manipulation"
          style={{ touchAction: 'pan-x pan-y' }}
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
                className={`${isMobile ? 'cursor-pointer' : 'cursor-move'} transition-all duration-200 hover:opacity-80 ${draggedPillar === node.id ? 'opacity-60' : ''}`}
                onClick={() => handlePillarClick(node.id)}
                onMouseDown={!isMobile ? (e) => handlePillarDrag(node.id, e) : undefined}
              />
              {editingText?.type === 'pillar' && editingText.id === node.id ? (
                <foreignObject x="-35" y="-10" width="70" height="20">
                  <input
                    type="text"
                    defaultValue={node.name}
                    className={`w-full h-full text-center text-xs font-bold border border-gray-300 dark:border-gray-600 rounded px-1 outline-none ${
                      node.id === 'legacy' ? 'bg-white text-black' : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                    }`}
                    onBlur={(e) => {
                      console.log(`Updated pillar ${node.id} name to: ${e.target.value}`);
                      setEditingText(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur();
                      }
                      if (e.key === 'Escape') {
                        setEditingText(null);
                      }
                    }}
                    autoFocus
                  />
                </foreignObject>
              ) : (
                <>
                  {/* Emoji icons for the pillars */}
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fontSize="20"
                    className="select-none"
                  >
                    {node.id === 'health' && '🫀'}
                    {node.id === 'wealth' && '💰'}
                    {node.id === 'love' && '❤️'}
                    {node.id === 'legacy' && '🌳'}
                    {node.id === 'wisdom' && '📚'}
                    {node.id === 'spirituality' && '✨'}
                    {node.id === 'character' && '🛡️'}
                  </text>
                  
                  <text
                    x="0"
                    y="18"
                    textAnchor="middle"
                    fill={node.id === 'health' || node.id === 'wisdom' || node.id === 'character' ? '#374151' : 'white'}
                    fontSize="9"
                    fontWeight="bold"
                    className="cursor-pointer select-none"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingText({ type: 'pillar', id: node.id });
                    }}
                  >
                    {node.name}
                  </text>
                </>
              )}
              
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
                    
                    const isComplete = isSubBubbleComplete(node.id, index);
                    
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
                        
                        {/* Completion checkmark */}
                        {isComplete && (
                          <circle
                            cx="15"
                            cy="-15"
                            r="8"
                            fill="#22C55E"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )}
                        {isComplete && (
                          <svg x="10" y="-20" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                        )}
                        
                        {editingText?.type === 'subBubble' && editingText.id === node.id && editingText.index === index ? (
                          <foreignObject x="-25" y="-12" width="50" height="24">
                            <input
                              type="text"
                              defaultValue={step}
                              className="w-full h-full text-center text-xs font-bold bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded px-1 outline-none"
                              onBlur={(e) => {
                                console.log(`Updated sub-bubble ${node.id}-${index} text to: ${e.target.value}`);
                                setEditingText(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                                if (e.key === 'Escape') {
                                  setEditingText(null);
                                }
                              }}
                              autoFocus
                            />
                          </foreignObject>
                        ) : (
                          <>
                            <text
                              x="0"
                              y="-2"
                              textAnchor="middle"
                              fill={node.id === 'health' || node.id === 'wisdom' || node.id === 'character' ? '#374151' : 'white'}
                              fontSize="7"
                              fontWeight="bold"
                              className="cursor-pointer"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setEditingText({ type: 'subBubble', id: node.id, index });
                              }}
                            >
                              {line1}
                            </text>
                            {line2 && (
                              <text
                                x="0"
                                y="8"
                                textAnchor="middle"
                                fill={node.id === 'health' || node.id === 'wisdom' || node.id === 'character' ? '#374151' : 'white'}
                                fontSize="7"
                                fontWeight="bold"
                                className="cursor-pointer"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingText({ type: 'subBubble', id: node.id, index });
                                }}
                              >
                                {line2}
                              </text>
                            )}
                          </>
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
                        {['Research Destinations', 'Save Budget', 'Book Flights', 'Plan Itinerary'].map((taskName, taskIndex) => {
                          const taskKey = `${selectedSubBubble.pillarId}-${selectedSubBubble.stepIndex}-${taskIndex}`;
                          const isCompleted = completedTasks[taskKey] || false;
                          
                          return (
                            <div key={taskIndex} className="text-center">
                              <div className="flex flex-col items-center gap-2">
                                <button 
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                    isCompleted
                                      ? 'border-green-500 bg-green-500 text-white' 
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                  }`}
                                  onClick={() => handleTaskToggle(taskIndex)}
                                >
                                  {isCompleted && (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                  )}
                                </button>
                                {editingText?.type === 'task' && editingText.id === selectedSubBubble.pillarId && editingText.index === taskIndex ? (
                                  <input
                                    type="text"
                                    defaultValue={taskName}
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-center outline-none rounded px-2 py-1"
                                    onBlur={(e) => {
                                      console.log(`Updated task ${taskIndex} text to: ${e.target.value}`);
                                      setEditingText(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.currentTarget.blur();
                                      }
                                      if (e.key === 'Escape') {
                                        setEditingText(null);
                                      }
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <span 
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                                    onDoubleClick={() => setEditingText({ type: 'task', id: selectedSubBubble.pillarId, index: taskIndex })}
                                  >
                                    {taskName}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {['2 months', '$200/month', '3 months ahead', '1 month ahead'][taskIndex]}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Progress bar */}
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        {(() => {
                          const completedCount = ['Research Destinations', 'Save Budget', 'Book Flights', 'Plan Itinerary']
                            .filter((_, taskIndex) => {
                              const taskKey = `${selectedSubBubble.pillarId}-${selectedSubBubble.stepIndex}-${taskIndex}`;
                              return completedTasks[taskKey] || false;
                            }).length;
                          
                          return (
                            <div 
                              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                              style={{ 
                                backgroundColor: pillar?.color,
                                width: `${(completedCount / 4) * 100}%`
                              }}
                            />
                          );
                        })()}
                        
                        {/* Timeline markers on progress bar */}
                        {[0, 1, 2, 3].map((markerIndex) => {
                          const taskKey = `${selectedSubBubble.pillarId}-${selectedSubBubble.stepIndex}-${markerIndex}`;
                          const isCompleted = completedTasks[taskKey] || false;
                          
                          return (
                            <div
                              key={markerIndex}
                              className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                                isCompleted
                                  ? 'border-white bg-green-500' 
                                  : 'border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-600'
                              }`}
                              style={{
                                left: `${(markerIndex / 3) * 100}%`,
                                marginLeft: '-6px'
                              }}
                            />
                          );
                        })}
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