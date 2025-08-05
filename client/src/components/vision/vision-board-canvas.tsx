import { useState, useEffect, useRef } from "react";
import { VisionGoal } from "@shared/schema";

interface VisionBoardCanvasProps {
  goals: VisionGoal[];
  onGoalClick: (goal: VisionGoal) => void;
  categories: Array<{ id: string; name: string; color: string; icon: string }>;
}

export function VisionBoardCanvas({ goals, onGoalClick, categories }: VisionBoardCanvasProps) {
  const [draggedGoal, setDraggedGoal] = useState<VisionGoal | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Position goals in a circle around the center
  const positionGoals = (goalsList: VisionGoal[]) => {
    const centerX = 400;
    const centerY = 400;
    const radius = 250;
    
    return goalsList.map((goal, index) => {
      const angle = (index * 2 * Math.PI) / goalsList.length - Math.PI / 2;
      return {
        ...goal,
        x: centerX + radius * Math.cos(angle) - 70,
        y: centerY + radius * Math.sin(angle) - 70,
      };
    });
  };

  const positionedGoals = positionGoals(goals);

  const handleDragStart = (e: React.DragEvent, goal: VisionGoal) => {
    setDraggedGoal(goal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedGoal && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom - 70;
      const y = (e.clientY - rect.top) / zoom - 70;
      
      // Update goal position - would normally update in database
      console.log(`Moving goal ${draggedGoal.id} to position:`, { x, y });
    }
    setDraggedGoal(null);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50"
        >
          −
        </button>
        <div className="px-3 py-2 bg-white rounded-full shadow-lg text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>
        <button 
          onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50"
        >
          +
        </button>
        <button 
          onClick={() => setZoom(1)}
          className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50"
        >
          ⟲
        </button>
      </div>

      {/* Vision Board Canvas */}
      <div 
        ref={canvasRef}
        className="relative w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Connection Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {positionedGoals.map((goal, index) => (
            <line
              key={`line-${goal.id}`}
              x1={400}
              y1={400}
              x2={goal.x + 70}
              y2={goal.y + 70}
              stroke="#e2e8f0"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}
        </svg>

        {/* Center Life Vision */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-center font-bold text-lg shadow-xl">
            Life<br />Vision
          </div>
        </div>

        {/* Goal Nodes */}
        {positionedGoals.map((goal) => {
          const category = categories.find(cat => cat.id === goal.category);
          return (
            <div
              key={goal.id}
              className="absolute w-36 h-36 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl z-20"
              style={{
                left: `${goal.x}px`,
                top: `${goal.y}px`,
                backgroundColor: goal.color,
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, goal)}
              onClick={() => onGoalClick(goal)}
            >
              <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-white text-center p-4">
                <div className="text-2xl mb-1">{category?.icon || '🎯'}</div>
                <div className="text-sm font-semibold leading-tight">
                  {goal.title.length > 20 ? `${goal.title.substring(0, 20)}...` : goal.title}
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white opacity-75"></div>
              <svg className="absolute inset-0 w-full h-full">
                <circle
                  cx="72"
                  cy="72"
                  r="68"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="4"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="68"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 68}`}
                  strokeDashoffset={`${2 * Math.PI * 68 * (1 - goal.progressPercentage / 100)}`}
                  transform="rotate(-90 72 72)"
                  opacity="0.8"
                />
              </svg>
              
              {/* Progress Percentage */}
              <div className="absolute bottom-2 right-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                {goal.progressPercentage}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
        <p className="text-sm text-gray-600">
          Click goals to expand • Drag to rearrange • Use zoom controls to navigate
        </p>
      </div>
    </div>
  );
}