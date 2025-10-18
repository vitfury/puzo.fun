import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { activitiesApi } from '../../api/activities';
import type { Activity, GroupedActivities } from '../../types/activity';
import { ActivityGroup } from './ActivityGroup';
import { useAuth } from '../../contexts/AuthContext';

export function DailyActivityChecklist() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await activitiesApi.getTodayActivities();
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities. Please try again.');
      console.error('Failed to load activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [i18n.language]); // Reload when language changes

  const handleToggle = async (activityId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        const response = await activitiesApi.completeActivity(activityId);

        // Update user points
        if (user) {
          setUser({
            ...user,
            total_points: user.total_points + response.points_earned,
          });
        }
      } else {
        await activitiesApi.uncompleteActivity(activityId);

        // Reload activities to get updated points
        const activity = activities.find(a => a.id === activityId);
        if (user && activity) {
          setUser({
            ...user,
            total_points: user.total_points - activity.points,
          });
        }
      }

      // Update local state
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? { ...activity, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : undefined }
            : activity
        )
      );
    } catch (err) {
      console.error('Failed to toggle activity:', err);
      alert('Failed to update activity. Please try again.');
    }
  };

  const groupedActivities: GroupedActivities = {
    daily_task: activities.filter((a) => a.type === 'daily_task'),
    ongoing_rule: activities.filter((a) => a.type === 'ongoing_rule'),
    music_walk: activities.filter((a) => a.type === 'music_walk'),
  };

  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.is_completed).length;
  const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = activities
    .filter((a) => a.is_completed)
    .reduce((sum, a) => sum + a.points, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">{t('activities.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{t('activities.title')}</h1>
          {user && user.current_streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-900/30 px-4 py-2 rounded-full border border-orange-700">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-sm text-gray-400">{t('profile.currentStreak')}</div>
                <div className="text-xl font-bold text-orange-400">
                  {user.current_streak} {t('profile.days')}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">{t('activities.completed')}</div>
            <div className="text-2xl font-bold text-white">
              {completedActivities}/{totalActivities}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">{t('activities.points')}</div>
            <div className="text-2xl font-bold text-yellow-400">
              {earnedPoints}/{totalPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Groups */}
      <ActivityGroup
        title={t('activities.dailyTasks')}
        activities={groupedActivities.daily_task}
        type="daily_task"
        icon="📝"
        onToggle={handleToggle}
      />

      <ActivityGroup
        title={t('activities.ongoingRules')}
        activities={groupedActivities.ongoing_rule}
        type="ongoing_rule"
        icon="⚡"
        onToggle={handleToggle}
      />

      <ActivityGroup
        title={t('activities.musicWalks')}
        activities={groupedActivities.music_walk}
        type="music_walk"
        icon="🎵"
        onToggle={handleToggle}
      />
    </div>
  );
}
