import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LineChart, Line, Tooltip } from "recharts";
import { TrendingUp, Hash, Calendar } from "lucide-react";

interface GrowthMetrics {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  moodTrends: Array<{ mood: string; count: number; percentage: number }>;
  commonThemes: Array<{ theme: string; frequency: number }>;
  writingFrequency: Array<{ date: string; count: number }>;
}

const moodColors: Record<string, string> = {
  excited: "#f59e0b",
  happy: "#10b981",
  content: "#06b6d4",
  neutral: "#6b7280",
  thoughtful: "#8b5cf6",
  sad: "#3b82f6",
  anxious: "#ef4444",
  frustrated: "#dc2626",
  calm: "#14b8a6",
  energetic: "#f97316",
};

export function GrowthDashboard() {
  const { data: metrics, isLoading } = useQuery<GrowthMetrics>({
    queryKey: ["/api/growth-metrics"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-gray-100/80 dark:bg-gray-800/50 rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Growth Map
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Mood Trends Chart */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Emotional Landscape
          </h3>
          {metrics.moodTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.moodTrends}>
                <XAxis 
                  dataKey="mood" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value} entries (${props.payload.percentage}%)`,
                    'Count'
                  ]}
                />
                <Bar dataKey="count" radius={4}>
                  {metrics.moodTrends.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={moodColors[entry.mood.toLowerCase()] || "#6b7280"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              No mood data yet. Start adding moods to your entries!
            </div>
          )}
        </div>

        {/* Writing Frequency */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Writing Activity
          </h3>
          {metrics.writingFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.writingFrequency.slice(-14)}>
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number) => [`${value} entries`, 'Count']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              Keep writing to see your activity patterns!
            </div>
          )}
        </div>
      </div>

      {/* Common Themes */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4" />
          Your Top Themes
        </h3>
        {metrics.commonThemes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {metrics.commonThemes.slice(0, 8).map((theme, index) => (
              <div 
                key={theme.theme}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center border"
              >
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{theme.frequency}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate" title={theme.theme}>
                  {theme.theme}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            Add tags to your entries to discover patterns in your thoughts and experiences!
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Your Journey:</strong> You've written {metrics.totalEntries} entries, 
          with your longest streak being {metrics.longestStreak} days. 
          {metrics.currentStreak > 0 && (
            <span> Currently on a {metrics.currentStreak}-day streak!</span>
          )}
        </div>
      </div>
    </div>
  );
}