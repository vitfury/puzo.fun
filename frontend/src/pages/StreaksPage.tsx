import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { activitiesApi, ActivityStreakInfo, StreakSummary, StreakMilestone } from '../api/activities';

export const StreaksPage = () => {
  const { t } = useTranslation();
  const [streaks, setStreaks] = useState<ActivityStreakInfo[]>([]);
  const [summary, setSummary] = useState<StreakSummary | null>(null);
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestones, setShowMilestones] = useState(false);

  useEffect(() => {
    loadStreaks();
  }, []);

  const loadStreaks = async () => {
    try {
      setLoading(true);
      const data = await activitiesApi.getStreaks();
      setStreaks(data.streaks);
      setSummary(data.summary);
      setMilestones(data.milestones);
    } catch (error) {
      console.error('Failed to load streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-yellow-400';
    if (streak >= 14) return 'text-purple-400';
    if (streak >= 7) return 'text-blue-400';
    if (streak >= 3) return 'text-green-400';
    return 'text-gray-400';
  };

  const getStreakBgColor = (streak: number) => {
    if (streak >= 30) return 'bg-yellow-500/20 border-yellow-500/30';
    if (streak >= 14) return 'bg-purple-500/20 border-purple-500/30';
    if (streak >= 7) return 'bg-blue-500/20 border-blue-500/30';
    if (streak >= 3) return 'bg-green-500/20 border-green-500/30';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      daily_task: t('activities.dailyTasks'),
      ongoing_rule: t('activities.ongoingRules'),
      training: t('activities.trainings'),
      music_walk: t('activities.musicWalks'),
    };
    return types[type] || type;
  };

  const getProgressToNextMilestone = (streak: ActivityStreakInfo) => {
    if (!streak.next_milestone) return 100;
    const progress = (streak.current_streak / streak.next_milestone) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400 py-12">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔥 {t('streaks.title', 'Streak Dashboard')}
          </h1>
          <p className="text-gray-400">
            {t('streaks.subtitle', 'Track your daily activity streaks and earn bonus rewards')}
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400">🔥 {summary.max_current_streak}</div>
              <div className="text-sm text-gray-400">{t('streaks.maxStreak', 'Best Streak')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400">⚡ {summary.total_current_streak}</div>
              <div className="text-sm text-gray-400">{t('streaks.totalStreak', 'Total Days')}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">✅ {summary.activities_with_streak}</div>
              <div className="text-sm text-gray-400">{t('streaks.activeStreaks', 'Active Streaks')}</div>
            </div>
            <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-gray-500/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-300">📊 {summary.total_activities}</div>
              <div className="text-sm text-gray-400">{t('streaks.totalActivities', 'Activities')}</div>
            </div>
          </div>
        )}

        {/* Milestones Info Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowMilestones(!showMilestones)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 transition-colors"
          >
            🎯 {t('streaks.viewMilestones', 'View Milestone Bonuses')}
            <span className={`transition-transform ${showMilestones ? 'rotate-180' : ''}`}>▼</span>
          </button>
        </div>

        {/* Milestones Panel */}
        {showMilestones && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              🎯 {t('streaks.milestoneBonuses', 'Streak Milestone Bonuses')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.days}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-center"
                >
                  <div className="text-xl font-bold text-white mb-1">{milestone.days}</div>
                  <div className="text-xs text-gray-400 mb-2">{t('streaks.days', 'days')}</div>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="text-yellow-400"><span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> +{milestone.bonus.coins}</span>
                    <span className="text-purple-400">⚡ +{milestone.bonus.experience}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streaks List */}
        <div className="space-y-4">
          {streaks.map((streak) => (
            <div
              key={streak.activity_id}
              className={`${getStreakBgColor(streak.current_streak)} border rounded-xl p-5 transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white">{streak.activity_name}</h3>
                    <span className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                      {getTypeLabel(streak.activity_type)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span>📅 {t('streaks.totalCompletions', 'Total')}: {streak.total_completions}</span>
                    <span>🏆 {t('streaks.longestStreak', 'Record')}: {streak.longest_streak} {t('streaks.days', 'days')}</span>
                    {streak.last_completed && (
                      <span>⏰ {t('streaks.lastCompleted', 'Last')}: {new Date(streak.last_completed).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getStreakColor(streak.current_streak)}`}>
                    🔥 {streak.current_streak}
                  </div>
                  <div className="text-xs text-gray-400">{t('streaks.currentStreak', 'current')}</div>
                </div>
              </div>

              {/* Progress to next milestone */}
              {streak.next_milestone && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>
                      {t('streaks.nextMilestone', 'Next milestone')}: {streak.next_milestone} {t('streaks.days', 'days')}
                    </span>
                    <span>
                      {streak.days_to_next_milestone} {t('streaks.daysLeft', 'days left')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressToNextMilestone(streak)}%` }}
                    />
                  </div>
                  {streak.next_milestone_bonus && (
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="text-yellow-400"><span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> +{streak.next_milestone_bonus.coins}</span>
                      <span className="text-purple-400">⚡ +{streak.next_milestone_bonus.experience}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Max milestone reached */}
              {!streak.next_milestone && streak.current_streak > 0 && (
                <div className="mt-4 text-center py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <span className="text-yellow-400 font-medium">
                    🏆 {t('streaks.maxMilestoneReached', 'All milestones achieved!')}
                  </span>
                </div>
              )}
            </div>
          ))}

          {streaks.length === 0 && (
            <div className="text-center text-gray-400 py-12 bg-gray-800/30 rounded-xl">
              <div className="text-4xl mb-4">🎯</div>
              <p>{t('streaks.noStreaks', 'Complete activities daily to build your streaks!')}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StreaksPage;

