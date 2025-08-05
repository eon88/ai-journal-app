import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Types for vision data
type Pillar = {
  id: string;
  name: string;
  color: string;
  emoji: string;
};

type Goal = {
  pillarId: string;
  description: string;
  actionSteps: string[];
};

type Node = Pillar & {
  x: number;
  y: number;
  goal?: string;
  actionSteps: string[];
};

export default function VisionBoard() {
  // State management
  const [goals, setGoals] = useState<Goal[]>([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [selectedSubBubble, setSelectedSubBubble] = useState<{ pillarId: string; stepIndex: number } | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [editingText, setEditingText] = useState<{ type: 'pillar' | 'subBubble' | 'task'; id: string; index?: number } | null>(null);
  const [draggedPillar, setDraggedPillar] = useState<string | null>(null);
  const [pillarPositions, setPillarPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredSubBubble, setHoveredSubBubble] = useState<{ pillarId: string; stepIndex: number } | null>(null);

  // Pillars configuration
  const pillars: Pillar[] = [
    { id: 'health', name: 'Health', color: '#ffffff', emoji: '🫀' },
    { id: 'wealth', name: 'Wealth', color: '#22c55e', emoji: '💰' }, 
    { id: 'love', name: 'Love', color: '#fce7f3', emoji: '❤️' },
    { id: 'legacy', name: 'Legacy', color: '#000000', emoji: '🌳' },
    { id: 'wisdom', name: 'Wisdom', color: '#f3f4f6', emoji: '📚' },
    { id: 'spirituality', name: 'Spirituality', color: '#dbeafe', emoji: '✨' },
    { id: 'character', name: 'Character', color: '#fefce8', emoji: '🛡️' }
  ];

  // Default positions for pillars in a circle
  const defaultPositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const radius = 150;
    const angleStep = (2 * Math.PI) / pillars.length;
    
    pillars.forEach((pillar, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      positions[pillar.id] = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };
    });
    
    return positions;
  }, []);

  // Initialize positions
  useEffect(() => {
    setPillarPositions(defaultPositions);
  }, [defaultPositions]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sample goals data
  useEffect(() => {
    const sampleGoals: Goal[] = [
      {
        pillarId: 'health',
        description: 'Feel light, energized, and strong in my body',
        actionSteps: [
          'Create a morning routine that includes movement',
          'Fix sleep to 8 hours/night',
          'Reach a sustainable weight',
          'Build consistent exercise habits'
        ]
      },
      {
        pillarId: 'wealth',
        description: 'Deepen connecting with my partner',
        actionSteps: [
          'Max out contributions to retirement accounts',
          'Pay off mortgage in full',
          'Build an emergency fund',
          'Start investment portfolio'
        ]
      },
      {
        pillarId: 'love',
        description: 'Deepen connection with my partner',
        actionSteps: [
          'Schedule date nights every week',
          'Share more openly',
          'Plan a trip to Italy together',
          'Practice active listening'
        ]
      },
      {
        pillarId: 'legacy',
        description: 'Create something lasting for my son',
        actionSteps: [
          'Start writing a values-based letter every month',
          'Build the cabin project together',
          'Teach him life skills I never learned',
          'Document family history'
        ]
      },
      {
        pillarId: 'wisdom',
        description: 'Read more and expand my thinking',
        actionSteps: [
          'Read 20+ books per year',
          'Take a philosophy class',
          'Join a book club',
          'Start journaling regularly'
        ]
      },
      {
        pillarId: 'spirituality',
        description: 'Live in the present moment',
        actionSteps: [
          'Explore mindfulness practices',
          'Go on a meditation retreat',
          'Practice gratitude daily',
          'Connect with nature weekly'
        ]
      },
      {
        pillarId: 'character',
        description: 'Become a better listener',
        actionSteps: [
          'Develop patience',
          'Revisit conversation habits',
          'Ask more questions',
          'Practice empathy daily'
        ]
      }
    ];
    setGoals(sampleGoals);
  }, []);

  // Helper functions
  const handleZoomIn = () => setZoomLevel(Math.min(200, zoomLevel + 10));
  const handleZoomOut = () => setZoomLevel(Math.max(20, zoomLevel - 10));

  const handlePillarClick = (pillarId: string) => {
    setExpandedPillar(expandedPillar === pillarId ? null : pillarId);
  };

  const handleSubBubbleClick = (pillarId: string, stepIndex: number) => {
    // Just open the task details modal
    setSelectedSubBubble({ pillarId, stepIndex });
  };

  const handleTaskCompletion = (pillarId: string, stepIndex: number) => {
    const taskKey = `${pillarId}-${stepIndex}`;
    if (completedTasks[taskKey]) {
      const newCompleted = { ...completedTasks };
      delete newCompleted[taskKey];
      setCompletedTasks(newCompleted);
    } else {
      setCompletedTasks(prev => ({ ...prev, [taskKey]: true }));
    }
  };

  const isSubBubbleComplete = (pillarId: string, stepIndex: number) => {
    return completedTasks[`${pillarId}-${stepIndex}`] || false;
  };

  const handlePillarDrag = (pillarId: string, event: React.MouseEvent) => {
    if (isMobile) return;
    
    setDraggedPillar(pillarId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startPos = pillarPositions[pillarId];

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      setPillarPositions(prev => ({
        ...prev,
        [pillarId]: {
          x: startPos.x + deltaX * (100 / zoomLevel),
          y: startPos.y + deltaY * (100 / zoomLevel)
        }
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

  // Create nodes with goals data
  const nodesWithGoals: Node[] = pillars.map(pillar => {
    const goal = goals.find(g => g.pillarId === pillar.id);
    const position = pillarPositions[pillar.id] || { x: 0, y: 0 };
    
    return {
      ...pillar,
      x: position.x,
      y: position.y,
      goal: goal?.description || '',
      actionSteps: goal?.actionSteps || []
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Life Vision Board
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore your 7 Pillars of Life and set meaningful goals
            </p>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleZoomOut}
              variant="outline"
              size="sm"
              className="px-3 py-1"
            >
              -
            </Button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-12 text-center">
              {zoomLevel}%
            </span>
            <Button 
              onClick={handleZoomIn}
              variant="outline"
              size="sm"
              className="px-3 py-1"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Vision Board SVG */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg">
        <svg
          width="100%"
          height="600"
          viewBox="-300 -300 600 600"
          className="touch-manipulation"
          style={{ cursor: draggedPillar ? 'grabbing' : 'grab' }}
        >
          {/* Gradient definitions */}
          <defs>
            <radialGradient id="centralGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#34d399', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.6 }} />
            </radialGradient>
          </defs>

          {/* Main container with zoom */}
          <g transform={`scale(${zoomLevel / 100})`}>
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
                      {node.emoji}
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

                {/* Sub-bubbles for expanded pillars */}
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
                            r="20"
                            fill={isComplete ? "#10B981" : node.color}
                            stroke={selectedSubBubble?.pillarId === node.id && selectedSubBubble?.stepIndex === index ? "#374151" : "white"}
                            strokeWidth={selectedSubBubble?.pillarId === node.id && selectedSubBubble?.stepIndex === index ? "3" : "2"}
                            className="cursor-pointer transition-all duration-200 hover:opacity-80 hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubBubbleClick(node.id, index);
                            }}
                            onMouseEnter={() => !isMobile && setHoveredSubBubble({ pillarId: node.id, stepIndex: index })}
                            onMouseLeave={() => !isMobile && setHoveredSubBubble(null)}
                          />
                          
                          {isComplete ? (
                            <text
                              x="0"
                              y="6"
                              textAnchor="middle"
                              fill="white"
                              fontSize="16"
                              fontWeight="bold"
                            >
                              ✓
                            </text>
                          ) : (
                            <text
                              x="0"
                              y="6"
                              textAnchor="middle"
                              fill="white"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              {index + 1}
                            </text>
                          )}

                          {editingText?.type === 'subBubble' && editingText.id === node.id && editingText.index === index ? (
                            <foreignObject x="-50" y="30" width="100" height="50">
                              <input
                                type="text"
                                defaultValue={step}
                                className="w-full h-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                                onBlur={(e) => {
                                  console.log(`Updated sub-bubble ${index} for ${node.id}: ${e.target.value}`);
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
                              {/* Text label for sub-bubble */}
                              <text
                                x="0"
                                y="45"
                                textAnchor="middle"
                                fill="#374151"
                                fontSize="8"
                                fontWeight="medium"
                                className="cursor-pointer select-none"
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingText({ type: 'subBubble', id: node.id, index });
                                }}
                              >
                                {line1}
                              </text>
                              
                              {/* Second line if text is long */}
                              {line2 && (
                                <text
                                  x="0"
                                  y="55"
                                  textAnchor="middle"
                                  fill="#6B7280"
                                  fontSize="7"
                                  className="cursor-pointer select-none"
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingText({ type: 'subBubble', id: node.id, index });
                                  }}
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
                          </>
                          )}
                        </g>
                      );
                    })}
                  </>
                )}
              </g>
            ))}

            {/* Central Vision Hub */}
            <g>
              <circle
                cx="0"
                cy="0"
                r="50"
                fill="url(#centralGradient)"
                stroke="#374151"
                strokeWidth="3"
                className="animate-pulse"
              />
              <text
                x="0"
                y="-8"
                textAnchor="middle"
                fill="#374151"
                fontSize="14"
                fontWeight="bold"
              >
                Life
              </text>
              <text
                x="0"
                y="8"
                textAnchor="middle"
                fill="#374151"
                fontSize="14"
                fontWeight="bold"
              >
                Vision
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Hover Tooltip for Sub-bubbles */}
      {hoveredSubBubble && !isMobile && (
        <div className="fixed z-50 pointer-events-none">
          <div 
            className="bg-black dark:bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg max-w-48"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -120%)'
            }}
          >
            {(() => {
              const pillar = nodesWithGoals.find(n => n.id === hoveredSubBubble.pillarId);
              return pillar?.actionSteps?.[hoveredSubBubble.stepIndex] || '';
            })()}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedSubBubble && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task Details
              </h3>
              <button
                onClick={() => setSelectedSubBubble(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Task Description
                </label>
                {editingText?.type === 'task' ? (
                  <textarea
                    defaultValue={(() => {
                      const pillar = nodesWithGoals.find(n => n.id === selectedSubBubble.pillarId);
                      return pillar?.actionSteps?.[selectedSubBubble.stepIndex] || '';
                    })()}
                    className="w-full h-20 text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
                    onBlur={(e) => {
                      console.log(`Updated task for ${selectedSubBubble.pillarId}[${selectedSubBubble.stepIndex}]: ${e.target.value}`);
                      setEditingText(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.currentTarget.blur();
                      }
                      if (e.key === 'Escape') {
                        setEditingText(null);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    className="w-full min-h-20 text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white cursor-pointer"
                    onDoubleClick={() => setEditingText({ type: 'task', id: selectedSubBubble.pillarId, index: selectedSubBubble.stepIndex })}
                  >
                    {(() => {
                      const pillar = nodesWithGoals.find(n => n.id === selectedSubBubble.pillarId);
                      return pillar?.actionSteps?.[selectedSubBubble.stepIndex] || 'No description available';
                    })()}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Double-click to edit
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSubBubbleComplete(selectedSubBubble.pillarId, selectedSubBubble.stepIndex)}
                    onChange={() => handleTaskCompletion(selectedSubBubble.pillarId, selectedSubBubble.stepIndex)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Mark as completed</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};