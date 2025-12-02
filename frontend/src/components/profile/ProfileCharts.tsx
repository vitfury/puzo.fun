import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ComposedChart,
} from 'recharts';
import { profileApi, ProfileChartsData, StreakItem } from '../../api/profile';

type TimeRange = 30 | 60 | 90;

const CHART_COLORS = {
  primary: '#8b5cf6', // Purple
  secondary: '#ec4899', // Pink
  success: '#22c55e', // Green
  warning: '#f59e0b', // Amber
  info: '#3b82f6', // Blue
  danger: '#ef4444', // Red
  accent: '#06b6d4', // Cyan
  gold: '#fbbf24', // Gold for coins
};

// Streak flame colors based on streak length
const getStreakColor = (streak: number): string => {
  if (streak >= 21) return '#ef4444'; // Red fire 🔥
  if (streak >= 14) return '#f97316'; // Orange
  if (streak >= 7) return '#fbbf24'; // Yellow
  if (streak >= 3) return '#84cc16'; // Lime
  return '#94a3b8'; // Gray
};

export const ProfileCharts: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ProfileChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>(60);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const chartsData = await profileApi.getChartsData(timeRange);
        setData(chartsData);
      } catch (err) {
        console.error('Failed to fetch charts data:', err);
        setError('Failed to load charts data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-700 rounded-xl h-64" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-700 rounded-xl p-6 text-center">
        <p className="text-gray-400">{error || 'No data available'}</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">
          📊 {t('profile.charts.title', 'Статистика та прогрес')}
        </h2>
        <div className="flex gap-2">
          {([30, 60, 90] as TimeRange[]).map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                timeRange === days
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {days} {t('profile.days', 'днів')}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon="📈"
          label={t('profile.charts.activityRate', 'Активність')}
          value={`${data.summary.activityRate}%`}
          subtext={`${data.summary.daysWithActivity}/${data.summary.totalDays} ${t('profile.days', 'днів')}`}
          color="purple"
        />
        <SummaryCard
          icon="🎯"
          label={t('profile.charts.totalActivities', 'Завдань')}
          value={data.activities.total.toString()}
          subtext={`~${data.activities.avgPerDay} ${t('profile.charts.perDay', '/день')}`}
          color="pink"
        />
        <SummaryCard
          icon="⚡"
          label={t('profile.charts.xpEarned', 'Досвід')}
          value={data.experience.total.toLocaleString()}
          subtext={`~${data.experience.avgPerDay} XP ${t('profile.charts.perDay', '/день')}`}
          color="blue"
        />
        <SummaryCard
          icon="🪙"
          label={t('profile.charts.coinsNet', 'Монети (нетто)')}
          value={data.coins.net >= 0 ? `+${data.coins.net}` : data.coins.net.toString()}
          subtext={`+${data.coins.totalEarned} / -${data.coins.totalSpent}`}
          color="gold"
        />
      </div>

      {/* Health Progress Section */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            🏥 {t('profile.charts.healthProgress', 'Прогрес здоров\'я')}
          </h3>
          {data.health.trend.weight !== null && (
            <div className="flex gap-4 text-sm">
              <TrendBadge
                label={t('profile.health.weight', 'Вага')}
                value={data.health.trend.weight}
                unit="кг"
                invertColors
              />
              <TrendBadge
                label="BMI"
                value={data.health.trend.bmi}
                unit=""
                invertColors
              />
              <TrendBadge
                label={t('profile.health.waist', 'Талія')}
                value={data.health.trend.waist}
                unit="см"
                invertColors
              />
            </div>
          )}
        </div>

        {data.health.history.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={data.health.history}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
              />
              <YAxis
                yAxisId="weight"
                orientation="left"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <YAxis
                yAxisId="bmi"
                orientation="right"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelFormatter={formatDate}
              />
              <Legend />
              <Area
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                stroke={CHART_COLORS.primary}
                fill="url(#weightGradient)"
                name={t('profile.health.weight', 'Вага') + ' (кг)'}
                connectNulls
              />
              <Line
                yAxisId="bmi"
                type="monotone"
                dataKey="bmi"
                stroke={CHART_COLORS.secondary}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.secondary, r: 3 }}
                name="BMI"
                connectNulls
              />
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="waist"
                stroke={CHART_COLORS.info}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: CHART_COLORS.info, r: 3 }}
                name={t('profile.health.waist', 'Талія') + ' (см)'}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            {t('profile.charts.noHealthData', 'Немає даних про здоров\'я')}
          </div>
        )}
      </div>

      {/* Activities & Streaks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activities Chart */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🎯 {t('profile.charts.dailyActivities', 'Завдань за день')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.activities.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelFormatter={formatDate}
              />
              <Bar
                dataKey="completed"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
                name={t('profile.charts.completed', 'Виконано')}
              >
                {data.activities.daily.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.completed >= 5 ? CHART_COLORS.success : 
                          entry.completed >= 3 ? CHART_COLORS.primary : 
                          entry.completed >= 1 ? CHART_COLORS.info : '#4b5563'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Streaks Visualization */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              🔥 {t('profile.charts.activeStreaks', 'Активні серії')}
            </h3>
            <span className="text-sm text-gray-400">
              {data.streaks.totalActive} {t('profile.charts.active', 'активних')}
            </span>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
            {data.streaks.items.length > 0 ? (
              data.streaks.items.map((streak) => (
                <StreakBar key={streak.activityId} streak={streak} />
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                {t('profile.charts.noStreaks', 'Почніть виконувати завдання для створення серій!')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Experience Chart */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            ⚡ {t('profile.charts.experienceGained', 'Отриманий досвід')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.experience.daily}>
              <defs>
                <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelFormatter={formatDate}
                formatter={(value: number) => [`${value} XP`, t('profile.xp', 'Досвід')]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={CHART_COLORS.info}
                fill="url(#xpGradient)"
                strokeWidth={2}
                name="XP"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Coins Chart */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🪙 {t('profile.charts.coinsFlow', 'Рух монет')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.coins.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelFormatter={formatDate}
              />
              <Legend />
              <Bar
                dataKey="earned"
                fill={CHART_COLORS.success}
                radius={[4, 4, 0, 0]}
                name={t('profile.charts.earned', 'Отримано')}
              />
              <Bar
                dataKey="spent"
                fill={CHART_COLORS.danger}
                radius={[4, 4, 0, 0]}
                name={t('profile.charts.spent', 'Витрачено')}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap (GitHub-style contribution graph) */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📅 {t('profile.charts.activityHeatmap', 'Карта активності')}
        </h3>
        <ActivityHeatmap data={data.activities.daily} />
      </div>
    </div>
  );
};

// Summary Card Component
interface SummaryCardProps {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  color: 'purple' | 'pink' | 'blue' | 'gold' | 'green';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, subtext, color }) => {
  const bgColors = {
    purple: 'from-purple-500/20 to-purple-600/10',
    pink: 'from-pink-500/20 to-pink-600/10',
    blue: 'from-blue-500/20 to-blue-600/10',
    gold: 'from-yellow-500/20 to-yellow-600/10',
    green: 'from-green-500/20 to-green-600/10',
  };

  const textColors = {
    purple: 'text-purple-400',
    pink: 'text-pink-400',
    blue: 'text-blue-400',
    gold: 'text-yellow-400',
    green: 'text-green-400',
  };

  return (
    <div className={`bg-gradient-to-br ${bgColors[color]} rounded-xl p-4 border border-gray-700`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-1">{subtext}</p>
    </div>
  );
};

// Trend Badge Component
interface TrendBadgeProps {
  label: string;
  value: number | null;
  unit: string;
  invertColors?: boolean;
}

const TrendBadge: React.FC<TrendBadgeProps> = ({ label, value, unit, invertColors }) => {
  if (value === null) return null;

  const isPositive = value > 0;
  const isNegative = value < 0;
  
  // For weight/BMI, negative is good (losing weight)
  const isGood = invertColors ? isNegative : isPositive;
  const isBad = invertColors ? isPositive : isNegative;

  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-medium ${isGood ? 'text-green-400' : isBad ? 'text-red-400' : 'text-gray-400'}`}>
        {isPositive ? '+' : ''}{value}{unit}
      </span>
      {isGood && <span className="text-green-400">↓</span>}
      {isBad && <span className="text-red-400">↑</span>}
    </div>
  );
};

// Streak Bar Component
interface StreakBarProps {
  streak: StreakItem;
}

const StreakBar: React.FC<StreakBarProps> = ({ streak }) => {
  const percentage = streak.longestStreak > 0 
    ? Math.min((streak.currentStreak / streak.longestStreak) * 100, 100) 
    : 0;
  const color = getStreakColor(streak.currentStreak);

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1">
        <span className="text-white text-sm truncate max-w-[60%]" title={streak.activityName}>
          {streak.activityName}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">
            🏆 {streak.longestStreak}
          </span>
          <span 
            className="font-bold text-sm"
            style={{ color }}
          >
            🔥 {streak.currentStreak}
          </span>
        </div>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: streak.currentStreak >= 7 ? `0 0 8px ${color}` : 'none'
          }}
        />
      </div>
    </div>
  );
};

// Activity Heatmap Component (GitHub-style)
interface ActivityHeatmapProps {
  data: { date: string; completed: number }[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  // Create a map for quick lookup
  const dataMap = new Map(data.map(d => [d.date, d.completed]));
  
  // Generate last 60 days
  const days: { date: string; value: number; dayOfWeek: number }[] = [];
  const today = new Date();
  
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      value: dataMap.get(dateStr) || 0,
      dayOfWeek: date.getDay(),
    });
  }

  const getColor = (value: number) => {
    if (value === 0) return '#1f2937';
    if (value <= 2) return '#374151';
    if (value <= 4) return '#6366f1';
    if (value <= 6) return '#8b5cf6';
    return '#a855f7';
  };

  // Group by weeks
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  
  days.forEach((day, idx) => {
    currentWeek.push(day);
    if (day.dayOfWeek === 6 || idx === days.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-fit">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className="w-3.5 h-3.5 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-purple-400"
                style={{ backgroundColor: getColor(day.value) }}
                title={`${day.date}: ${day.value} ${day.value === 1 ? 'завдання' : 'завдань'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <span>Менше</span>
        {[0, 2, 4, 6, 8].map((v) => (
          <div
            key={v}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(v) }}
          />
        ))}
        <span>Більше</span>
      </div>
    </div>
  );
};

export default ProfileCharts;

